'use client';

import { Container, Title, Text, Button, Group, rem, Paper, Stack } from '@mantine/core';
import { IconHomeStar, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import { Page } from '@/markket';
import { useEffect, useState, useCallback } from 'react';
import PageContent from '@/app/components/ui/page.content';
import Image from 'next/image';
import { markketColors } from '@/markket/colors.config';

export default function NotFound() {
  const router = useRouter();
  const [page, setPage] = useState({} as Page);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async () => {
    const response = await strapiClient.getPage('404', markketplace.slug);
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
      size="sm"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Stack gap="xl" align="center" style={{ textAlign: 'center', width: '100%' }}>
        {/* 404 Number */}
        <Title
          fw={900}
          style={{
            fontSize: rem(180),
            lineHeight: 0.9,
            background: `linear-gradient(135deg, ${markketColors.rosa.main}, ${markketColors.sections.blog.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          404
        </Title>

        {/* Custom Content or Default */}
        {page?.Title && (
          <Title order={2} size="h2" style={{ color: markketColors.neutral.charcoal }}>
            {page.Title}
          </Title>
        )}

        {page?.Content && <PageContent params={{ page }} />}

        {!loading && !page?.Content && (
          <Stack gap="md" maw={500}>
            <Title order={2} size="h2" style={{ color: markketColors.neutral.charcoal }}>
              Page Not Found
            </Title>
            <Text size="lg" c="dimmed" style={{ lineHeight: 1.6 }}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Let&apos;s get you back on track.
            </Text>
          </Stack>
        )}

        {/* Action Buttons */}
        <Group justify="center" gap="md" mt="md">
          <Button
            variant="subtle"
            size="lg"
            radius="md"
            leftSection={<IconArrowLeft size={20} />}
            onClick={() => router.back()}
            style={{
              color: markketColors.neutral.darkGray,
            }}
          >
            Go Back
          </Button>

          <Button
            component={Link}
            href="/"
            size="lg"
            radius="md"
            leftSection={<IconHomeStar size={20} />}
            style={{
              background: markketColors.rosa.main,
              color: 'white',
            }}
          >
            Go Home
          </Button>
        </Group>

        {/* Optional Image */}
        {page?.SEO?.socialImage?.url && (
          <Paper
            mt="xl"
            radius="md"
            style={{
              overflow: 'hidden',
              border: `1px solid ${markketColors.neutral.lightGray}`,
            }}
          >
            <Image
              src={page.SEO.socialImage.url}
              width={page.SEO.socialImage.width || 600}
              height={page.SEO.socialImage.height || 400}
              alt={page.SEO.socialImage.alternativeText || 'Page not found'}
              style={{ display: 'block' }}
            />
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
