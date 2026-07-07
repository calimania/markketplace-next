import { Container, Text, Stack, SimpleGrid, Paper, Group, Badge, Box, Title } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { BlogPostCard } from '@/app/components/docs/card';
import { notFound } from 'next/navigation';
import { Store } from "@/markket/store.d";
import { Article } from "@/markket/article";
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import { IconArticle } from '@tabler/icons-react';
import StorePageHeader from "@/app/components/ui/store.page.header";
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from '@/markket/colors.config';
import { cache, } from 'react';
import Link from 'next/link';
import { extractRichTextImageUrl, richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';

function createPicsumImageUrl(seed: string, width: number, height: number) {
  const safeSeed = encodeURIComponent(seed || 'markket');
  return `https://picsum.photos/seed/${safeSeed}/${width}/${height}?grayscale&blur=1`;
}

const getStoreCached = cache((slug: string) => strapiClient.getStore(slug));
const getBlogPageCached = cache((slug: string) => strapiClient.getPage('blog', slug));

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = slug ? await getBlogPageCached(slug) : undefined;

  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: page?.SEO,
      title: page?.Title,
      id: page?.id?.toString(),
      url: `/${slug}/blog`,
    },
    type: 'website',
    defaultTitle: 'Blog',
    defaultDescription: 'Discover our latest stories, insights, and updates.',
    keywords: ['blog', 'articles', 'stories', 'news', 'insights'],
  });
};

export default async function StoreBlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const storeResponse = await getStoreCached(slug);
  const store = storeResponse?.data?.[0] as Store;


  if (!store) {
    notFound();
  }

  const blogResponse = await getBlogPageCached(slug);
  const page = blogResponse?.data?.[0] as Page;
  const postsResponse = await strapiClient.getPosts({
    page: 1,
    pageSize: 50
  }, {
    sort: 'createdAt:desc'
  }, slug);

  const posts = postsResponse?.data || [] as Article[];
  const featuredPost = posts[0] as Article | undefined;
  const remainingPosts = posts.slice(1);
  const featuredContentImage = extractRichTextImageUrl(featuredPost?.Content);
  const featuredImage = featuredPost?.cover?.formats?.large?.url
    || featuredPost?.cover?.formats?.medium?.url
    || featuredPost?.cover?.url
    || featuredPost?.SEO?.socialImage?.url;
  const featuredFallbackImage = createPicsumImageUrl(
    [featuredPost?.Title, featuredPost?.slug, slug].filter(Boolean).join('-') || featuredPost?.id?.toString() || 'featured-post',
    1200,
    800,
  );
  const featuredExcerpt = featuredPost
    ? (featuredPost?.SEO?.metaDescription || stripMarkdown(richTextToPlainText(featuredPost?.Content)) || '').slice(0, 240)
    : '';

  const description = page?.SEO?.metaDescription || `Blog posts for ${store?.title || store?.SEO?.metaTitle}`;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <StorePageHeader
          icon={<IconArticle size={48} />}
          title={page?.Title || `${store?.title} Blog`}
          description={description}
          page={page}
          backgroundImage={page?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
          iconColor={markketColors.sections.blog.main}
        />

        {posts.length > 0 && (
          <Group justify="flex-end">
            <Badge size="md" radius="xl" variant="light" style={{ background: markketColors.sections.blog.light, color: markketColors.sections.blog.main }}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </Badge>
          </Group>
        )}

        {posts.length > 0 ? (
          <Stack gap="xl">
            {featuredPost && (
              <Paper withBorder radius="xl" style={{ overflow: 'hidden', borderColor: `${markketColors.sections.blog.main}33` }}>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
                  <Box
                    style={{
                      minHeight: 280,
                      background: featuredContentImage || featuredImage
                        ? `url(${featuredContentImage || featuredImage}) center/cover no-repeat`
                        : `url(${featuredFallbackImage}) center/cover no-repeat`,
                      position: 'relative',
                    }}
                  >
                    {!featuredContentImage && !featuredImage && (
                      <Box
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.06) 0%, rgba(2, 6, 23, 0.42) 100%)',
                        }}
                      />
                    )}
                  </Box>
                  <Stack gap="md" p="xl" justify="center">
                    <Badge size="sm" radius="xl" variant="light" style={{ width: 'fit-content', background: markketColors.sections.blog.light, color: markketColors.sections.blog.main }}>
                      Featured Story
                    </Badge>
                    <Title order={2} style={{ color: markketColors.neutral.charcoal }}>
                      {featuredPost.Title}
                    </Title>
                    {featuredExcerpt && (
                      <Text c="dimmed" size="sm" style={{ lineHeight: 1.7 }}>
                        {featuredExcerpt}{featuredExcerpt.length >= 240 ? '...' : ''}
                      </Text>
                    )}
                    <Link
                      href={`/${slug}/blog/${featuredPost.slug}`}
                      style={{
                        color: markketColors.sections.blog.main,
                        width: 'fit-content',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Read feature
                    </Link>
                  </Stack>
                </SimpleGrid>
              </Paper>
            )}

            {remainingPosts.length > 0 && (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                {remainingPosts.map((post) => (
                  <BlogPostCard
                    key={(post as Article)?.id}
                    post={post as Article}
                    prefix={`${slug}/blog`}
                    imageLoading="lazy"
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        ) : (
            <Paper
              withBorder
              radius="xl"
              p="xl"
              ta="center"
              style={{ borderColor: `${markketColors.sections.blog.main}33`, background: '#fff' }}
            >
              <Text size="lg" fw={600} style={{ color: markketColors.neutral.charcoal }}>
                No stories published yet.
              </Text>
              <Text c="dimmed" mt={6}>
                New articles and updates will appear here as soon as they go live.
              </Text>
            </Paper>
        )}
      </Stack>
      <PageContent params={{ page }} />
    </Container>
  );
};
