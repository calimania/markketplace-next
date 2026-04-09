'use client';

import { Container, Title, Text, Button, Group, Paper, Stack, Box, Badge } from '@mantine/core';
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
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';

export default function NotFound() {
  const router = useRouter();
  const embedded = useEmbeddedMode();
  const [page, setPage] = useState({} as Page);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async () => {
    try {
      const response = await strapiClient.getPage('404', markketplace.slug);
      setPage(response?.data?.[0] as Page);
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: `radial-gradient(1200px 400px at 12% -10%, ${markketColors.sections.shop.light}, transparent 55%), radial-gradient(900px 300px at 90% 0%, ${markketColors.sections.newsletter.light}, transparent 60%), #ffffff`,
      }}
    >
      <Container
        size="sm"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: embedded ? '1rem' : '2rem',
        }}
      >
        <Paper
          radius={embedded ? 'md' : 'xl'}
          p={embedded ? 'lg' : 'xl'}
          withBorder
          style={{
            width: '100%',
            borderColor: markketColors.neutral.lightGray,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Stack gap={embedded ? 'md' : 'lg'} align="center" style={{ textAlign: 'center', width: '100%' }}>
            <Badge radius="xl" variant="light" color="cyan" size="lg">
              You are off route
            </Badge>

            <Title
              fw={900}
              style={{
                fontSize: embedded ? 'clamp(56px, 16vw, 92px)' : 'clamp(84px, 18vw, 148px)',
                lineHeight: 0.9,
                background: `linear-gradient(135deg, ${markketColors.rosa.main}, ${markketColors.sections.blog.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
              }}
            >
              404
            </Title>

            {page?.Title && (
              <Title order={2} size="h2" style={{ color: markketColors.neutral.charcoal }}>
                {page.Title}
              </Title>
            )}

            {page?.Content && <PageContent params={{ page }} />}

            {!loading && !page?.Content && (
              <Stack gap="sm" maw={560}>
                <Title order={2} size={embedded ? 'h3' : 'h2'} style={{ color: markketColors.neutral.charcoal }}>
                  This page has moved or no longer exists
                </Title>
                <Text size={embedded ? 'sm' : 'md'} c="dimmed" style={{ lineHeight: 1.65 }}>
                  The link may be outdated, or the content was unpublished. Use the actions below to return to a safe route.
                </Text>
              </Stack>
            )}

            <Group justify="center" gap="md" mt={embedded ? 2 : 'sm'}>
              <Button
                variant="default"
                size={embedded ? 'sm' : 'md'}
                radius="md"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => router.back()}
                style={{ color: markketColors.neutral.darkGray }}
              >
                Go Back
              </Button>

              {!embedded && (
                <Button
                  component={Link}
                  href="/"
                  size={embedded ? 'sm' : 'md'}
                  radius="md"
                  leftSection={<IconHomeStar size={18} />}
                  style={{
                    background: markketColors.rosa.main,
                    color: 'white',
                  }}
                >
                  Go Home
                </Button>
              )}
            </Group>

            {!embedded && page?.SEO?.socialImage?.url && (
              <Paper
                mt="sm"
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
        </Paper>
      </Container>
    </Box>
  );
}
