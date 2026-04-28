'use client';

import { useState } from 'react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import { useStore } from '../store.provider';
import PublishConfirmModal from '@/app/components/ui/publish.confirm.modal';

type EventItemActionsProps = {
  storeSlug: string;
  itemDocumentId: string;
  editorId: string;
  isPublished?: boolean;
};

function readAuthToken() {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

export default function EventItemActions({ storeSlug, itemDocumentId, editorId, isPublished = false }: EventItemActionsProps) {
  const router = useRouter();
  const store = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(true);
  const [loading, setLoading] = useState(false);

  const openModal = (nextPublished: boolean) => {
    setPendingPublish(nextPublished);
    setModalOpen(true);
  };

  const onSetPublished = async () => {
    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      setModalOpen(false);
      return;
    }

    const storeRef = store.documentId || store.slug || storeSlug;
    const publishPayload = pendingPublish
      ? { status: 'published', publishedAt: new Date().toISOString(), publishNow: true }
      : { status: 'draft', publishedAt: null, unpublishNow: true };
    setLoading(true);

    try {
      const response = await tiendaClient.updateContent(
        storeRef,
        'event',
        itemDocumentId,
        publishPayload,
        { token },
      );

      if (response?.status && response.status >= 400) {
        throw new Error(response?.message || `Failed to ${pendingPublish ? 'publish' : 'unpublish'} event`);
      }

      notifications.show({
        title: pendingPublish ? 'Published' : 'Unpublished',
        message: pendingPublish
          ? 'Event is now publicly visible.'
          : 'Event is now hidden from public view.',
        color: pendingPublish ? 'green' : 'orange',
        autoClose: 3000,
      });

      setModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Publish toggle event failed', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error
          ? error.message
          : `Could not ${pendingPublish ? 'publish' : 'unpublish'} event.`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublishConfirmModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={onSetPublished}
        loading={loading}
        isPublishing={pendingPublish}
        contentType="event"
      />
      <Button component="a" href={`/tienda/${storeSlug}/events/${editorId}/edit`}>
        Edit
      </Button>
      {isPublished ? (
        <Button color="orange" variant="light" onClick={() => openModal(false)}>
          Unpublish
        </Button>
      ) : (
        <Button color="green" variant="light" onClick={() => openModal(true)}>
          Publish
        </Button>
      )}
    </>
  );
}
