'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Center, Divider, Paper, Stack, Text } from '@mantine/core';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import PageItemActions from './pages.item.actions';
import { findPage } from './pages.find';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PageContent from '@/app/components/ui/page.content';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken } from '../content.find';
import type { Page } from '@/markket/page';

type TiendaPageItemPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaPageItemPageClient({ storeSlug, itemId }: TiendaPageItemPageClientProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to view this page.');
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
        console.error('Tienda page item load error', err);
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
        <Text c="dimmed">Loading page preview…</Text>
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
        ]}
        title="Page not found"
        routePath={`/tienda/${storeSlug}/pages/${itemId}`}
      >
        <Stack gap="md">
          <Text c="dimmed">{error || 'This page does not exist.'}</Text>
          <Button component="a" href={`/tienda/${storeSlug}/pages`} variant="outline">
            Back to pages
          </Button>
        </Stack>
      </TiendaDetailShell>
    );
  }

  const editorId = page.documentId || page.slug || itemId;
  const itemDocumentId = page.documentId || itemId;
  const publicPath = page.slug === 'home'
    ? `/${storeSlug}`
    : page.slug === 'about'
      ? `/${storeSlug}/about`
      : `/${storeSlug}/about/${page.slug || page.documentId || itemId}`;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages', href: `/tienda/${storeSlug}/pages` },
        { label: page.documentId || page.slug || itemId },
      ]}
      title={page.Title || 'Untitled page'}
      routePath={`/tienda/${storeSlug}/pages/${page.documentId || page.slug || itemId}`}
      actions={
        <>
          <SmartBackButton fallbackHref={`/tienda/${storeSlug}/pages`} />
          <PageItemActions
            storeSlug={storeSlug}
            itemDocumentId={itemDocumentId}
            editorId={editorId}
            isPublished={isPublished(page)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{page.SEO?.metaDescription || 'No summary yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeSlug}
          contentType="page"
          itemDocumentId={itemDocumentId}
          studioHref={`/tienda/${storeSlug}/snapshot`}
          slots={[
            {
              label: 'Cover / Social',
              field: 'SEO.socialImage',
              src: page.SEO?.socialImage?.url,
              alt: page.SEO?.socialImage?.alternativeText || page.Title,
            },
          ]}
        />

        <Divider label={<Badge variant="dot" color="gray" size="sm">Content preview</Badge>} labelPosition="left" />

        {page.Content?.length ? (
          <Paper withBorder p="lg" radius="md" style={{ background: 'var(--mantine-color-gray-0, #fafafa)' }}>
            <PageContent params={{ page }} />
          </Paper>
        ) : (
          <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)">
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No content yet.{' '}
              <a href={`/tienda/${storeSlug}/pages/${editorId}/edit`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                Start editing →
              </a>
            </Text>
          </Paper>
        )}

        <PublicLinkActions path={publicPath} openLabel="Open public page" />
      </Stack>
    </TiendaDetailShell>
  );
}
