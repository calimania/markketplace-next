import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Store } from '@/markket/store';
import { StoreProvider } from './store.provider';
import StoreLayoutClient from '@/app/components/tienda/store-layout-client';
import { findStoreForTienda } from './store.find';

type StoreLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await findStoreForTienda(storeSlug) as Store | undefined;
  const storeLabel = store?.title || store?.slug || storeSlug;

  return {
    title: {
      default: storeLabel,
      template: `%s · ${storeLabel}`,
    },
  };
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { storeSlug } = await params;

  const store = await findStoreForTienda(storeSlug) as Store | undefined;

  if (!store) notFound();

  return (
    <StoreProvider store={store}>
      <StoreLayoutClient store={store}>
        {children}
      </StoreLayoutClient>
    </StoreProvider>
  );
}
