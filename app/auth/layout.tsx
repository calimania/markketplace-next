'use client';

import { Container } from '@mantine/core';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container size="100%" py="xl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f1f3f5, #e9ecef)'
    }}>
      {children}
    </Container>
  );
};
