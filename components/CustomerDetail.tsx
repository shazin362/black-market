import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Customer, Transaction } from '../types';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ChevronDownIcon, PlusIcon, LogoutIcon, CogIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from './Icons';

interface CustomerDetailProps {
  customer: Customer;
  onAddTransaction: (customerId: string, productName: string, quantity: number, price: number, date: string) => void;
  onToggleTransactionPaid: (customerId: string, transactionId: string) => void;
  onDeleteTransaction: (customerId: string, transactionId: string) => void;
  onDeselectCustomer: () => void;
  currentUser: string;
  onLogout: () => void;
  onEditProfile: () => void;
  onRenameRequest: () => void;
  onDeleteRequest: () => void;
}

const TransactionItem: React.FC<{ transaction: Transaction; onToggle: () => void; onDelete: () => void; }> = ({ transaction, onToggle, onDelete }) => {
    const total = transaction.quantity * transaction.amount;
    
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            onDelete();
        }
    };

    return (
        <div className={`flex items-start justify-between p-4 rounded-lg transition-colors ${transaction.isPaid ? 'bg-green-50 dark:bg-green-900/20 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-800/50'}`}>
            <div className="flex-grow">
                <p className={`font-medium ${transaction.isPaid ? 'line-through' : 'text-gray-800 dark:text-gray-100'}`}>{transaction.productName}</p>
                <p className="text-sm">
                    {transaction.quantity} &times; ₹{transaction.amount.toFixed(2)} = <span className="font-semibold">₹{total.toFixed(2)}</span>
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete Transaction"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={onToggle} 
                    className={`p-2 rounded-full transition-transform transform hover:scale-110 ${transaction.isPaid ? 'text-green-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    aria-label={transaction.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                    {transaction.isPaid ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

const AddTransactionForm: React.FC<{ onAdd: (productName: string, quantity: number, price: number, date: string) => void; onCancel: () => void; }> = ({ onAdd, onCancel }) => {
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseInt(quantity, 10);
        const numPrice = parseFloat(price);
        if (productName.trim() && !isNaN(numQuantity) && numQuantity > 0 && !isNaN(numPrice) && numPrice > 0) {
            onAdd(productName.trim(), numQuantity, numPrice, date);
            onCancel(); // Close form on successful add
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Product/Service description"
                className="md:col-span-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
            />
            <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Price per item (₹)"
                step="0.01"
                min="0.01"
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
            />
            <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Quantity"
                step="1"
                min="1"
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
            />
             <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="md:col-span-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
            />
            <div className="md:col-span-2 flex justify-end gap-3">
                 <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-rose-700 transition-colors">
                    Add Transaction
                </button>
            </div>
        </form>
    );
};

const DateTransactionGroup: React.FC<{
  date: string;
  transactions: Transaction[];
  onToggleTransactionPaid: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
}> = ({ date, transactions, onToggleTransactionPaid, onDeleteTransaction }) => {
  const [isOpen, setIsOpen] = useState(true);

  const dailyTotal = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.amount * t.quantity), 0);
  }, [transactions]);
  
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center p-4 text-left"
            aria-expanded={isOpen}
        >
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{formattedDate}</p>
                <p className="text-sm text-gray-500">{transactions.length} items totalling ₹{dailyTotal.toFixed(2)}</p>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
            <div className="px-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-800">
                {transactions.map(transaction => (
                    <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction} 
                        onToggle={() => onToggleTransactionPaid(transaction.id)}
                        onDelete={() => onDeleteTransaction(transaction.id)}
                    />
                ))}
            </div>
        )}
    </div>
  );
};

const CustomerActions: React.FC<{ onRename: () => void; onDelete: () => void; }> = ({ onRename, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Customer Actions"
        >
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <ul className="py-1">
              <li>
                <button 
                  onClick={() => { onRename(); setIsOpen(false); }} 
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" /> Rename
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onDelete(); setIsOpen(false); }} 
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" /> Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };


const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onAddTransaction, onToggleTransactionPaid, onDeleteTransaction, onDeselectCustomer, currentUser, onLogout, onEditProfile, onRenameRequest, onDeleteRequest }) => {
  const [isAdding, setIsAdding] = useState(false);

  const stats = useMemo(() => {
      const totalDue = customer.transactions
          .filter(t => !t.isPaid)
          .reduce((sum, t) => sum + (t.amount * t.quantity), 0);

      const totalSpent = customer.transactions
          .reduce((sum, t) => sum + (t.amount * t.quantity), 0);
      
      return { totalDue, totalSpent };
  }, [customer.transactions]);

  const handleAdd = (productName: string, quantity: number, price: number, date: string) => {
    onAddTransaction(customer.id, productName, quantity, price, date);
  };

  const groupedTransactions = useMemo(() => {
    return customer.transactions.reduce((acc, tx) => {
      const dateKey = tx.date.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [customer.transactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedTransactions]);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-950">
        <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
                <button 
                    onClick={onDeselectCustomer}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{customer.name}</h2>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 hidden sm:block">Welcome, {currentUser}</p>
                <button
                    onClick={onEditProfile}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Edit Profile"
                >
                    <CogIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Logout"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
                <CustomerActions onRename={onRenameRequest} onDelete={onDeleteRequest} />
            </div>
        </header>
        
        <main className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
                    <h3 className="text-sm text-gray-500">Total Due</h3>
                    <p className="text-2xl font-bold text-red-500">₹{stats.totalDue.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
                    <h3 className="text-sm text-gray-500">Total Spent</h3>
                    <p className="text-2xl font-bold text-green-500">₹{stats.totalSpent.toFixed(2)}</p>
                </div>
            </div>

            {isAdding ? (
                <AddTransactionForm onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
            ) : (
                <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors shadow">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add New Transaction</span>
                </button>
            )}


            <h3 className="text-lg font-semibold pt-4">Transaction History</h3>
            {customer.transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions for this customer yet.</p>
            ) : (
                <div className="space-y-4">
                  {sortedDates.map(date => (
                    <DateTransactionGroup 
                      key={date}
                      date={date}
                      transactions={groupedTransactions[date]}
                      onToggleTransactionPaid={(transactionId) => onToggleTransactionPaid(customer.id, transactionId)}
                      onDeleteTransaction={(transactionId) => onDeleteTransaction(customer.id, transactionId)}
                    />
                  ))}
                </div>
            )}
        </main>
    </div>
  );
};

export default CustomerDetail;
