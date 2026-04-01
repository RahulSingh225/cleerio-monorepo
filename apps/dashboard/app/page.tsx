'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'platform_admin') {
        router.push('/admin/tenants');
      } else {
        router.push('/insights');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  return null;
}
