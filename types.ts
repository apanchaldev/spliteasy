
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Participant {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string; // userId
  groupId?: string;
  participants: Participant[];
  category: 'food' | 'rent' | 'travel' | 'entertainment' | 'other';
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // userIds
  avatar?: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  balance: number; // Positive means they owe you, negative means you owe them
}

export interface AppState {
  currentUser: User;
  friends: Friend[];
  groups: Group[];
  expenses: Expense[];
}

export enum Tab {
  DASHBOARD = 'dashboard',
  RECENT = 'recent',
  GROUPS = 'groups',
  FRIENDS = 'friends',
  AI = 'ai'
}
