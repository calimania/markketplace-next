import {strapiClient} from "@/markket/api";
import { ClientLayout } from "@/app/components/layout/store.layout";

async function getStore(slug: string) {
  'use server';
  const response = await strapiClient.getStore(slug);
  return response?.data?.[0];
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

  return (
    <ClientLayout store={store}>
      {children}
    </ClientLayout>
  );
}
