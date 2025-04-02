'use client';

import { Container, Title, Text, Button, Group, rem, Paper } from '@mantine/core';
import { IconHomeStar, IconBow } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { strapiClient } from '@/markket/api.strapi';
import { markketConfig } from '@/markket/config';
import { Page } from '@/markket';
import { useEffect, useState, useCallback } from 'react';
import PageContent from '@/app/components/ui/page.content';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();
  const [page, setPage] = useState({} as Page);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async () => {
    const response = await strapiClient.getPage('404', markketConfig.slug);
    //  page = response?.data?.[0] as Page;
    setPage(response?.data?.[0] as Page);
    setLoading(false);
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchPage();
    }
  }, [loading, fetchPage]);

  return (
    <Container
      h="100vh"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: rem(480), textAlign: 'center' }}>
        <Title
          fw={900}
          size="xxl"
          style={{
            fontSize: rem(140),
            lineHeight: 1,
            background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </Title>
        <Title order={3} size="h3" mt="xl">
          {page.Title || ''}
        </Title>

        {page?.Content && <PageContent params={{ page }} />}

        {!loading && !page.Content && (
          <>
            <Title order={2} size="h1" mt="xl">
              You&apos;ve found a secret place...
            </Title>
            <Text size="lg" c="dimmed" mt="md">
              Unfortunately, this is a generic 404 page. You may have mistyped the address,
              or the page has been moved to another URL.
            </Text>
          </>
        )}

        <Group justify="center" mt="xl" gap="md">
          <Button
            variant="light"
            size="md"
            leftSection={<IconBow size={18} />}
            onClick={() => router.back()}
          >
            Go back
          </Button>

          <Button
            component={Link}
            href="/"
            size="md"
            leftSection={<IconHomeStar size={18} />}
          >
            Take me home
          </Button>
        </Group>
        <div>
          {page?.SEO?.socialImage?.url && (
            <Paper mt="xl" withBorder p="xs">
              <Image
                src={page?.SEO?.socialImage?.url}
                width={page?.SEO?.socialImage?.width || '600'}
                height={page?.SEO?.socialImage?.height}
                alt={page?.SEO?.socialImage?.alternativeText as string || `not found`}
              />
            </Paper>
          )}
        </div>
      </div>
    </Container>
  );
}
