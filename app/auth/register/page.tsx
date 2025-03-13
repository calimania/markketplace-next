import RegisterPage from '@/app/components/auth/register.page';
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/markket/metadata';
import { strapiClient } from '@/markket/api.strapi';
import { Page } from '@/markket/page';

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await strapiClient.getPage('register');
  const page = data?.[0] as Page;

  return generateSEOMetadata({
    slug: 'auth/register',
    defaultTitle: 'Register',
    entity: {
      url: 'auth/register',
      SEO: page?.SEO,
      id: page?.id?.toString(),
    }
  });
};

export default RegisterPage;
