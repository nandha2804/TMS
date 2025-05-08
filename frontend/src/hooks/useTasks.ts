import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { TaskData, TaskFilters, CreateTaskData } from '@/types/auth';
import { tasksApi } from '@/utils/api';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeRequests, setActiveRequests] = useState(0);

  const startRequest = useCallback(() => {
    setActiveRequests(prev => prev + 1);
    setIsLoading(true);
  }, []);

  const endRequest = useCallback(() => {
    setActiveRequests(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsLoading(false);
      }
      return newCount;
    });
  }, []);

  const fetchTaskStats = useCallback(async () => {
    try {
      startRequest();
      const stats = await tasksApi.getStats();
      return stats;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch task statistics';
      toast.error(message);
      return null;
    } finally {
      endRequest();
    }
  }, [startRequest, endRequest]);

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    try {
      startRequest();
      setError(null);
      const data = await tasksApi.getAll(filters);
      setTasks(data);
      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch tasks';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      endRequest();
    }
  }, [startRequest, endRequest]);

  const createTask = useCallback(async (taskData: CreateTaskData) => {
    try {
      setIsLoading(true);
      await tasksApi.create(taskData);
      toast.success('Task created successfully');
      const [updatedTasks] = await Promise.all([
        fetchTasks(), // Refresh tasks list
        fetchTaskStats(), // Update stats
      ]);
      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to create task';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchTaskStats]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<CreateTaskData>) => {
    try {
      setIsLoading(true);
      await tasksApi.update(taskId, updates);
      toast.success('Task updated successfully');
      const [updatedTasks] = await Promise.all([
        fetchTasks(), // Refresh tasks list
        fetchTaskStats(), // Update stats
      ]);
      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to update task';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchTaskStats]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setIsLoading(true);
      await tasksApi.delete(taskId);
      toast.success('Task deleted successfully');
      const [updatedTasks] = await Promise.all([
        fetchTasks(), // Refresh tasks list
        fetchTaskStats(), // Update stats
      ]);
      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to delete task';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchTaskStats]);

  const fetchUserTasks = useCallback(async (type: 'assigned' | 'created'): Promise<TaskData[]> => {
    try {
      setIsLoading(true);
      const data = await tasksApi.getMyTasks(type);
      setTasks(data);
      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch user tasks';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOverdueTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await tasksApi.getOverdue();
      setTasks(data);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch overdue tasks';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchTaskStats,
    fetchUserTasks,
    fetchOverdueTasks,
  };
}