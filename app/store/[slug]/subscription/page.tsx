import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Container, Paper, Loader, Center } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store.d';
import type { Metadata } from 'next';
import SubscriptionClient from './subscription.client';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: [store] } = await strapiClient.getStore(slug) || { data: [] };

  return {
    title: store ? `Manage Subscription · ${store.title || slug}` : 'Manage Subscription',
    robots: { index: false, follow: false },
  };
}

export default async function SubscriptionPage({ params }: Props) {
  const { slug } = await params;
  const { data: [store] } = await strapiClient.getStore(slug) || { data: [] };

  if (!store) {
    notFound();
  }

  return (
    <Container size="sm" py={60}>
      <Paper withBorder radius="xl" shadow="sm" style={{ overflow: 'hidden' }}>
        <Suspense fallback={<Center py={60}><Loader size="sm" /></Center>}>
          <SubscriptionClient store={store as Store} />
        </Suspense>
      </Paper>
    </Container>
  );
}
