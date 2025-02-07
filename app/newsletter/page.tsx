'use client';

import { Title, Container, Stack, TextInput, Button, Text, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { strapiClient } from '@/markket/api';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import Header from '@/app/components/layout/header';

interface SubscribeFormProps {
  storeId: string;
  storeName: string;
}

const pages = await strapiClient.getPage('newsletter');

const page = pages?.data?.[0];

/**
 * Displays a newsletter subscription form
 * It will later display previous editions of the newsletter
 *
 * @param {Object} props - The props object
 * @returns
 */
export function NewsletterPage({ storeId, storeName }: SubscribeFormProps) {
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
    const MARKKET_URL = process.env.MARKKET_URL || 'https://api.markket.place';

    try {
      const res = await fetch(`${MARKKET_URL}/api/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            Email: values.email,
            stores: [`${page?.store?.id || ''}`],
          }
        }),
      });

      if (!res.ok) throw new Error('Subscription failed');

      setIsSuccess(true);
      form.reset();
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <Container size="md" className="py-20">
        <Stack gap="xl">

          <Title order={1}>{page?.Title}</Title>

          <div className="prose dark:prose-invert">
            <BlocksRenderer content={(page?.Content || []) as BlocksContent} />
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Text size="sm" fw={500} mb="md">
              Subscribe to {storeName}&apos;s newsletter
            </Text>

            <div className="flex gap-3">
              <TextInput
                placeholder="your@email.com"
                required
                className="flex-1"
                {...form.getInputProps('email')}
              />
              <Button type="submit">Subscribe</Button>
            </div>
          </form>
        </Stack>
      </Container>

      <Modal
        opened={isSuccess}
        onClose={() => setIsSuccess(false)}
        title="Thank you!"
      >
        <Text>You&apos;ve been successfully subscribed to our newsletter.</Text>
      </Modal>
    </>
  );
}

export default NewsletterPage;
