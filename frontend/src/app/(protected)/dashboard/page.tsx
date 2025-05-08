'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { TaskStats } from '@/types/auth';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { tasks, isLoading: tasksLoading, error: tasksError, fetchTasks, fetchTaskStats } = useTasks();
  const { fetchUsers, isLoading: usersLoading, error: usersError } = useUsers();
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const taskStats = await fetchTaskStats();
      if (taskStats) {
        setStats(taskStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError('Failed to load task statistics');
      toast.error('Failed to load task statistics');
    } finally {
      setIsLoadingStats(false);
    }
  }, [fetchTaskStats]);

  const loadDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        fetchTasks({ limit: 5 }).catch(err => {
          console.error('Error fetching tasks:', err);
          toast.error('Failed to load tasks');
          return null;
        }),
        fetchUsers().catch(err => {
          console.error('Error fetching users:', err);
          toast.error('Failed to load users');
          return null;
        }),
        loadStats().catch(() => null)
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      toast.error('An error occurred while loading the dashboard');
    }
  }, [fetchTasks, fetchUsers, loadStats]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Refresh stats when tasks change
  useEffect(() => {
    if (tasks) {  // Only run if tasks are loaded
      loadStats();
    }
  }, [tasks, loadStats]);

  const isLoading = tasksLoading || usersLoading || isLoadingStats;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (tasksError || usersError || statsError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-600">
        <p className="mb-4">
          {tasksError || usersError || statsError || 'Failed to load dashboard data'}
        </p>
        <button
          onClick={() => loadDashboardData()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-md group">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</div>
            <div className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">{value}</div>
          </div>
          <div className={`flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${color} transition-transform duration-200 transform group-hover:scale-110`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-700">
            A quick overview of your tasks and recent activities
          </p>
        </div>
        <div>
          <Link
            href="/tasks/create"
            className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Task
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <StatCard title="Total Tasks" value={stats.total} color="bg-blue-500" />
        <StatCard title="Completed" value={stats.completed} color="bg-green-500" />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-yellow-500" />
        <StatCard title="Overdue" value={stats.overdue} color="bg-red-500" />
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 sm:py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks?.map((task) => (
            <div key={task._id} className="px-3 py-3 sm:px-6 sm:py-4 hover:bg-gray-50">
              <Link href={`/tasks/${task._id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-indigo-600 truncate">{task.title}</h3>
                    <div className="mt-1 sm:mt-2 flex flex-wrap gap-2 items-center">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <span className="truncate">Assigned to: {task.assignee.name}</span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-xs leading-5 font-medium rounded-full 
                        ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end text-xs sm:text-sm text-gray-500">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </div>
          ))}
          {(!tasks || tasks.length === 0) && (
            <div className="px-4 py-6 sm:py-8 text-center text-gray-500">
              <p className="text-sm sm:text-base">No tasks found. Get started by creating a new task.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}