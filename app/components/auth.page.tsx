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
  IconDashboard,
  IconMailHeart
} from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { strapiClient } from '@/markket/api.strapi';
import { useEffect, useState } from 'react';
import { Store } from '@/markket/store';
import { markketConfig } from '@/markket/config';
import { Page } from '@/markket/page';

import AuthUnconfirmed from './auth/auth.unconfirmed';
import './auth.page.neobrutal.css';

type Option = {
  title: string;
  description: string;
  icon: typeof IconDashboard;
  action: () => null | void;
  variant: string;
  disabled?: boolean;
  action_txt?: string;
  color?: string; // accent color
  bg?: string; // background gradient or color
};

/**
 * /auth with useful account links
 * @returns {JSX.Element}
 */
export default function AuthPage() {
  const router = useRouter();
  const { maybe, logout, confirmed, refreshUser, } = useAuth();
  const [store, setStore] = useState({} as Store);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [page, setPage] = useState({} as Page);

  useEffect(() => {
    const fetchData = async () => {
      const { data: [_store] } = await strapiClient.getStore();
      setStore(_store as Store);

      const { data } = await strapiClient.getPage('auth', markketConfig.slug);

      setPage(data[0] as Page);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isLoggedIn) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    setIsLoggedIn(maybe());
    setIsConfirmed(confirmed());
  }, [maybe, confirmed]);

  const loggedInOptions: Option[] = [
    {
      title: 'Dashboard',
      description: 'Content Management',
      icon: IconDashboard,
      action: () => router.push('/dashboard/store'),
      variant: 'filled',
      action_txt: 'Open dashboard',
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #fdf2f8 100%)',
    },
    {
      title: 'Homepage',
      description: 'Explore the marketplace or discover new stores',
      icon: IconHomeHeart,
      action: () => router.push('/'),
      variant: 'subtle',
      action_txt: 'Go home',
      color: '#f472b6',
      bg: 'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
    },
    {
      title: 'Sign Out',
      description: 'See you soon! Come back anytime 💖',
      icon: IconLogout,
      action: () => logout(),
      variant: 'light',
      action_txt: 'Sign out',
      color: '#fbbf24',
      bg: 'linear-gradient(135deg, #fef9c3 0%, #fdf2f8 100%)',
    },
  ];

  const loggedOutOptions: Option[] = [
    {
      title: 'Sign In',
      description: 'Welcome back! Access your store and manage your products',
      icon: IconLogin,
      action: () => router.push('/auth/login'),
      variant: 'filled',
      action_txt: 'Sign in',
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #fdf2f8 100%)',
    },
    {
      title: 'Create Account',
      description: 'Start selling with your own store. It’s free and easy!',
      icon: IconUserPlus,
      action: () => router.push('/auth/register'),
      variant: 'light',
      action_txt: 'Register',
      color: '#f472b6',
      bg: 'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
    },
    {
      title: 'Reset Password',
      description: 'Forgot your password? No worries, we’ll help you out!',
      icon: IconKey,
      action: () => router.push('/auth/forgot-password'),
      variant: 'subtle',
      action_txt: 'Request link',
      color: '#fbbf24',
      bg: 'linear-gradient(135deg, #fef9c3 0%, #fdf2f8 100%)',
    },
    {
      title: 'Back to Homepage',
      description: 'Explore the marketplace or discover new stores',
      icon: IconHomeHeart,
      action: () => router.push('/'),
      variant: 'subtle',
      action_txt: '/',
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #fdf2f8 100%)',
    },
    {
      title: 'Continue with GitHub',
      disabled: true,
      description: '[coming soon] create an account using GitHub',
      icon: IconBrandGithub,
      action: () => {
        const url = new URL(`/api/connect/github`, markketConfig.api);
        window.location.href = url.toString();
      },
      variant: 'filled',
      action_txt: 'GitHub',
      color: '#333',
      bg: 'linear-gradient(135deg, #e0e7ef 0%, #fdf2f8 100%)',
    },
  ];

  const unconfirmedOptions: Option[] = [
    {
      title: 'Login',
      description: 'You need to enter your password after confirming your email',
      icon: IconMailHeart,
      action: () => router.push('/auth/login'),
      variant: 'filled',
      action_txt: 'Login',
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #fdf2f8 100%)',
    },
    {
      title: 'Back to Homepage',
      description: 'Explore the marketplace or discover new stores',
      icon: IconHomeHeart,
      action: () => router.push('/'),
      variant: 'subtle',
      action_txt: 'Go home',
      color: '#f472b6',
      bg: 'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
    },
  ];

  const title = page?.Title || page?.SEO?.metaTitle || `Welcome to ${store?.title || 'Markket.ts'}!`;

  return (
    <Container size={480} my={40}>
      <Title ta="center" fw={900}>
        {title}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt="sm">
        {isLoggedIn ? 'What would you like to do?' : 'Choose an option to continue'}
      </Text>

      {isLoggedIn && !isConfirmed && (
        <AuthUnconfirmed />
      )}

      <Stack mt={30}>
        {(isLoggedIn ? (isConfirmed ? loggedInOptions : unconfirmedOptions) : loggedOutOptions).map((option, index) => (
          <Paper
            key={index}
            withBorder
            p="lg"
            radius="md"
            shadow="sm"
            className="auth-option-paper-neobrutal"
            style={{
              borderWidth: 3,
              borderColor: option.color || '#222',
              borderStyle: 'solid',
              boxShadow: `6px 6px 0 ${option.color || '#222'}`,
              background: option.bg || '#fffbe6',
              transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s',
            }}
          >
            <Group>
              <ThemeIcon
                variant={option.variant}
                size={60}
                radius="md"
                className="auth-option-icon-neobrutal"
                style={{ background: option.color, color: '#fff' }}
              >
                <option.icon style={{ width: rem(32), height: rem(32) }} />
              </ThemeIcon>

              <Stack gap="xs" style={{ flex: 1 }}>
                <Text fw={500} size="lg">
                  <a href="javascript:void(0)" onClick={!option.disabled ? option.action : () => { }}>
                    {option.title}
                  </a>
                </Text>
                <Text size="sm" c="dimmed">
                  {option.description}
                </Text>
              </Stack>

              <Button
                variant={option.variant}
                disabled={!!option.disabled}
                onClick={option.action}
                rightSection={<option.icon size={16} />}
                className="auth-option-btn-neobrutal"
                style={{
                  borderWidth: 2,
                  borderColor: option.color || '#222',
                  borderStyle: 'solid',
                  fontWeight: 700,
                  letterSpacing: 1,
                  background: option.color ? `${option.color}22` : '#fff',
                  color: option.color || '#222',
                  transition: 'box-shadow 0.18s, border-color 0.18s, background 0.18s, color 0.18s, transform 0.18s',
                }}
              >
                {option.action_txt || 'Continue'}
              </Button>
            </Group>
          </Paper>
        ))}
      </Stack>
      {page?.Content && (
        <Paper
          withBorder
          p="lg"
          mt={30}
          radius="md"
          className="auth-bottom-paper-neobrutal"
          style={{
            borderWidth: 3,
            borderColor: '#f472b6', // pink-400
            borderStyle: 'solid',
            boxShadow: '6px 6px 0 #f472b6',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
            transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s',
            animation: 'fadeInUp 0.7s cubic-bezier(.4,2,.6,1)',
          }}
        >
         <PageContent params={{ page }} />
        </Paper>)
      }
    </Container>
  );
};
