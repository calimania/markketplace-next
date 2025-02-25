'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@mantine/core';

const SKKELETRON = () => {
  return (
    <>
      <Skeleton height={50} circle mb="xl" />
      <Skeleton height={8} radius="xl" />
      <Skeleton height={8} mt={6} radius="xl" />
      <Skeleton height={8} mt={6} width="70%" radius="xl" />
    </>
  );
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {

  const router = useRouter();
  const [isMaybe, setIsMaybe] = useState(false);

  useEffect(() => {
    const _string = localStorage.getItem('markket.auth');
    setIsMaybe(!!_string);

    if (!_string) {
      router.push('/auth/ ');
    }
  }, [isMaybe, router]);

  return isMaybe ? <>{children}</> : <SKKELETRON />;
};
