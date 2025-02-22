import { Container, Title, Paper, Stack } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

interface PageProps {
  params: Promise<{ page_slug: string, slug: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { page_slug, slug } = await params;
  const response = await strapiClient.getPage(page_slug, slug);
  const page = response?.data?.[0];

  if (!page) {
    notFound();
  }

  return (
    <Container size="md">
      <Stack gap="xl">
        {page.SEO?.socialImage && (
          <img
            src={page.SEO.socialImage.url}
            alt={page.Title}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        )}

        <Title order={1}>{page.Title}</Title>

        <Paper p="md" withBorder>
          <BlocksRenderer content={page.Content as BlocksContent} />
        </Paper>
      </Stack>
    </Container>
  );
};
