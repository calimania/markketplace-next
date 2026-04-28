'use client';

import { useState } from 'react';
import {
  TextInput,
  Group,
  Paper,
  Title,
  Container,
  Button,
  Stack,
  Text,
  Anchor,
  rem,
  Badge,
  Box,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconMailStar, IconSparkles } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { type Page, type Store } from '@/markket/index.d';
import PageContent from '../ui/page.content';
import { markketColors } from '@/markket/colors.config';

interface MagicLinkForm {
  email: string;
}

interface MagicLinkPageProps {
  page?: Page;
  store?: Store;
}

export default function MagicLinkPage({ page, store }: MagicLinkPageProps) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<{ success: boolean; error: string | null }>({ success: false, error: null });
  const router = useRouter();

  const form = useForm<MagicLinkForm>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: MagicLinkForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/markket?path=/api/auth-magic/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: (values?.email).toLowerCase().trim(),
          store_id: store?.documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      notifications.show({
        title: 'Success!',
        message: 'Email sent',
        color: 'green',
        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
      });
      setState({success: true, error: null});

    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Something went wrong',
        color: 'red',
      });

      setState({success: false, error: error.message});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Container size={640} my={16}>
        <Stack gap="xl">

          {/* Hero — only before sending */}
          {!state.success && (<Stack gap="xs" align="center">
            <ThemeIcon
              size={72}
              radius="xl"
              variant="gradient"
              gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
              mb={4}
            >
              <IconMailStar size={36} />
            </ThemeIcon>
            <Badge
              size="md"
              radius="xl"
              leftSection={<IconSparkles size={12} />}
              style={{
                background: markketColors.rosa.light,
                color: markketColors.rosa.main,
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              Passwordless Access
            </Badge>
            <Title order={1} ta="center" fw={900} fz={{ base: 28, sm: 34 }} style={{ color: markketColors.neutral.charcoal }}>
              {page?.SEO?.metaTitle || 'Sign in with Magic Link'}
            </Title>
            <Text ta="center" maw={460} style={{ color: markketColors.neutral.darkGray, lineHeight: 1.6 }}>
              {page?.SEO?.metaDescription || 'Enter your email and we\'ll send a one-click login link straight to your inbox — no password needed.'}
            </Text>
          </Stack>)}

          {/* Form card */}
          <Paper
            withBorder
            radius="xl"
            p={{ base: 24, sm: 40 }}
            style={{
              borderColor: markketColors.neutral.lightGray,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {state.success ? (
              <Stack gap="xl" align="center" py="xl">
                <ThemeIcon
                  size={88}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
                >
                  <IconMailStar size={44} />
                </ThemeIcon>
                <Stack gap="sm" align="center">
                  <Title order={2} ta="center" fw={800} style={{ color: markketColors.neutral.charcoal }}>
                    Link sent — check your email
                  </Title>
                  <Text ta="center" maw={360} style={{ color: markketColors.neutral.darkGray, lineHeight: 1.7 }}>
                    We emailed you a magic link. Tap it from your phone or this browser to sign in — no password needed.
                  </Text>
                  <Text size="xs" ta="center" style={{ color: markketColors.neutral.mediumGray }}>
                    Can't find it? Check your spam folder.
                  </Text>
                </Stack>
                <Stack w="100%" gap="sm">
                  <Button
                    fullWidth
                    size="lg"
                    h={58}
                    fw={700}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
                    leftSection={<IconMailStar size={18} />}
                    onClick={() => setState({ success: false, error: null })}
                  >
                    Try again with a different email
                  </Button>
                  <Text size="sm" ta="center" style={{ color: markketColors.neutral.mediumGray }}>
                    Prefer your password?{' '}
                    <Anchor
                      size="sm"
                      component="button"
                      style={{ color: markketColors.rosa.main, fontWeight: 600 }}
                      onClick={() => router.push('/auth/login')}
                    >
                      Sign in with password
                    </Anchor>
                  </Text>
                </Stack>
              </Stack>
            ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  form.onSubmit(handleSubmit)();
                }}>
                  <Stack gap="lg">
                    <TextInput
                      label="Your email address"
                      placeholder="you@example.com"
                      required
                      size="md"
                      radius="lg"
                      description="We'll send a one-time login link to this address."
                      styles={{
                        input: { borderColor: markketColors.neutral.lightGray },
                      }}
                      {...form.getInputProps('email')}
                    />

                    <Button
                      loading={loading}
                      type="submit"
                      fullWidth
                      size="xl"
                      h={56}
                      fz="md"
                      fw={700}
                      radius="xl"
                      leftSection={<IconMailStar size={20} />}
                      variant="gradient"
                      gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
                    >
                      Send Magic Link
                    </Button>

                    {state.error && (
                      <Text c="red" size="sm" ta="center">
                        {state.error}
                      </Text>
                    )}

                    <Text size="sm" ta="center" style={{ color: markketColors.neutral.mediumGray }}>
                      Have a password?{' '}
                      <Anchor
                        size="sm"
                        component="button"
                        style={{ color: markketColors.rosa.main, fontWeight: 600 }}
                        onClick={() => router.push('/auth/login')}
                      >
                        Sign in instead
                      </Anchor>
                    </Text>
                  </Stack>
              </form>
            )}
          </Paper>

          {/* Bottom content / trust strip */}
          {page?.Content?.length ? (
            <PageContent params={{ page }} />
          ) : (
            <Group justify="center" gap="xs">
              <IconCheck size={15} color={markketColors.sections.events.main} />
              <Text size="sm" style={{ color: markketColors.neutral.mediumGray }}>
                Secure, instant, and no password required.
              </Text>
            </Group>
          )}

        </Stack>
      </Container>
    </Box>
  );
};
