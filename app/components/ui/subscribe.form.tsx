'use client';

import { TextInput, Button, Text, Modal, Stack, Group, Paper, Title, Badge, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { type Store } from '@/markket/store.d';
import { markketplace } from '@/markket/config';

interface SubscribeFormProps {
  store: Store;
};

/**
 * Displays a newsletter subscription form
 * It will later display previous editions of the newsletter
 *
 * @param {Object} props - The props object
 * @returns
 */
export function SubscribeForm({ store }: SubscribeFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    const url = new URL('/api/subscribers/subscribe', markketplace.api);

    try {
      console.log(`[subscribe/form] -> POST ${url.toString()} email:${values.email} store:${store?.documentId || 'none'}`);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            Email: values.email,
            stores: [`${store?.documentId || ''}`],
          }
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[subscribe/form] <- ${res.status}`, body);
        throw new Error('Subscription failed');
      }

      console.log('[subscribe/form] <- success');

      setIsSuccess(true);
      form.reset();
    } catch (err) {
      console.error(err);
      setError('Failed to subscribe. Please try again.');
    }
  };

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          {error && <Text c="red" size="sm">{error}</Text>}
          <Text size="sm" style={{ color: '#616161' }}>
            Subscribe to {store?.title}&apos;s newsletter for new stories, product drops, and event highlights.
        </Text>

          <Group gap="sm" align="flex-start" wrap="wrap">
          <TextInput
            placeholder="your@email.com"
            required
              radius="xl"
              size="md"
              style={{ flex: 1, minWidth: 240 }}
            {...form.getInputProps('email')}
          />
            <Button type="submit" radius="xl" size="md" variant="gradient" gradient={{ from: '#E4007C', to: '#E91E63', deg: 135 }}>
              Subscribe
            </Button>
          </Group>

          <Paper withBorder p="sm" radius="md" style={{ borderColor: '#F5F5F5', background: '#FAFAFA' }}>
            <Text size="xs" style={{ color: '#616161' }}>
              No spam. Unsubscribe anytime.
            </Text>
          </Paper>
        </Stack>
      </form>

      <Modal
        opened={isSuccess}
        onClose={() => setIsSuccess(false)}
        centered
        radius="lg"
        withCloseButton={false}
        title={null}
      >
        <Stack gap="md" align="center" ta="center" py="xs">
          <ThemeIcon size={58} radius="xl" variant="light" color="pink">
            ✨
          </ThemeIcon>
          <Title order={3} style={{ color: '#424242' }}>
            You&apos;re officially subscribed
          </Title>
          <Text size="sm" c="dimmed">
            Thanks for joining {store?.title}&apos;s newsletter. We&apos;ll send thoughtful updates, launches, and event highlights.
          </Text>
          <Badge variant="light" color="pink" radius="sm">
            Welcome to the list
          </Badge>
          <Button
            radius="xl"
            variant="gradient"
            gradient={{ from: '#E4007C', to: '#E91E63', deg: 135 }}
            onClick={() => setIsSuccess(false)}
          >
            Continue
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
