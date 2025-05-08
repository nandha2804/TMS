'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { TaskData } from '@/types/auth';

export interface Notification {
  id: string;
  message: string;
  type: 'task_assigned' | 'task_overdue' | 'status_update';
  createdAt: Date;
  read: boolean;
  taskId?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      // Skip API call if notifications endpoint is not ready
      // This prevents 404 errors while the backend is being developed
      if (process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED !== 'true') {
        return;
      }

      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      // Silently handle error when notifications API is not available
      if (!(error instanceof TypeError)) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(count => count + 1);
    }

    // Show toast notification
    const toastConfig = { id: notification.id, duration: 5000 };
    
    switch (notification.type) {
      case 'task_assigned':
        toast.success(notification.message, toastConfig);
        break;
      case 'task_overdue':
        toast.error(notification.message, toastConfig);
        break;
      case 'status_update':
        if (notification.message.includes('completed')) {
          toast.success(notification.message, toastConfig);
        } else {
          toast(notification.message, toastConfig);
        }
        break;
    }
  }, []);

  const checkOverdueTasks = useCallback((tasks: TaskData[]) => {
    const now = new Date();
    tasks.forEach(task => {
      if (new Date(task.dueDate) < now && task.status !== 'completed') {
        addNotification({
          id: `overdue-${task._id}-${Date.now()}`,
          message: `Task "${task.title}" is overdue!`,
          type: 'task_overdue',
          createdAt: new Date(),
          read: false,
          taskId: task._id,
        });
      }
    });
  }, [addNotification]);

  const handleTaskAssigned = useCallback((task: TaskData) => {
    addNotification({
      id: `assigned-${task._id}-${Date.now()}`,
      message: `You have been assigned to task: "${task.title}"`,
      type: 'task_assigned',
      createdAt: new Date(),
      read: false,
      taskId: task._id,
    });
  }, [addNotification]);

  const handleStatusUpdate = useCallback((task: TaskData, oldStatus: string) => {
    const message = task.status === 'completed'
      ? `Task "${task.title}" has been completed! 🎉`
      : `Task "${task.title}" status updated from ${oldStatus} to ${task.status}`;

    addNotification({
      id: `status-${task._id}-${Date.now()}`,
      message,
      type: 'status_update',
      createdAt: new Date(),
      read: false,
      taskId: task._id,
    });
  }, [addNotification]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Skip API call if notifications endpoint is not ready
      if (process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === 'true') {
        await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      }
      
      // Update local state regardless of API availability
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (error) {
      // Silently handle error when notifications API is not available
      if (!(error instanceof TypeError)) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    removeNotification,
    checkOverdueTasks,
    handleTaskAssigned,
    handleStatusUpdate,
  };
}

// Create a WebSocket connection to listen for real-time notifications
export function setupNotificationListener(userId: string) {
  // Skip WebSocket connection if notifications are not enabled
  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED !== 'true' || !process.env.NEXT_PUBLIC_WS_URL) {
    return () => {}; // Return no-op cleanup function
  }

  let ws: WebSocket;
  try {
    ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`);
    
    ws.onopen = () => {
      console.log('Connected to notification service');
      ws.send(JSON.stringify({ type: 'subscribe', userId }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { useNotifications } = require('./useNotifications');
        const { addNotification } = useNotifications();
        
        addNotification({
          id: `${data.type}-${Date.now()}`,
          message: data.message,
          type: data.type,
          createdAt: new Date(),
          read: false,
          taskId: data.task?._id,
        });
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    };

    ws.onerror = (error) => {
      // Silently handle initial connection errors when service is not available
      if (ws.readyState !== WebSocket.CONNECTING) {
        console.error('WebSocket error:', error);
      }
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  } catch (error) {
    console.error('Failed to setup WebSocket connection:', error);
    return () => {}; // Return no-op cleanup function
  }
}