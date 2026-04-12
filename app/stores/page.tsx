import { Container, Title, Text, Stack, Box, Paper, Group, Badge } from "@mantine/core";
import { IconSparkles } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import { Store } from "@/markket/store.d";
import StoreGrid from '@/app/components/stores/grid';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "../components/ui/page.content";
import { markketColors } from '@/markket/colors.config';

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

export async function generateMetadata(): Promise<Metadata> {
  const response = await strapiClient.getPage('stores');
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug: 'stores',
    entity: {
      url: '/stores',
      SEO: page?.SEO,
      Title: page?.Title,
    },
    defaultTitle: 'Stores',
    type: 'website',
  });
}

export default async function StoresPage() {
  const [storeResponse, response, pageResponse] = await Promise.all([
    strapiClient.getStore(),
    strapiClient.getStores(
      { page: 1, pageSize: 30 },
      { filter: '', sort: 'active:desc,updatedAt:desc' }
    ),
    strapiClient.getPage('stores'),
  ]);

  const store = storeResponse.data?.[0];

  const stores = ((response?.data || []) as Array<Store & { active?: boolean }>).sort((a, b) => {
    const activeDiff = Number(Boolean(b.active)) - Number(Boolean(a.active));
    if (activeDiff !== 0) return activeDiff;

    const updatedA = new Date(a.updatedAt || 0).getTime();
    const updatedB = new Date(b.updatedAt || 0).getTime();
    if (updatedB !== updatedA) return updatedB - updatedA;

    return a.title.localeCompare(b.title);
  }) as Store[];

  const page = pageResponse?.data?.[0] as Page;

  return (
    <Container size="xl" py={{ base: 'xl', md: 60 }}>
      <Stack gap="xl">
        {/* Hero */}
        <Paper
          radius="xl"
          p={{ base: 'lg', md: 48 }}
          style={{
            background: markketColors.gradients.hero,
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              pointerEvents: 'none',
            }}
          />
          <Stack align="center" gap="md" style={{ position: 'relative', zIndex: 1 }}>
            <img
              src={store?.Logo?.url || defaultLogo}
              alt={store?.SEO?.metaTitle || 'Markket Logo'}
              style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: 8 }}
            />
            <Title
              ta="center"
              c="white"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2 }}
            >
              {page?.Title || `Discover Stores`}
            </Title>
            <Text size="md" ta="center" c="rgba(255,255,255,0.85)" maw={500}>
              {page?.SEO?.metaDescription || store?.SEO?.metaDescription || 'Discover amazing independent stores'}
            </Text>
            <Group gap="xs">
              <Badge variant="light" radius="xl" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <IconSparkles size={12} style={{ marginRight: 4 }} />
                {stores.length} stores
              </Badge>
            </Group>
          </Stack>
        </Paper>

        <StoreGrid stores={stores} />
        <PageContent params={{ page }} />
      </Stack>
    </Container>
  );
}
