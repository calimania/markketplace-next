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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconMailStar } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Page } from '@/markket';
import { strapiClient } from '@/markket/api.strapi';
import { markketConfig } from '@/markket/config';
import PageContent from '../ui/page.content';

interface MagicLinkPage {
  email: string;
}

export default function MagicLinkPage() {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({ success: false, error: null});
  const router = useRouter();
  const [page, setPage] = useState({} as Page);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await strapiClient.getPage('auth.magic', markketConfig.slug);

      setPage(data[0] as Page);
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
        body: JSON.stringify(values),
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
    <Container size={633} my={40}>
      <Title ta="center" fw={900}>
        {page?.SEO?.metaTitle || 'Welcome to Markkët.ts!'}
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {!!state?.success && (
           <Group align="flex-start" wrap="nowrap">
            <IconMailStar size={48} color="#f471b7"/>
            <Title order={1} size="h2" mb="md">Sent</Title>
          </Group>
        )}
        {!state?.success && (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Request a secret link"
                placeholder="de@markket.place"
                required
                {...form.getInputProps('email')}
              />
              <Button loading={loading} type="submit" fullWidth mt="xl">
                Send Link
              </Button>
              <div>
                {page.Title ? <PageContent params={{ page }} /> : (
                  <>
                    🧿
                    <br />
                    <br />
                    <img src="https://markketplace.nyc3.digitaloceanspaces.com/uploads/d6ea5862f4b3232da4ada1a24a78939c.png" alt="markket logo" />
                  </>
                )}
              </div>
            </Stack>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
              Have a password account?{' '}
              <Anchor size="sm" component="button" onClick={() => router.push('/auth/login')}>
                Login
              </Anchor>
            </Text>
          </form>
        )}
      </Paper>
    </Container>
  );
};
