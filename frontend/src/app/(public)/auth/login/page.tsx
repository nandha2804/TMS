'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.status === 0) {
        // Network/connection error
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          toast.error(`Connection failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => handleSubmit(event), 1000);
          return;
        } else {
          toast.error('Unable to connect to server. Please check your connection and try again.');
        }
      } else if (error.status === 429) {
        // Rate limiting
        const waitTime = error.response?.headers?.['retry-after'] || 60;
        toast.error(`Too many attempts. Please try again in ${waitTime} seconds.`);
      } else if (error.status === 401) {
        // Authentication error
        toast.error('Invalid email or password');
      } else if (error.response?.data?.details) {
        // Validation errors
        const validationErrors: ValidationErrors = {};
        error.response.data.details.forEach((detail: ValidationError) => {
          validationErrors[detail.field] = detail.message;
        });
        setErrors(validationErrors);
        toast.error('Please fix the errors and try again');
      } else {
        // Generic error with message from server if available
        toast.error(error.message || 'An error occurred while trying to log in');
      }
    } finally {
      setIsLoading(false);
      setRetryCount(0);
    }
  };

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your.email@example.com"
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
                  title="Please enter a valid email address"
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  minLength={6}
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {errors.global && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errors.global}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  retryCount > 0 ? (
                    `Retrying... (${retryCount}/${MAX_RETRIES})`
                  ) : (
                    'Signing in...'
                  )
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}