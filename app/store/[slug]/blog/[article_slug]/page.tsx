import { Container, Image, Stack, Text, Title } from '@mantine/core';
import { Metadata } from 'next';
import { strapiClient } from '@/markket/api.strapi';
import { Article } from '@/markket/article';
import { generateSEOMetadata } from '@/markket/metadata';
import PageContent from '@/app/components/ui/page.content';
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';

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

  const [postResponse, storeResponse, postsResponse] = await Promise.all([
    strapiClient.getPost(article_slug, slug),
    strapiClient.getStore(slug),
    strapiClient.getPosts({ page: 1, pageSize: 5 }, { sort: 'updatedAt:desc' }, slug),
  ]);

  const post = postResponse?.data?.[0] as Article | undefined;
  const store = storeResponse?.data?.[0];

  if (!post) {
    return null;
  }

  const relatedPosts = ((postsResponse?.data || []) as Article[])
    .filter((item) => item.slug !== article_slug)
    .slice(0, 4)
    .map((item) => ({
      href: `/${slug}/blog/${item.slug}`,
      label: item.Title || item.slug,
    }));

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {post.cover?.url && (
          <Image
            src={post.cover.url}
            alt={post.Title}
            radius="md"
            className="w-full"
          />
        )}

        <div>
          <Title order={1}>{post.Title}</Title>
          {post.Tags && (
            <div className="mt-2 flex gap-2">
              {post.Tags.map((tag) => (
                <Text key={tag.id} size="sm" c={tag.Color?.toLowerCase() || 'blue'}>
                  #{tag.Label}
                </Text>
              ))}
            </div>
          )}
        </div>

        <PageContent params={{ post }} />

        <StoreCrosslinks
          slug={slug}
          store={store}
          currentSection="blog"
          items={relatedPosts}
        />
      </Stack>
    </Container>
  );
};
