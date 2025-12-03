
import { strapiClient } from '@/markket/api.strapi';
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from "next";
import HomePageComponent from '@/app/components/ui/home.page';

export async function generateMetadata(): Promise<Metadata> {
  const { data: [page] } = await strapiClient.getPage('home');

  return generateSEOMetadata({
    slug: process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG as string,
    entity: {
      SEO: page?.SEO,
      title: page?.Title || 'Homepage',
      url: `/`,
    },
    type: 'website',
    defaultTitle: `${page?.Title}` || 'Homepage',
  });
};

/**
 * home page for the markketplace
 *
 * @returns {JSX.Element}
 */
export default async function Home() {
  const { data: [store] } = await strapiClient.getStore();
  const { data: [page] } = await strapiClient.getPage('home');

  return <HomePageComponent store={store} page={page} />;
};
