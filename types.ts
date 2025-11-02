export interface Transaction {
  id: string;
  productName: string;
  quantity: number;
  amount: number; // Represents price per item
  isPaid: boolean;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  transactions: Transaction[];
}

export interface User {
  username: string;
  passwordHash: string;
  recoveryQuestion: string;
  recoveryAnswerHash: string;
}
