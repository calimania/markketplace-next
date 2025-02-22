'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth';
import { LoadingOverlay } from '@mantine/core';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return user ? <>{children}</> : <>
  please login or regisgter</>;
};
