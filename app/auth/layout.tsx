'use client';

import { Container } from '@mantine/core';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container
      size="xs"
      py="md"
      style={{
        minHeight: '96vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      {children}
    </Container>
  );
};
