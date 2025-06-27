'use client';

import { Container, Paper, } from '@mantine/core';
import './auth-layout-neobrutal.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container size="100wh" py="xl" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
    }}>
      <Paper
        withBorder
        shadow="lg"
        p={28}
        radius="lg"
        className="auth-layout-neobrutal"
        style={{
          borderWidth: 4,
          borderColor: '#0ea5e9',
          borderStyle: 'solid',
          boxShadow: '12px 12px 0 #f472b6',
          background: '#fffbe6',
          maxWidth: 768,
          width: '100%',
          margin: '0 auto',
          transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s',
          animation: 'fadeInUp 0.7s cubic-bezier(.4,2,.6,1)',
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};
