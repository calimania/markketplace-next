import News, { Release } from "@/app/utils/cision";
import { generateSEOMetadata } from "@/markket/metadata";
import { strapiClient } from '@/markket/api';
import { Store } from '@/markket';
import ReleasePage from '@/app/components/chisme/release.page';


type Props = {
  params: Promise<{release_id: string}>
}

export async function generateMetadata({params}: Props) {
  const { release_id } = await params;

  const _store = await strapiClient.getStore();
  const store = _store?.data?.[0] as Store;

  return generateSEOMetadata({
    slug: 'chisme',
    entity: {
      SEO:  store?.SEO,
      title: `${store?.title} Release ${release_id}`,
      id: store?.id?.toString(),
      url: `/chisme`,
    },
    type: "article",
  });
}

export default async function ChismeRelease({params}: Props) {
  const { release_id} = await params;
  const _release = await News.get_by_id(release_id);
  const release = _release?.data as Release;

  return (
    <ReleasePage release={release} />
  )
}
