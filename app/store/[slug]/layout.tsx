import {strapiClient} from "@/markket/api";
import { ClientLayout } from "@/app/components/layout/store.layout";


type LayoutProps = {
  children: React.ReactNode;
  params: { slug: string };
}

async function getStore(slug: string) {
  'use server';
  const response = await strapiClient.getStore(slug);
  return response?.data?.[0];
}

export default async function StoreLayout({
  children,
  params,
}: LayoutProps) {
  const store = await getStore(params.slug);

  return (
    <ClientLayout store={store}>
      {children}
    </ClientLayout>
  );
}
