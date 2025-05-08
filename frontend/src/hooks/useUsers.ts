import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { User } from '@/types/auth';
import { usersApi } from '@/utils/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await usersApi.getAll();
      setUsers(data);
      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch users';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      setIsLoading(true);
      await usersApi.update(userId, updates);
      toast.success('User updated successfully');
      await fetchUsers(); // Refresh users list
      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to update user';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      return await usersApi.getProfile();
    } catch (err: any) {
      const message = err.message || 'Failed to fetch profile';
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback((userId: string) => {
    return users.find(user => user.id === userId);
  }, [users]);

  const getUsersByIds = useCallback((userIds: string[]) => {
    return users.filter(user => userIds.includes(user.id));
  }, [users]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUser,
    fetchProfile,
    getUserById,
    getUsersByIds,
  };
}