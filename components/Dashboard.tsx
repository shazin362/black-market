import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { PlusIcon, UserIcon, LogoutIcon, CogIcon } from './Icons';
import CustomerList from './CustomerList';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md flex items-center gap-4">
        <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const AddCustomerModal: React.FC<{ onAdd: (name: string) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim());
            // No need to close here, App will switch view
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" role="dialog" aria-modal="true">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold">Add New Customer</h3>
                        <p className="text-sm text-gray-500 mt-1">Enter the name of the new customer below.</p>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="w-full mt-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-rose-700 transition-colors">
                            Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DashboardProps {
    customers: Customer[];
    onSelectCustomer: (id: string) => void;
    onAddCustomer: (name: string) => void;
    currentUser: string;
    onLogout: () => void;
    onEditProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ customers, onSelectCustomer, onAddCustomer, currentUser, onLogout, onEditProfile }) => {
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);

    const stats = useMemo(() => {
        const totalDebt = customers.reduce((total, customer) => {
            const customerDebt = customer.transactions
                .filter(t => !t.isPaid)
                .reduce((sum, t) => sum + (t.amount * t.quantity), 0);
            return total + customerDebt;
        }, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueLast30Days = customers.reduce((total, customer) => {
            const customerRevenue = customer.transactions
                .filter(t => t.isPaid && new Date(t.date) >= thirtyDaysAgo)
                .reduce((sum, t) => sum + (t.amount * t.quantity), 0);
            return total + customerRevenue;
        }, 0);
        
        return { totalDebt, revenueLast30Days };
    }, [customers]);

    const customersWithDebt = useMemo(() => {
        return customers
            .map(customer => ({
                ...customer,
                due: customer.transactions
                    .filter(t => !t.isPaid)
                    .reduce((sum, t) => sum + (t.amount * t.quantity), 0)
            }))
            .filter(c => c.due > 0)
            .sort((a, b) => b.due - a.due);
    }, [customers]);

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Overview</h1>
                    <p className="text-sm text-gray-500">Welcome, {currentUser}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEditProfile}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Edit Profile"
                    >
                        <CogIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        aria-label="Logout"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-6 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Total Outstanding Debt" value={`₹${stats.totalDebt.toFixed(2)}`} icon={<UserIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />} />
                    <StatCard title="Total Customers" value={customers.length.toString()} icon={<UserIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />} />
                    <StatCard title="Revenue (Last 30 days)" value={`₹${stats.revenueLast30Days.toFixed(2)}`} icon={<UserIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Customers with Debt</h2>
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md">
                            {customersWithDebt.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {customersWithDebt.map(customer => (
                                        <li key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-red-500 font-semibold">₹{customer.due.toFixed(2)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-8 text-center text-gray-500">No customers have outstanding debt. Great work!</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">All Customers</h2>
                         <CustomerList 
                            customers={customers}
                            onSelectCustomer={onSelectCustomer}
                         />
                    </div>
                </div>
            </main>

            <button
                onClick={() => setIsAddingCustomer(true)}
                className="fixed bottom-6 right-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                aria-label="Add new customer"
            >
                <PlusIcon className="w-6 h-6" />
            </button>

            {isAddingCustomer && <AddCustomerModal onAdd={onAddCustomer} onClose={() => setIsAddingCustomer(false)} />}
        </div>
    );
};

export default Dashboard;