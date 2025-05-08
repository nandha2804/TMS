'use client';

import { useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function OverdueTasksPage() {
  const { tasks, fetchOverdueTasks, isLoading } = useTasks();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await fetchOverdueTasks();
      } catch (error) {
        toast.error('Failed to load overdue tasks');
      }
    };

    loadTasks();
  }, [fetchOverdueTasks]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Overdue Tasks</h1>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task._id}>
                  <Link href={`/tasks/${task._id}`}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Overdue
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Assigned to {task.assignee.name}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-red-600 sm:mt-0">
                            Due date passed: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Created by {task.creator.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  No overdue tasks found.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}