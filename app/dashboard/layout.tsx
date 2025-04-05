'use client';

import { useEffect, } from 'react';
import { useAuth } from '@/app/providers/auth.provider';
import { useRouter } from 'next/navigation';

import '@/app/styles/dashboard.scss';
import '@mantine/tiptap/styles.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  const { confirmed, } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const x = confirmed();

    if (!x) {
      return router.replace('/auth');
    }

  }, [confirmed, router]);

  return (
    <>
      {children}
    </>
  );
};
