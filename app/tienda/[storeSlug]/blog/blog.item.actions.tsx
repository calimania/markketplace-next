'use client';

import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import { useStore } from '../store.provider';

type BlogItemActionsProps = {
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

export default function BlogItemActions({ storeSlug, itemDocumentId, editorId, isPublished = false }: BlogItemActionsProps) {
  const router = useRouter();
  const store = useStore();

  const onSetPublished = async (nextPublished: boolean) => {
    if (!confirm(nextPublished
      ? 'Publish this article now? It will be publicly visible.'
      : 'Unpublish this article? It will be hidden from public view.')) return;

    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    const storeRef = store.documentId || store.slug || storeSlug;

    try {
      const response = await tiendaClient.updateContent(
        storeRef,
        'article',
        itemDocumentId,
        { publishedAt: nextPublished ? new Date().toISOString() : null },
        { token },
      );

      if (response?.status && response.status >= 400) {
        throw new Error(response?.message || `Failed to ${nextPublished ? 'publish' : 'unpublish'} article`);
      }

      notifications.show({
        title: nextPublished ? 'Published' : 'Unpublished',
        message: nextPublished
          ? 'Article is now publicly visible.'
          : 'Article is now hidden from public view.',
        color: nextPublished ? 'green' : 'orange',
        autoClose: 3000,
      });

      router.refresh();
    } catch (error) {
      console.error('Publish toggle article failed', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error
          ? error.message
          : `Could not ${nextPublished ? 'publish' : 'unpublish'} article.`,
        color: 'red',
      });
    }
  };

  return (
    <>
      <Button component="a" href={`/tienda/${storeSlug}/blog/${editorId}/edit`}>
        Edit
      </Button>
      {isPublished ? (
        <Button color="orange" variant="light" onClick={() => onSetPublished(false)}>
          Unpublish
        </Button>
      ) : (
        <Button color="green" variant="light" onClick={() => onSetPublished(true)}>
          Publish
        </Button>
      )}
    </>
  );
}
