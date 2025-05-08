'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    router.push(user ? '/dashboard' : '/auth/login');
  }, [user, router]);

  return null;
}