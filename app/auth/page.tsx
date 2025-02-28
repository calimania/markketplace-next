'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Paper,
  ThemeIcon,
  rem,
} from '@mantine/core';
import {
  IconUserPlus,
  IconLogin,
  IconKey,
  IconBrandGithub,
  IconHomeHeart,
  IconLogout,
  IconDashboard
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place';

export default function AuthPage() {
  const router = useRouter();
  const { maybe, logout } = useAuth();
  const isLoggedIn = maybe();

  const loggedInOptions = [
    {
      title: 'Dashboard',
      description: 'Go to your dashboard',
      icon: IconDashboard,
      action: () => router.push('/dashboard/store'),
      variant: 'filled',
    },
    {
      title: 'Homepage',
      description: 'Not all those who wander are lost',
      icon: IconHomeHeart,
      action: () => router.push('/'),
      variant: 'subtle',
    },
    {
      title: 'Sign Out',
      description: 'See you soon!',
      icon: IconLogout,
      action: () => logout(),
      variant: 'light',
    },
  ];

  const loggedOutOptions = [
    {
      title: 'Sign In',
      description: 'Access your store and manage your products',
      icon: IconLogin,
      action: () => router.push('/auth/login'),
      variant: 'filled',
    },
    {
      title: 'Create Account',
      description: 'Start selling with your own store',
      icon: IconUserPlus,
      action: () => router.push('/auth/register'),
      variant: 'light',
    },
    {
      title: 'Continue with GitHub',
      description: 'Sign in or create an account using GitHub',
      icon: IconBrandGithub,
      action: () => {
        const url = new URL(`/api/connect/github`, STRAPI_URL);
        window.location.href = url.toString();
      },
      variant: 'filled',
    },
    {
      title: 'Reset Password',
      description: 'Forgot your password? No problem',
      icon: IconKey,
      action: () => router.push('/auth/forgot-password'),
      variant: 'subtle',
    },
    {
      title: 'Homepage',
      description: 'Not all those who wander are lost',
      icon: IconHomeHeart,
      action: () => router.push('/'),
      variant: 'subtle',
    },
  ];

  const options = isLoggedIn ? loggedInOptions : loggedOutOptions;

  return (
    <Container size={480} my={40}>
      <Title ta="center" fw={900}>
        Welcome to de.Markkët
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="sm">
        {isLoggedIn ? 'What would you like to do?' : 'Choose an option to continue'}
      </Text>

      <Stack mt={30}>
        {options.map((option, index) => (
          <Paper
            key={index}
            withBorder
            p="lg"
            radius="md"
            shadow="sm"
            className="hover:shadow-md transition-shadow"
          >
            <Group>
              <ThemeIcon
                variant={option.variant}
                size={60}
                radius="md"
              >
                <option.icon style={{ width: rem(32), height: rem(32) }} />
              </ThemeIcon>

              <Stack gap="xs" style={{ flex: 1 }}>
                <Text fw={500} size="lg">
                  {option.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {option.description}
                </Text>
              </Stack>

              <Button
                variant={option.variant}
                onClick={option.action}
                rightSection={<option.icon size={16} />}
              >
                Continue
              </Button>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};
