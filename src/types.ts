export type Role = 'user' | 'admin';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password?: string;
  department: string;
  role: Role;
}

export interface DashboardUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  department: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  assignedTo?: {
    id: number;
    username: string;
  };
}
