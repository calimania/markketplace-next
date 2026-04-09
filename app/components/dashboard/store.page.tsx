'use client';

import { useEffect } from 'react';
import { Container, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function StoreDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/me');
  }, [router]);

  return (
    <Container size="sm" py="xl">
      <Text c="dimmed">Redirecting to workspace...</Text>
    </Container>
  );
}
