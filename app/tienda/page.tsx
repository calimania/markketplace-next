'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Container, Title, Text, Paper, Stack, Group, Button, Skeleton } from '@mantine/core';
import { IconArrowLeft, IconChevronRight, IconEye, IconEyeOff, IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import { markketColors } from '@/markket/colors.config';

type StoreStatusShape = {
  status?: string;
  publishedAt?: string | null;
  slug?: string;
  documentId?: string;
};

function isStorePublished(store: StoreStatusShape) {
  const status = String(store.status || '').toLowerCase();
  if (status === 'published') return true;
  if (status === 'draft') return false;
  return Boolean(store.publishedAt);
}

export default function MeStoresPage() {
  const router = useRouter();
  const { confirmed, stores, fetchStores, isLoading } = useAuth();
  const [isStoresHydrating, setIsStoresHydrating] = useState(true);

  const uniqueStores = stores
    .filter((store, index, array) => {
      const identity = store.documentId || store.slug;
      if (!identity) return true;
      return array.findIndex((candidate) => (candidate.documentId || candidate.slug) === identity) === index;
    })
    .sort((a, b) => (a.title || a.slug || '').localeCompare(b.title || b.slug || ''));

  useEffect(() => {
    if (!confirmed()) {
      router.replace('/auth');
      return;
    }

    setIsStoresHydrating(true);
    fetchStores()
      .finally(() => setIsStoresHydrating(false));
  }, [confirmed, fetchStores, router]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const statusSnapshot = uniqueStores.map((store) => {
      const typed = store as StoreStatusShape;
      return {
        slug: store.slug,
        documentId: typed.documentId,
        status: typed.status,
        publishedAt: typed.publishedAt,
        resolved: isStorePublished(typed) ? 'Published' : 'Draft',
      };
    });

    if (statusSnapshot.length > 0) {
      console.table(statusSnapshot);
    }
  }, [uniqueStores]);

  return (
    <Container size="md" py="xl">
      <Stack gap="md" mb="lg">
        <TinyBreadcrumbs
          items={[
            { label: 'Me', href: '/me' },
            { label: 'Tienda' },
          ]}
        />

        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>My Stores</Title>
            <Text c="dimmed" mt={2}>
              <span className="accent-blue">/</span>
            </Text>
            <Text c="dimmed" mt={4}>Pick a store to open its workspace.</Text>
          </div>
          <Group>
            <Button variant="default" component={Link} href="/me" leftSection={<IconArrowLeft size={16} />}>
              Back
            </Button>
            <Button component={Link} href="/me/store/new" leftSection={<IconPlus size={16} />}>
              Create Store
            </Button>
          </Group>
        </Group>
      </Stack>

      <Stack>
        {(isLoading || isStoresHydrating) && (
          <Paper
            withBorder
            p="lg"
            radius="xl"
            style={{
              borderColor: `${markketColors.sections.shop.main}22`,
              background: `linear-gradient(135deg, ${markketColors.sections.shop.light} 0%, #ffffff 52%, ${markketColors.rosa.light} 100%)`,
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Stack gap={6}>
                  <Skeleton height={18} width={180} radius="sm" />
                  <Skeleton height={14} width={260} radius="sm" />
                </Stack>
                <Skeleton height={36} width={110} radius="xl" />
              </Group>
              <Skeleton height={62} radius="lg" />
              <Skeleton height={62} radius="lg" />
              <Skeleton height={62} radius="lg" />
            </Stack>
          </Paper>
        )}
        {!isLoading && !isStoresHydrating && uniqueStores.length === 0 && (
          <Paper
            withBorder
            p="lg"
            radius="xl"
            style={{
              borderColor: `${markketColors.rosa.main}33`,
              background: `linear-gradient(135deg, ${markketColors.rosa.light} 0%, #ffffff 60%, ${markketColors.sections.shop.light} 100%)`,
            }}
          >
            <Stack gap="xs">
              <Text fw={700} style={{ color: markketColors.neutral.charcoal }}>No stores yet</Text>
              <Text c="dimmed" size="sm">Create your first store and we will drop you right into the studio.</Text>
              <Group>
                <Button component={Link} href="/me/store/new" radius="xl" leftSection={<IconPlus size={16} />}>
                  Create First Store
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
        {!isLoading && !isStoresHydrating && uniqueStores.map((store, index) => (
          <Link
            key={store.documentId || `${store.slug || 'store'}-${index}`}
            href={`/tienda/${store.slug}`}
            className="store-tile-link"
            aria-label={`Open ${store.title || store.slug} (${isStorePublished(store as StoreStatusShape) ? 'Published' : 'Draft'})`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Paper
              withBorder
              p="md"
              radius="xs"
              className="store-tile-card"
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <div style={{ minWidth: 0 }}>
                  {(() => {
                    const isPublished = isStorePublished(store as StoreStatusShape);

                    return (
                      <Group gap="xs" align="center" mb={2} wrap="wrap">
                        <Title order={4}>{store.title}</Title>
                        <Badge
                          variant="light"
                          color={isPublished ? 'green' : 'gray'}
                          title={isPublished ? 'Visible store' : 'Hidden draft store'}
                        >
                          <Group gap={4} wrap="nowrap">
                            {isPublished ? <IconEye size={12} /> : <IconEyeOff size={12} />}
                          </Group>
                        </Badge>
                      </Group>
                    );
                  })()}
                  <Text c="dimmed" size="sm" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}>
                    /{store.slug}
                  </Text>
                </div>
                <Group
                  gap={6}
                  wrap="nowrap"
                  className="store-tile-cta"
                  style={{
                    border: `1px solid ${markketColors.sections.shop.main}44`,
                    color: markketColors.sections.shop.main,
                    background: '#fff',
                    borderRadius: 10,
                    padding: '6px 12px',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Text size="xs" fw={700}>Open</Text>
                  <IconChevronRight size={14} />
                </Group>
              </Group>
            </Paper>
          </Link>
        ))}
      </Stack>
    </Container>
  );
}
