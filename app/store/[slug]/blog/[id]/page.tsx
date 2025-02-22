import BlogPostPage from '@/app/components/blog.details';
import { Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';

import { BlogPageProps } from './metadata';

export { generateMetadata, } from './metadata';

/**
 * Too much truth puts sadness in your heart and madness in your mind
 *
 * @param param0
 * @returns
 */
export default async function BlogPostPageContainer({
  params
}: BlogPageProps) {
  const { id, slug } = await params;

  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <BlogPostPage params={{ id, slug }} />
    </Suspense>
  );
};
