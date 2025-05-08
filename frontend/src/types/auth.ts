export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  _id: string;  // Keep both for compatibility
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface ValidationErrors {
  email?: string[];
  password?: string[];
  name?: string[];
  global?: string[];
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface TaskData {
  _id: string;
  id: string; // Add for consistency
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  creator: User;
  assignee: User;
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in_progress' | 'completed';
  assigneeId?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  creator?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  limit?: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}