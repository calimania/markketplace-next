'use client';

import { Modal, Stack, Text, Group, Button, ThemeIcon, Title } from '@mantine/core';
import { IconWorld, IconWorldOff, IconSparkles } from '@tabler/icons-react';

type PublishConfirmModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isPublishing: boolean;
  contentType: string;
};

export default function PublishConfirmModal({
  opened,
  onClose,
  onConfirm,
  loading = false,
  isPublishing,
  contentType,
}: PublishConfirmModalProps) {
  const label = contentType.charAt(0).toUpperCase() + contentType.slice(1);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      radius="lg"
      size="sm"
      padding="xl"
      overlayProps={{ blur: 3, backgroundOpacity: 0.35 }}
    >
      <Stack align="center" gap="lg">
        <ThemeIcon
          size={64}
          radius="xl"
          variant="light"
          color={isPublishing ? 'green' : 'orange'}
        >
          {isPublishing
            ? <IconSparkles size={32} />
            : <IconWorldOff size={32} />}
        </ThemeIcon>

        <Stack align="center" gap={6}>
          <Title order={3} ta="center" fw={700}>
            {isPublishing ? 'Ready to go live?' : 'Take it offline?'}
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={280}>
            {isPublishing
              ? `Your ${label.toLowerCase()} will be visible to the world. You can unpublish it at any time.`
              : `Your ${label.toLowerCase()} will be hidden from public view. You can re-publish it whenever you're ready.`}
          </Text>
        </Stack>

        <Group gap="sm" grow w="100%">
          <Button variant="default" radius="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            radius="md"
            color={isPublishing ? 'green' : 'orange'}
            leftSection={isPublishing ? <IconWorld size={16} /> : <IconWorldOff size={16} />}
            loading={loading}
            onClick={onConfirm}
          >
            {isPublishing ? 'Publish' : 'Unpublish'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
