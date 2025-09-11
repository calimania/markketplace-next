import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from 'next';
import AuthPageComponent from '@/app/components/auth.page';

export async function generateMetadata(): Promise<Metadata> {
  const { data: [page] } = await strapiClient.getPage('auth', markketplace.slug) || { data: [] };

  return generateSEOMetadata({
    slug: 'auth',
    entity: {
      url: `/auth`,
      SEO: page?.SEO,
      id: page?.id?.toString(),
    },
  });
};

/**
 * /auth with useful account links
 * @returns {JSX.Element}
 */
export default async function AuthPage() {
  return <AuthPageComponent />;
};
