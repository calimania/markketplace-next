import LoginPage from '@/app/components/auth/login.page';
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/markket/metadata';
import { strapiClient } from '@/markket/api.strapi';
import { Page } from '@/markket/page';

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await strapiClient.getPage('login');
  const page = data?.[0] as Page;

  return generateSEOMetadata({
    slug: 'auth/login',
    defaultTitle: 'Login',
    entity: {
      url: 'auth/login',
      SEO: page?.SEO,
      id: page?.id?.toString(),
    }
  });
};

export default LoginPage;
