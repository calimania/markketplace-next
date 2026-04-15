import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconEdit, IconExternalLink, IconPhoto } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import PageItemActions from '../pages.item.actions';
import { findPage } from '../pages.find';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PageContent from '@/app/components/ui/page.content';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';

type TiendaPageDetailProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export async function generateMetadata({ params }: TiendaPageDetailProps): Promise<Metadata> {
  const { storeSlug, itemId } = await params;
  const page = await findPage(itemId, storeSlug);

  return {
    title: page?.Title || 'Page Detail',
  };
}

export default async function TiendaPageDetailPage({ params }: TiendaPageDetailProps) {
  const { storeSlug, itemId } = await params;
  const [page, storeResponse] = await Promise.all([
    findPage(itemId, storeSlug),
    strapiClient.getStore(storeSlug),
  ]);

  if (!page) notFound();

  const store = storeResponse?.data?.[0] as Store | undefined;
  const editorId = page.documentId || page.slug || itemId;
  const itemDocumentId = page.documentId || itemId;
  const storeRef = store?.documentId || store?.slug || storeSlug;
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
            isPublished={Boolean(page.publishedAt)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{page.SEO?.metaDescription || 'No summary yet.'}</Text>

        {/* Build media slots from SEO image + album covers */}
        <ContentMediaPreview
          storeRef={storeRef}
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

        <Divider label={
          <Badge variant="dot" color="gray" size="sm">Content preview</Badge>
        } labelPosition="left" />

        <Paper
          withBorder
          p="lg"
          radius="md"
          style={{ background: 'var(--mantine-color-gray-0, #fafafa)', position: 'relative' }}
        >
          {/* edit shortcut */}
          <Button
            component="a"
            href={`/tienda/${storeSlug}/pages/${editorId}/edit`}
            size="xs"
            variant="light"
            leftSection={<IconEdit size={13} />}
            style={{ position: 'absolute', top: 12, right: 12 }}
          >
            Edit
          </Button>

          {page.Content?.length ? (
            <PageContent params={{ page }} />
          ) : (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No content yet.{' '}
              <a href={`/tienda/${storeSlug}/pages/${editorId}/edit`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                Start editing →
              </a>
            </Text>
          )}
        </Paper>

        <PublicLinkActions
          path={publicPath}
          openLabel="Open public page"
        />
      </Stack>
    </TiendaDetailShell>
  );
}
