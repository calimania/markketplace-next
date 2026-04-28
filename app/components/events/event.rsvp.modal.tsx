'use client';

import { useState } from 'react';
import { Modal, Button, TextInput, Stack, Title, Text, ThemeIcon, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendarEvent, IconCircleCheck, IconSparkles } from '@tabler/icons-react';

interface Props {
  eventId: string;
  eventName?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventTimezone?: string;
  storeName?: string;
  storeSlug?: string;
  eventSlug?: string;
  storeDocumentId?: string;
}

export default function RSVPModal({
  eventId,
  eventName,
  eventStartDate,
  eventEndDate,
  eventTimezone,
  storeName,
  storeSlug,
  eventSlug,
  storeDocumentId,
}: Props) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setDone(false), 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/markket/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          eventId,
          eventName,
          eventStartDate,
          eventEndDate,
          eventTimezone,
          storeName,
          storeSlug,
          eventSlug,
          storeDocumentId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || 'Could not submit RSVP');
      }

      setDone(true);
    } catch (error) {
      notifications.show({
        title: 'Something went wrong',
        message: error instanceof Error ? error.message : 'Please try again.',
        color: 'red',
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        fullWidth
        size="lg"
        mt="md"
        radius="md"
        color="pink"
        leftSection={<IconCalendarEvent size={18} />}
        onClick={() => setIsOpen(true)}
      >
        RSVP for this event
      </Button>

      <Modal
        opened={isOpen}
        onClose={close}
        centered
        radius="lg"
        size="sm"
        padding="xl"
        withCloseButton={!isSubmitting}
        overlayProps={{ blur: 3, backgroundOpacity: 0.35 }}
        title={null}
      >
        {done ? (
          <Stack align="center" gap="lg" py="md">
            <ThemeIcon size={72} radius="xl" variant="light" color="green">
              <IconCircleCheck size={40} />
            </ThemeIcon>
            <Stack align="center" gap={6}>
              <Title order={3} ta="center">You&apos;re in!</Title>
              <Text size="sm" c="dimmed" ta="center" maw={260}>
                {`We've saved your spot${eventName ? ` for ${eventName}` : ''}. Check your inbox for a confirmation.`}
              </Text>
            </Stack>
            <Button radius="md" fullWidth onClick={close}>
              Close
            </Button>
          </Stack>
        ) : (
          <Stack gap="lg">
            <Stack align="center" gap={6}>
              <ThemeIcon size={56} radius="xl" variant="light" color="pink">
                <IconSparkles size={28} />
              </ThemeIcon>
              <Title order={3} ta="center">
                {eventName ? `RSVP: ${eventName}` : 'RSVP for this event'}
              </Title>
              {storeName && (
                <Text size="sm" c="dimmed" ta="center">{storeName}</Text>
              )}
            </Stack>

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    label="Your name"
                    placeholder="Jane Smith"
                    required
                    radius="md"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  />
                  <TextInput
                    label="Email address"
                    placeholder="you@example.com"
                    type="email"
                    required
                    radius="md"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                  <Group grow mt="xs">
                    <Button variant="default" radius="md" onClick={close} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      radius="md"
                      color="pink"
                      loading={isSubmitting}
                    >
                      Confirm RSVP
                    </Button>
                  </Group>
                </Stack>
              </form>
          </Stack>
        )}
      </Modal>
    </>
  );
}
