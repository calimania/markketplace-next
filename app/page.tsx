
import { strapiClient } from '@/markket/api.strapi';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import HomePage from '@/app/components/ui/home.page';

export async function generateMetadata(): Promise<Metadata> {

  const response = await strapiClient.getPage('home');
  const page = response?.data?.[0] as Page;

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
 * Default page displayed to the user, when a main store exists we display the store's logo and description
 *
 * @returns {JSX.Element}
 */
export default async function Home() {
  const a = await strapiClient.getStore();
  const store = a.data?.[0];

  const pageResponse = await strapiClient.getPage('home');
  const page = pageResponse?.data?.[0] as Page;


  return <HomePage store={store} page={page} />;
};
