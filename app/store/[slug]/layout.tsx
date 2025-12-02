import { strapiClient } from "@/markket/api.strapi";
import { ClientLayout } from "@/app/components/layout/store.layout";
import { StoreVisibilityResponse } from "@/markket/store.visibility.d";

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
