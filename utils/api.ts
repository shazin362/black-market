import { User, Customer, Transaction } from '../types';
import { hashString } from './crypto';

// --- DATABASE SIMULATION ---
// We use localStorage for persistence across reloads, but the API will treat it 
// as if it were a remote server database. This centralizes all data access.

interface Database {
  users: User[];
  customers: Record<string, Customer[]>; // Keyed by username
}

const db: Database = {
  users: [],
  customers: {}
};

// Initialize DB from localStorage on script load
const initDb = () => {
  try {
    const storedUsers = localStorage.getItem('debtBookUsers');
    if (storedUsers) {
      db.users = JSON.parse(storedUsers);
    }
    // Load customer data for all users
    db.users.forEach(user => {
      const storedCustomers = localStorage.getItem(`debtBookData_${user.username}`);
      db.customers[user.username] = storedCustomers ? JSON.parse(storedCustomers) : [];
    });
  } catch (e) {
    console.error("Failed to initialize DB from localStorage", e);
  }
};
initDb();

const persistUsers = () => localStorage.setItem('debtBookUsers', JSON.stringify(db.users));
const persistCustomers = (username: string) => {
    if (db.customers[username]) {
        localStorage.setItem(`debtBookData_${username}`, JSON.stringify(db.customers[username]));
    }
};
const removeCustomerData = (username: string) => localStorage.removeItem(`debtBookData_${username}`);

// --- API SIMULATION ---
// Simulate network delay to mimic real-world async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.random() * 400 + 100);

// Helper to "validate" token and get username. In a real app, this would be a proper JWT verification.
const getUsernameFromToken = (token: string): string | null => {
  try {
    const username = atob(token);
    return db.users.some(u => u.username === username) ? username : null;
  } catch {
    return null;
  }
};

// --- AUTH API ---

export const login = async (username: string, password: string): Promise<{ token: string, username: string }> => {
    await randomDelay();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
        throw new Error("User not found.");
    }
    const passwordHash = await hashString(password);
    if (user.passwordHash !== passwordHash) {
        throw new Error("Incorrect password.");
    }
    const token = btoa(user.username); // Simple Base64 encoding for simulation
    return { token, username: user.username };
};

export const register = async (userData: Omit<User, 'passwordHash' | 'recoveryAnswerHash'> & { password: string, recoveryAnswer: string }): Promise<{ token: string, username: string }> => {
    await randomDelay();
    if (db.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        throw new Error("Username is already taken.");
    }
    const passwordHash = await hashString(userData.password);
    const recoveryAnswerHash = await hashString(userData.recoveryAnswer.toLowerCase());
    const newUser: User = {
        username: userData.username,
        recoveryQuestion: userData.recoveryQuestion,
        passwordHash,
        recoveryAnswerHash
    };
    db.users.push(newUser);
    db.customers[newUser.username] = [];
    persistUsers();
    persistCustomers(newUser.username);
    
    const token = btoa(newUser.username);
    return { token, username: newUser.username };
};

export const findUserForRecovery = async (username: string): Promise<User> => {
    await randomDelay();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
        throw new Error("User not found.");
    }
    return user;
};

export const verifyRecoveryAnswer = async (username: string, answer: string): Promise<boolean> => {
    await randomDelay();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    const answerHash = await hashString(answer.toLowerCase());
    if (!user || user.recoveryAnswerHash !== answerHash) {
        throw new Error("The answer to your security question is incorrect.");
    }
    return true;
};

export const resetPassword = async (username: string, newPassword: string):Promise<void> => {
    await randomDelay();
    const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
        throw new Error("User not found.");
    }
    db.users[userIndex].passwordHash = await hashString(newPassword);
    persistUsers();
};

export const updateUsername = async (token: string, newUsername: string): Promise<{ newToken: string, newUsername: string }> => {
    await randomDelay();
    const oldUsername = getUsernameFromToken(token);
    if (!oldUsername) {
        throw new Error("Invalid session. Please log in again.");
    }
    if (db.users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
        throw new Error("This username is already taken.");
    }

    const userIndex = db.users.findIndex(u => u.username === oldUsername);
    db.users[userIndex].username = newUsername;

    // Migrate customer data
    db.customers[newUsername] = db.customers[oldUsername] || [];
    delete db.customers[oldUsername];

    // Persist changes
    persistUsers();
    persistCustomers(newUsername);
    removeCustomerData(oldUsername);

    const newToken = btoa(newUsername);
    return { newToken, newUsername };
};

// --- CUSTOMER DATA API ---

export const getCustomers = async (token: string): Promise<Customer[]> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) {
        throw new Error("Unauthorized");
    }
    return [...(db.customers[username] || [])];
};

export const addCustomer = async (token: string, name: string): Promise<Customer> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) throw new Error("Unauthorized");

    const newCustomer: Customer = { id: Date.now().toString(), name, transactions: [] };
    db.customers[username].push(newCustomer);
    persistCustomers(username);
    return newCustomer;
};

export const renameCustomer = async (token: string, customerId: string, newName: string): Promise<Customer> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) throw new Error("Unauthorized");

    const customerIndex = db.customers[username].findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    
    db.customers[username][customerIndex].name = newName;
    persistCustomers(username);
    return db.customers[username][customerIndex];
};

export const deleteCustomer = async (token: string, customerId: string): Promise<void> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) throw new Error("Unauthorized");

    db.customers[username] = db.customers[username].filter(c => c.id !== customerId);
    persistCustomers(username);
};

export const addTransaction = async (token: string, customerId: string, txData: { productName: string; quantity: number; price: number; date: string; }): Promise<Transaction> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) throw new Error("Unauthorized");
    
    const customerIndex = db.customers[username].findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    const customer = db.customers[username][customerIndex];

    const newTransaction: Transaction = {
        id: Date.now().toString(),
        productName: txData.productName,
        quantity: txData.quantity,
        amount: txData.price,
        isPaid: false,
        date: new Date(txData.date + 'T00:00:00').toISOString(),
    };
    
    const updatedTransactions = [newTransaction, ...customer.transactions];
    db.customers[username][customerIndex] = { ...customer, transactions: updatedTransactions };

    persistCustomers(username);
    return newTransaction;
};

export const toggleTransactionPaid = async (token: string, customerId: string, transactionId: string): Promise<Transaction> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) throw new Error("Unauthorized");
    
    const customerIndex = db.customers[username].findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    const customer = db.customers[username][customerIndex];

    let updatedTransaction: Transaction | undefined;
    const updatedTransactions = customer.transactions.map(t => {
        if (t.id === transactionId) {
            updatedTransaction = { ...t, isPaid: !t.isPaid };
            return updatedTransaction;
        }
        return t;
    });

    if (!updatedTransaction) {
        throw new Error("Transaction not found");
    }
    
    db.customers[username][customerIndex] = { ...customer, transactions: updatedTransactions };
    persistCustomers(username);
    return updatedTransaction;
};

export const deleteTransaction = async (token: string, customerId: string, transactionId: string): Promise<void> => {
    await randomDelay();
    const username = getUsernameFromToken(token);
    if (!username) throw new Error("Unauthorized");
    
    const customerIndex = db.customers[username].findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    const customer = db.customers[username][customerIndex];

    const transactionIndex = customer.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) throw new Error("Transaction not found");

    const updatedTransactions = customer.transactions.filter(t => t.id !== transactionId);
    db.customers[username][customerIndex] = { ...customer, transactions: updatedTransactions };
    persistCustomers(username);
};
