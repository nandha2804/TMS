'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications, setupNotificationListener } from '@/hooks/useNotifications';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, fetchTasks } = useTasks();
  const { checkOverdueTasks } = useNotifications();

  // Setup notification listener
  useEffect(() => {
    let cleanup: () => void;
    
    if (user?._id) {
      cleanup = setupNotificationListener(user._id);
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [user?._id]);

  // Periodically check for overdue tasks
  useEffect(() => {
    const checkTasks = () => {
      if (tasks) {
        checkOverdueTasks(tasks);
      }
    };

    // Check immediately
    checkTasks();

    // Then check every 5 minutes
    const interval = setInterval(checkTasks, 5 * 60 * 1000);

    // Also fetch tasks every 5 minutes to keep the list updated
    const fetchInterval = setInterval(() => {
      fetchTasks();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(fetchInterval);
    };
  }, [tasks, checkOverdueTasks, fetchTasks]);

  // Protected route check
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        {/* Add left padding on desktop to account for fixed sidebar */}
        <main className="flex-1 pt-16 md:pt-0 md:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="bg-gray-100 rounded-lg">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}