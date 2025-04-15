// import { createSwaggerSpec } from 'next-swagger-doc';
// import dynamic from 'next/dynamic';
// import 'swagger-ui-react/swagger-ui.css';

import { Container, Title, Text, Stack, Image } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Article } from "@/markket/article.d";
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from "next";
import PageContent from "@/app/components/ui/page.content";
import PreviewRequest from '@/app/components/ui/api.requests';

interface DocsPageProps {
  params: Promise<{ article_slug: string }>;
}

export async function generateMetadata({ }: DocsPageProps): Promise<Metadata> {

  const { data: [_post] } = await strapiClient.getPost('api');
  const post = _post as Article;

  return generateSEOMetadata({
    slug: process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG as string,
    entity: {
      url: `/docs/api`,
      SEO: post?.SEO,
      title: post?.Title,
    },
    type: 'article',
  });
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { article_slug } = await params;

  const response = await strapiClient.getPost(article_slug);
  const post = response?.data?.[0] as Article;

  if (!post) {
    notFound();
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {post.cover && (
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
            <div className="flex gap-2 mt-2">
              {post.Tags.map((tag) => (
                <Text
                  key={tag.id}
                  size="sm"
                  c={tag.Color?.toLowerCase() || 'blue'}
                >
                  #{tag.Label}
                </Text>
              ))}
            </div>
          )}
        </div>
        <PageContent params={{ post }} />
      </Stack>
      <PreviewRequest />
    </Container>
  );
};

