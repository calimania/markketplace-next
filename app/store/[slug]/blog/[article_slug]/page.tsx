import BlogPostPage from '@/app/components/blog.details';
import { Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { Metadata } from 'next';
import { strapiClient } from '@/markket/api.strapi';
import { Article } from '@/markket/article';
import { generateSEOMetadata } from '@/markket/metadata';

export interface BlogPageProps {
  params: Promise<{
    slug: string;
    article_slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { article_slug, slug } = await params;

  let response;
  if (article_slug && slug) {
    response = await strapiClient.getPost(article_slug, slug);
  }

  const post = response?.data?.[0] as Article;

  const articleTitle = post?.Title || 'Blog Post';
  const description = post?.SEO?.metaDescription;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: post?.SEO,
      Title: post?.Title,  // Pass real value, not fallback
      Description: description,
      id: post?.id?.toString(),
      url: `/${slug}/blog/${article_slug}`,
    },
    type: 'article',
    defaultTitle: 'Blog Post',
    keywords: [
      'blog',
      'article',
      articleTitle,
      ...(post?.Tags?.map(t => t.Label) || []),
    ],
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
  const { article_slug, slug } = await params;

  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <BlogPostPage params={{ article_slug, slug }} />
    </Suspense>
  );
};
