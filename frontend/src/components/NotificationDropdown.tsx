'use client';

import { useRef, useEffect } from 'react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { XMarkIcon, BellIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NotificationDropdown() {
  const { notifications, markAsRead, removeNotification, unreadCount } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'task_overdue':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'status_update':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type: Notification['type'], read: boolean) => {
    const baseStyle = read ? 'opacity-75' : '';
    switch (type) {
      case 'task_assigned':
        return `${baseStyle} bg-blue-50 hover:bg-blue-100`;
      case 'task_overdue':
        return `${baseStyle} bg-red-50 hover:bg-red-100`;
      case 'status_update':
        return `${baseStyle} bg-green-50 hover:bg-green-100`;
      default:
        return `${baseStyle} bg-gray-50 hover:bg-gray-100`;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="bg-white rounded-lg shadow-lg overflow-hidden w-full sm:w-96 max-h-[80vh] flex flex-col ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out scale-95 animate-in fade-in"
    >
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm font-medium text-gray-900">No notifications</p>
            <p className="mt-1 text-sm text-gray-500">
              When you receive notifications, they'll show up here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 flex items-start space-x-3 cursor-pointer ${getNotificationStyle(
                  notification.type,
                  notification.read
                )}`}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-gray-900 ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {notification.taskId && (
                    <Link
                      href={`/tasks/${notification.taskId}`}
                      className="mt-2 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-900"
                    >
                      View Task →
                    </Link>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}