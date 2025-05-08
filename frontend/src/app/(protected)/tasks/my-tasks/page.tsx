'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTasks } from '@/hooks/useTasks';
import { TaskData } from '@/types/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'assigned';
  const { tasks, isLoading, fetchUserTasks } = useTasks();

  useEffect(() => {
    fetchUserTasks(type as 'assigned' | 'created');
  }, [type, fetchUserTasks]);

  const getStatusColor = (status: TaskData['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskData['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
            {type === 'assigned' ? 'Tasks Assigned to Me' : 'Tasks Created by Me'}
          </h1>
          <div className="flex space-x-3">
            <Link
              href="/tasks/my-tasks?type=assigned"
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                type === 'assigned'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Assigned to Me
            </Link>
            <Link
              href="/tasks/my-tasks?type=created"
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                type === 'created'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Created by Me
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li 
                  key={task._id}
                  onClick={() => router.push(`/tasks/${task._id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {type === 'assigned' 
                            ? `Created by ${task.creator.name}`
                            : `Assigned to ${task.assignee.name}`}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Due {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  No tasks found.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}