import { notFound, redirect } from 'next/navigation';

type TiendaContentModePageProps = {
  params: Promise<{ storeSlug: string; contentType: string; mode: string; itemId: string }>;
};

const allowedModes = new Set(['view', 'edit']);

export default async function TiendaContentModePage({ params }: TiendaContentModePageProps) {
  const { storeSlug, contentType, mode, itemId } = await params;

  if (!allowedModes.has(mode)) {
    notFound();
  }

  redirect(
    `/dashboard/${encodeURIComponent(contentType)}/${encodeURIComponent(mode)}/${encodeURIComponent(itemId)}?store=${encodeURIComponent(storeSlug)}`
  );
}
