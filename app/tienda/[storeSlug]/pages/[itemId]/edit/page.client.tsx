'use client';

import { useEffect, useState } from 'react';
import { Center, Text } from '@mantine/core';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import PagesEditorForm from '../../pages.editor.form';
import { findPage } from '../../pages.find';
import { readTiendaAuthToken } from '../../../content.find';
import type { Page } from '@/markket/page';

type TiendaPageEditPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaPageEditPageClient({ storeSlug, itemId }: TiendaPageEditPageClientProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to edit this page.');
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        const data = await findPage(itemId, storeSlug, token);
        if (!active) return;

        if (!data) {
          setError('This page could not be found.');
          return;
        }

        setPage(data);
      } catch (err) {
        console.error('Tienda page edit load error', err);
        if (!active) return;
        setError('Unable to load the page. Please refresh.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [itemId, storeSlug]);

  if (loading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading page editor…</Text>
      </Center>
    );
  }

  if (error || !page) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Pages', href: `/tienda/${storeSlug}/pages` },
          { label: itemId },
          { label: 'Edit' },
        ]}
        title="Page not found"
        routePath={`/tienda/${storeSlug}/pages/${itemId}/edit`}
      >
        <Text c="dimmed">{error || 'This page does not exist.'}</Text>
      </TiendaDetailShell>
    );
  }

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages', href: `/tienda/${storeSlug}/pages` },
        { label: page.documentId || page.slug || itemId, href: `/tienda/${storeSlug}/pages/${page.documentId || page.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${page.Title || 'Page'}`}
      routePath={`/tienda/${storeSlug}/pages/${page.documentId || page.slug || itemId}/edit`}
    >
      <PagesEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={page.documentId || itemId}
        initial={{
          title: page.Title,
          slug: page.slug,
          content: page.Content,
          seoTitle: page.SEO?.metaTitle,
          seoDescription: page.SEO?.metaDescription,
        }}
      />
    </TiendaDetailShell>
  );
}
