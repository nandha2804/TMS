'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowNotifications(false);
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    if (showNotifications) {
      closeDropdown();
    } else {
      setShowNotifications(true);
    }
  };

  return (
    <header className="bg-white shadow fixed w-full top-0 z-40 md:relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo section - centered on mobile, left-aligned on desktop */}
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <Link 
              href="/dashboard" 
              className="text-lg sm:text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
            >
              Task Manager
            </Link>
          </div>

          {/* Right section with notifications and user info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={`relative p-2 rounded-full focus:outline-none transition-colors duration-200 ${
                  showNotifications ? 'bg-gray-100' : ''
                } hover:bg-gray-100`}
                onClick={toggleNotifications}
                aria-label={`${unreadCount} unread notifications`}
              >
                <BellIcon className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 ${
                  unreadCount > 0 ? 'text-indigo-600' : 'text-gray-600'
                }`} />
                {unreadCount > 0 && !showNotifications && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-indigo-500">
                      <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center transform transition-transform duration-200 hover:scale-110">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={`fixed inset-x-0 top-16 mx-4 sm:mx-0 sm:absolute sm:right-0 sm:top-auto sm:w-96 sm:mt-2 z-50 transform transition-all duration-200 ${
                  isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  <NotificationDropdown />
                </div>
              )}
            </div>

            {/* User section */}
            <div className="flex items-center">
              <span className="hidden sm:block text-sm text-gray-700 mr-3">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}