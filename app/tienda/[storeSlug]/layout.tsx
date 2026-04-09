import { notFound } from 'next/navigation';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';
import { StoreProvider } from './store.provider';
import StoreLayoutClient from '@/app/components/tienda/store-layout-client';

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
      <StoreLayoutClient store={store}>
        {children}
      </StoreLayoutClient>
    </StoreProvider>
  );
}
