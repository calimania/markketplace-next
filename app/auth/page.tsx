

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
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  const authOptions = [
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
      title: 'Reset Password',
      description: 'Forgot your password? No problem',
      icon: IconKey,
      action: () => router.push('/auth/forgot-password'),
      variant: 'subtle',
    },
  ];

  return (
    <Container size={480} my={40}>
      <Title ta="center" fw={900}>
        Welcome to de.Markkët
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="sm">
        Choose an option to continue
      </Text>

      <Stack mt={30}>
        {authOptions.map((option, index) => (
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
}