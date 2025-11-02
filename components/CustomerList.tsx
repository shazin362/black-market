import React from 'react';
import { Customer } from '../types';
import { UserIcon } from './Icons';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
}) => {
  const calculateTotalDue = (customer: Customer) => {
    return customer.transactions
      .filter(t => !t.isPaid)
      .reduce((sum, t) => sum + (t.amount * t.quantity), 0);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md">
        {customers.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <p>No customers yet.</p>
            <p>Click the '+' button to add your first one!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {customers.map((customer) => {
              const totalDue = calculateTotalDue(customer);
              return (
                <li key={customer.id}
                    onClick={() => onSelectCustomer(customer.id)}
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectCustomer(customer.id)}
                    aria-label={`Select customer ${customer.name}`}
                  >
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{customer.name}</p>
                      <p className={`text-sm ${totalDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {totalDue > 0 ? `Owes: ₹${totalDue.toFixed(2)}` : 'All paid up'}
                      </p>
                    </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
  );
};

export default CustomerList;