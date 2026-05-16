import { strapiClient } from "@/markket/api.strapi";
import { ClientLayout } from "@/app/components/layout/store.layout";
import { StoreVisibilityResponse } from "@/markket/store.visibility.d";
import { markketplace } from "@/markket/config";
import type { Metadata } from "next";
import type { Store } from "@/markket";

async function getStore(slug: string) {
  'use server';
  const response = await strapiClient.getStore(slug);
  return response?.data?.[0];
}

async function getVisibility(storeId: string | number) {
  'use server';
  const visibilityResponse: StoreVisibilityResponse | null = await strapiClient.getStoreVisibility(storeId);
  return visibilityResponse?.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store | undefined;
  const favicon = store?.Favicon?.formats?.thumbnail?.url || store?.Favicon?.url || markketplace.blank_favicon_url;

  return {
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore(slug);
  const visibility = store ? await getVisibility(store.documentId) : null;

  return (
    <ClientLayout store={store} visibility={visibility}>
      {children}
    </ClientLayout>
  );
}
