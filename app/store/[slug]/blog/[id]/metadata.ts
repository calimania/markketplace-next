import { Metadata } from 'next';
import { strapiClient } from '@/markket/api';
import { Article } from "@/markket/article.d";

export async function generateMetadata({ params }: {
  params: { id: string; slug: string }
}): Promise<Metadata> {
  const { id, slug } = params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  const response = await strapiClient.getPost(id.split('-')[0], slug);
  const post = response?.data?.[0] as Article;
  const title = `Blog - ${post?.SEO?.metaTitle || store?.SEO?.metaTitle || store?.title}`;

  const description = post?.SEO?.metaDescription || store?.SEO?.metaDescription;
  const image_url = post?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image_url ? [
        {
          url: image_url,
          width: 1200,
          height: 630,
          alt: description,
        }
      ] : undefined,
      type: 'website',
    },
  };
};
