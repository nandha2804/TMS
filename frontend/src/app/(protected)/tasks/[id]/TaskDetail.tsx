'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { TaskData } from '@/types/auth';
import { toast } from 'react-hot-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { tasksApi } from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';

type TaskUpdateData = Partial<Omit<TaskData, 'assignee'> & { assigneeId?: string }>;

interface TaskDetailProps {
  id: string;
}

export default function TaskDetail({ id }: TaskDetailProps) {
  const router = useRouter();
  const { updateTask, deleteTask } = useTasks();
  const { users } = useUsers();
  const { handleStatusUpdate, handleTaskAssigned } = useNotifications();
  const [task, setTask] = useState<TaskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TaskUpdateData>({});

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const data = await tasksApi.getById(id);
        if (data) {
          setTask(data);
          setFormData({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate,
            assigneeId: data.assignee._id,
          });
        } else {
          toast.error('Task not found');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to load task details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdate = async () => {
    if (!task) return;
    try {
      const success = await updateTask(id, formData);
      if (success) {
        toast.success('Task updated successfully');
        setIsEditing(false);

        // Handle notifications
        if (formData.status !== task.status) {
          handleStatusUpdate(task, task.status);
        }

        if (formData.assigneeId && formData.assigneeId !== task.assignee._id) {
          const newAssignee = users?.find(u => u._id === formData.assigneeId);
          if (newAssignee) {
            handleTaskAssigned({ ...task, assignee: newAssignee });
          }
        }

        // Refresh task data
        const updatedData = await tasksApi.getById(id);
        if (updatedData) {
          setTask(updatedData);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteTask(id);
      if (success) {
        toast.success('Task deleted successfully');
        router.push('/tasks');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Task not found</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  The task you're looking for might have been deleted or doesn't exist.
                </p>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => router.push('/tasks')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xl font-bold"
                  placeholder="Task Title"
                />
              ) : (
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {task.title}
                </h2>
              )}
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Task
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                {isEditing ? (
                  <select
                    value={formData.status || task.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as TaskData['status'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Priority</dt>
              <dd className="mt-1">
                {isEditing ? (
                  <select
                    value={formData.priority || task.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as TaskData['priority'] })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1">
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={new Date(formData.dueDate || task.dueDate).toISOString().slice(0, 16)}
                    onChange={e => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  new Date(task.dueDate).toLocaleString()
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Assignee</dt>
              <dd className="mt-1">
                {isEditing ? (
                  <select
                    value={formData.assigneeId || task.assignee._id}
                    onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    {users?.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  task.assignee.name
                )}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1">
                {isEditing ? (
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{task.description || 'No description provided'}</p>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 sm:px-6">
          <div className="text-sm text-gray-500 flex justify-between">
            <span>Created by {task.creator.name}</span>
            <span>Last updated: {new Date(task.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}