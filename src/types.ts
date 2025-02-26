export interface Participant {
  id: string;
  name: string;
}

export interface ExpenseSplit {
  user_id: string;
  percentage: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  paid_by?: string;
  participants: string[];
  splits?: Split[];
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  participants: Participant[];
  expenses: Expense[];
}

export interface User {
  id: string;
  name: string;
}

export interface Split {
  user_id: string;
  percentage: number;
}

export interface Balance {
  user1: string;
  user2: string;
  amount: number;
}