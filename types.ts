
export interface SearchEvent {
  id: string;
  performerId: string;
  query: string;
  timestamp: number;
  deviceName?: string;
  location?: string;
}

export interface Performer {
  id: string;
  name: string;
  username: string;
  status: 'active' | 'suspended';
  createdAt: number;
  totalSearches: number;
  lastActive?: number;
}

export interface User {
  id: string;
  email: string;
  performerId?: string;
  role: 'performer' | 'admin';
  fcmToken?: string;
  createdAt?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export enum AppRoute {
  HOME = '/',
  LOGIN = '/login',
  DASHBOARD = '/dashboard',
  ADMIN = '/admin',
  SEARCH = '/search/:performerId'
}
