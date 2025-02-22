import BlogPostPage from '@/app/components/blog.details';
import { Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { Metadata } from 'next';
import { strapiClient } from '@/markket/api';
import { generateSEOMetadata } from '@/markket/metadata';
import { Article } from '@/markket/article';

export interface BlogPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { id, slug } = await params;

  let response;
  if (!id || !slug) {
    response = await strapiClient.getPost(id.split('-')[0], slug);
  }

  const post = response?.data?.[0] as Article;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: post?.SEO,
      title: post?.Title,
      id: post?.id?.toString(),
    },
    type: 'article',
    defaultTitle: `Blog - ${post?.Title || 'Post'}`
  });
};

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
