'use client';

import React from 'react';
import { TextInput, Button, Text, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

interface SubscribeFormProps {
  store: {
    id: string;
    title: string;
  }
}

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
    const MARKKET_URL = process.env.NEXT_PUBLIC_MARKKET_URL || 'https://api.markket.place';
    const url = new URL('api/subscribers', MARKKET_URL);

    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            Email: values.email,
            stores: [`${store?.id || ''}`],
          }
        }),
      });

      if (!res.ok) throw new Error('Subscription failed');

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
        {error && <Text color="red">{error}</Text>}
        <Text size="sm" fw={500} mb="md">
          Subscribe to {store?.title}&apos;s newsletter
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

      <Modal
        opened={isSuccess}
        onClose={() => setIsSuccess(false)}
        title="Thank you!"
      >
        <Text>You&apos;ve been successfully subscribed to our newsletter.</Text>
      </Modal>
    </>
  );
};
