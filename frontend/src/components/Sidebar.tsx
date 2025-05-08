'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon, 
  InboxIcon, 
  ClockIcon, 
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigation = [
    {
      name: 'All Tasks',
      href: '/tasks',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'My Tasks',
      href: '/tasks/my-tasks?type=assigned',
      icon: InboxIcon,
    },
    {
      name: 'Created Tasks',
      href: '/tasks/my-tasks?type=created',
      icon: PlusIcon,
    },
    {
      name: 'Overdue Tasks',
      href: '/tasks/overdue',
      icon: ClockIcon,
    }
  ];

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 md:h-auto md:pt-5">
        <Link
          href="/dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
        >
          <ClipboardDocumentListIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">Dashboard</span>
        </Link>
        <button
          className="md:hidden rounded-md p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 pb-4 mt-5 space-y-1">
        <Link
          href="/tasks/create"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <PlusIcon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
          Create New Task
          <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
        </Link>

        <div className="mt-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors duration-150 ${
                    isActive
                      ? 'text-indigo-600'
                      : 'text-gray-400 group-hover:text-indigo-600'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          className={`inline-flex items-center justify-center p-2 rounded-md transition-all duration-200 ${
            isMobileMenuOpen
              ? 'text-gray-600 bg-gray-100'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
          } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">
            {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          </span>
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 transform rotate-90 transition-transform duration-200" />
          ) : (
            <Bars3Icon className="h-6 w-6 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl">
          <NavigationContent />
        </div>

        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-600 bg-opacity-50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <NavigationContent />
        </div>
      </div>
    </>
  );
}