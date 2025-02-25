'use client';

import { Container } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

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
      <Notifications position="top-right" zIndex={1000} className='top-0 fixed right-0'/>
      {children}
    </Container>
  );
};
