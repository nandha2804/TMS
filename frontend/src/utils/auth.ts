import Cookies from 'js-cookie';
import { User } from '@/types/auth';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  Cookies.set(TOKEN_KEY, token, { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 7 // 7 days
  });
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || Cookies.get(TOKEN_KEY) || null;
}

export function setUser(user: User) {
  const userStr = JSON.stringify(user);
  localStorage.setItem(USER_KEY, userStr);
  Cookies.set(USER_KEY, userStr, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 7
  });
}

export function getUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY) || Cookies.get(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
  Cookies.remove(USER_KEY);
}

export function clearAuth() {
  removeToken();
  removeUser();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Helper function to sync cookie state with localStorage
export function syncAuthState() {
  const token = getToken();
  const user = getUser();
  
  if (token) {
    setToken(token);
  }
  
  if (user) {
    setUser(user);
  }
}