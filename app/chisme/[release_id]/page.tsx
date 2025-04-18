import News from "@/app/utils/cision";
import { generateSEOMetadata } from "@/markket/metadata";
import { strapiClient } from '@/markket/api';
import { Store } from '@/markket';
import { Title, Container } from "@mantine/core";

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
  const releases = await News.get_by_id(release_id);

  const release = releases?.data?.[0];

  return (
  <>
      <Container>
        <Title>{release.title}</Title>
      </Container>
  </>
  )
}
