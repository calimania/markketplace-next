

import { Metadata } from 'next';
import { generateSEOMetadata } from '@/markket/metadata';
import ForgotPaswordPageComponent from '@/app/components/auth/reset.password.page';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    slug: 'auth/forgot-password',
    entity: {
      url: `/auth/forgot-password`,
      title: 'Forgot Password',
    },
    type: 'website',
  });
}

export default ForgotPaswordPageComponent;
