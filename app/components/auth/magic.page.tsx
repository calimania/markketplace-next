'use client';

import { useState, useEffect } from 'react';
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
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import PageContent from '../ui/page.content';
import { markketColors } from '@/markket/colors.config';

interface MagicLinkPage {
  email: string;
}

export default function MagicLinkPage() {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<{ success: boolean; error: string | null }>({ success: false, error: null });
  const router = useRouter();
  const [page, setPage] = useState({} as Page);
  const [store, setStore] = useState({} as Store);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pages } = await strapiClient.getPage('auth.magic', markketplace.slug);

      setPage(pages?.[0] as Page);

      const { data: stores } = await strapiClient.getStore(markketplace.slug);
      setStore(stores?.[0] || {});
    };

    fetchData();
  }, []);

  const form = useForm<MagicLinkPage>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: MagicLinkPage) => {
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
    <Box
      style={{
        background: `linear-gradient(165deg, ${markketColors.neutral.offWhite} 0%, #ffffff 55%, ${markketColors.sections.blog.light}40 100%)`,
        borderRadius: rem(18),
        padding: rem(12),
      }}
    >
      <Container size={680} my={32}>
        <Stack gap="lg">
          <Stack gap="sm" align="center">
            <Badge
              size="lg"
              radius="md"
              variant="light"
              leftSection={<IconSparkles size={14} />}
              style={{
                background: markketColors.rosa.light,
                color: markketColors.rosa.main,
              }}
            >
              Passwordless Access
            </Badge>
            <Title ta="center" fw={900} style={{ color: markketColors.neutral.charcoal }}>
              {page?.SEO?.metaTitle || 'Magic Link Login'}
            </Title>
            <Text c="dimmed" ta="center" maw={560}>
              {page?.SEO?.metaDescription || 'Enter your email and we will send a secure login link to open your workspace.'}
            </Text>
          </Stack>

          <Paper
            withBorder
            radius="xl"
            p={{ base: 22, sm: 34 }}
            shadow="sm"
            style={{
              borderColor: markketColors.neutral.lightGray,
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.08)',
              background: 'white',
            }}
          >
            {state.success ? (
              <Stack gap="md" align="center">
                <ThemeIcon size={64} radius="xl" variant="light" color="pink">
                  <IconMailStar size={32} />
                </ThemeIcon>
                <Title order={2} ta="center" style={{ color: markketColors.neutral.charcoal }}>
                  Link Sent
                </Title>
                <Text ta="center" c="dimmed" maw={440}>
                  Check your inbox and open the link on this device to sign in instantly.
                </Text>
                <Group>
                  <Button variant="light" onClick={() => setState({ success: false, error: null })}>
                    Send Another Link
                  </Button>
                  <Button variant="default" onClick={() => router.push('/auth/login')}>
                    Use Password Instead
                  </Button>
                </Group>
              </Stack>
            ) : (
              <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    <TextInput
                      label="Email"
                      placeholder="de@markket.place"
                      required
                      size="md"
                      description="We only send one-time login links to this address."
                      {...form.getInputProps('email')}
                    />

                    <Button
                      loading={loading}
                      type="submit"
                      fullWidth
                      size="md"
                      leftSection={<IconMailStar size={18} />}
                      style={{
                        background: `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`,
                      }}
                    >
                      Send Magic Link
                    </Button>

                    {state.error && (
                      <Text c="red" size="sm" ta="center">
                        {state.error}
                      </Text>
                    )}

                    <Text c="dimmed" size="sm" ta="center" mt={5}>
                      Have a password account?{' '}
                      <Anchor size="sm" component="button" onClick={() => router.push('/auth/login')}>
                        Login
                      </Anchor>
                    </Text>
                  </Stack>
              </form>
            )}
          </Paper>

          <Paper
            withBorder
            radius="lg"
            p="md"
            style={{
              borderColor: markketColors.neutral.lightGray,
              background: markketColors.neutral.offWhite,
            }}
          >
            {page?.Title ? (
              <PageContent params={{ page }} />
            ) : (
              <Group justify="center">
                <IconCheck size={16} color={markketColors.sections.events.main} />
                <Text size="sm" c="dimmed">Secure, fast, and passwordless.</Text>
              </Group>
            )}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};
