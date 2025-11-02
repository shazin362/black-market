import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Transaction, User } from './types';
import CustomerDetail from './components/CustomerDetail';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';

const EditProfileModal: React.FC<{
  currentUser: string;
  onClose: () => void;
  onUpdateUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
}> = ({ currentUser, onClose, onUpdateUsername }) => {
  const [newUsername, setNewUsername] = useState(currentUser);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    const result = await onUpdateUsername(newUsername);
    if (!result.success) {
      setError(result.error || 'An unknown error occurred.');
    }
    // On success, the modal is closed by the parent component.
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 id="edit-profile-title" className="text-lg font-semibold">Edit Username</h3>
            <p className="text-sm text-gray-500 mt-1">Change the username associated with your account.</p>
            {error && <p className="text-sm text-red-500 bg-red-100/50 dark:bg-red-900/20 p-2 rounded-md mt-4">{error}</p>}
            <div className="mt-4">
              <label htmlFor="new-username" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Username</label>
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
                required
              />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:bg-rose-400">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RenameCustomerModal: React.FC<{
    customer: Customer;
    onClose: () => void;
    onRename: (newName: string) => void;
    isSaving: boolean;
}> = ({ customer, onClose, onRename, isSaving }) => {
    const [newName, setNewName] = useState(customer.name);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onRename(newName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="rename-customer-title">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 id="rename-customer-title" className="text-lg font-semibold">Rename Customer</h3>
                        <p className="text-sm text-gray-500 mt-1">Enter a new name for <span className="font-medium">{customer.name}</span>.</p>
                        <div className="mt-4">
                            <label htmlFor="new-customer-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Name</label>
                            <input
                                id="new-customer-name"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                autoFocus
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:bg-rose-400">
                            {isSaving ? 'Renaming...' : 'Rename'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteCustomerModal: React.FC<{
    customer: Customer;
    onClose: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}> = ({ customer, onClose, onDelete, isDeleting }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="delete-customer-title">
                <div className="p-6">
                    <h3 id="delete-customer-title" className="text-lg font-semibold">Delete Customer</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Are you sure you want to delete <span className="font-medium">{customer.name}</span>? All of their transaction history will be permanently removed. This action cannot be undone.
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={isDeleting} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onDelete} disabled={isDeleting} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:bg-red-400">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [customerToRename, setCustomerToRename] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  // Check for logged in user on initial load
  useEffect(() => {
    try {
      const loggedInUser = sessionStorage.getItem('debtBookCurrentUser');
      if (loggedInUser) {
        setCurrentUser(loggedInUser);
      }
    } catch (error) {
        console.error("Failed to check session storage", error);
    }
  }, []);

  // Load customer data when user logs in
  useEffect(() => {
    if (!currentUser) {
      setCustomers([]); // Clear data if no user is logged in
      return;
    }
    try {
      const storedCustomers = localStorage.getItem(`debtBookData_${currentUser}`);
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      } else {
        setCustomers([]); // Start with empty list for new or empty users
      }
    } catch (error) {
      console.error("Failed to load customers from local storage", error);
    }
  }, [currentUser]);

  // Save customer data when it changes
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`debtBookData_${currentUser}`, JSON.stringify(customers));
    } catch (error) {
      console.error("Failed to save customers to local storage", error);
    }
  }, [customers, currentUser]);

  const handleLoginSuccess = useCallback((username: string) => {
    setCurrentUser(username);
    sessionStorage.setItem('debtBookCurrentUser', username);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedCustomerId(null);
    sessionStorage.removeItem('debtBookCurrentUser');
  }, []);

  const handleUpdateUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = newUsername.trim();
    if (!currentUser) {
        return { success: false, error: "No user is logged in." };
    }
    if (trimmedUsername.toLowerCase() === currentUser.toLowerCase()) {
        setIsEditingProfile(false);
        return { success: true }; // No change needed
    }
    if (!trimmedUsername) {
        return { success: false, error: "Username cannot be empty." };
    }

    try {
        const usersJSON = localStorage.getItem('debtBookUsers');
        const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];

        if (users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
            return { success: false, error: "This username is already taken." };
        }

        const oldUsername = currentUser;
        const updatedUsers = users.map(u => u.username === oldUsername ? { ...u, username: trimmedUsername } : u);
        
        const customerData = localStorage.getItem(`debtBookData_${oldUsername}`);

        // Perform the switch
        localStorage.setItem('debtBookUsers', JSON.stringify(updatedUsers));
        if (customerData) {
            localStorage.setItem(`debtBookData_${trimmedUsername}`, customerData);
            localStorage.removeItem(`debtBookData_${oldUsername}`);
        }

        // Update app state
        setCurrentUser(trimmedUsername);
        sessionStorage.setItem('debtBookCurrentUser', trimmedUsername);
        setIsEditingProfile(false); // Close modal on success

        return { success: true };
    } catch (error) {
        console.error("Failed to update username:", error);
        return { success: false, error: "An unexpected error occurred while updating." };
    }
  };

  const handleAddCustomer = useCallback((name: string) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name,
      transactions: [],
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    setSelectedCustomerId(newCustomer.id); // Select the new customer immediately
  }, [customers]);

  const handleRenameCustomer = useCallback((customerId: string, newName: string) => {
    setIsSaving(true);
    setCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, name: newName } : c))
    );
    setCustomerToRename(null);
    setIsSaving(false);
  }, []);
  
  const handleDeleteCustomer = useCallback((customerId: string) => {
    setIsSaving(true);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setSelectedCustomerId(null); // Go back to dashboard
    setCustomerToDelete(null);
    setIsSaving(false);
  }, []);

  const handleSelectCustomer = useCallback((id: string) => {
    setSelectedCustomerId(id);
  }, []);
  
  const handleDeselectCustomer = useCallback(() => {
    setSelectedCustomerId(null);
  }, []);

  const handleAddTransaction = useCallback((
    customerId: string, 
    productName: string, 
    quantity: number,
    price: number,
    date: string
  ) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      productName,
      quantity,
      amount: price,
      isPaid: false,
      date: new Date(date + 'T00:00:00').toISOString(),
    };
    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? { ...c, transactions: [newTransaction, ...c.transactions] } // Add to the top
        : c
    ));
  }, []);

  const handleToggleTransactionPaid = useCallback((customerId: string, transactionId: string) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? {
            ...c,
            transactions: c.transactions.map(t =>
              t.id === transactionId ? { ...t, isPaid: !t.isPaid } : t
            ),
          }
        : c
    ));
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;
  
  if (!currentUser) {
    return (
        <div className="h-screen w-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 flex items-center justify-center">
            <Auth onLoginSuccess={handleLoginSuccess} />
        </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      {isEditingProfile && currentUser && (
        <EditProfileModal 
          currentUser={currentUser}
          onClose={() => setIsEditingProfile(false)}
          onUpdateUsername={handleUpdateUsername}
        />
      )}
      {customerToRename && (
        <RenameCustomerModal
            customer={customerToRename}
            onClose={() => setCustomerToRename(null)}
            onRename={(newName) => handleRenameCustomer(customerToRename.id, newName)}
            isSaving={isSaving}
        />
      )}
      {customerToDelete && (
        <DeleteCustomerModal
            customer={customerToDelete}
            onClose={() => setCustomerToDelete(null)}
            onDelete={() => handleDeleteCustomer(customerToDelete.id)}
            isDeleting={isSaving}
        />
      )}
      <div className="max-w-7xl mx-auto h-full">
        {selectedCustomer ? (
          <CustomerDetail
            customer={selectedCustomer}
            onAddTransaction={handleAddTransaction}
            onToggleTransactionPaid={handleToggleTransactionPaid}
            onDeselectCustomer={handleDeselectCustomer}
            currentUser={currentUser}
            onLogout={handleLogout}
            onEditProfile={() => setIsEditingProfile(true)}
            onRenameRequest={() => setCustomerToRename(selectedCustomer)}
            onDeleteRequest={() => setCustomerToDelete(selectedCustomer)}
          />
        ) : (
          <Dashboard
            customers={customers}
            onSelectCustomer={handleSelectCustomer}
            onAddCustomer={handleAddCustomer}
            currentUser={currentUser}
            onLogout={handleLogout}
            onEditProfile={() => setIsEditingProfile(true)}
          />
        )}
      </div>
    </div>
  );
};

export default App;