import { notFound } from 'next/navigation';
import { Container, Stack } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';
import { StoreProvider } from './store.provider';

type StoreLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { storeSlug } = await params;

  const storeResponse = await strapiClient.getStore(storeSlug);
  const store = storeResponse?.data?.[0] as Store | undefined;

  if (!store) notFound();

  return (
    <StoreProvider store={store}>
      <Container size="md" py="xl">
        <Stack gap="md">
          {children}
        </Stack>
      </Container>
    </StoreProvider>
  );
}
