import { Container, Title, Text, Stack, Box, Group, Badge } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import StoreGrid from '@/app/components/stores/grid';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "@/app/components/ui/page.content";
import { markketColors } from '@/markket/colors.config';
import { markketplace } from "@/markket/config";

export async function generateMetadata(): Promise<Metadata> {
  const response = await strapiClient.getPage('stores', markketplace.slug);
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
      { page: 1, pageSize: 41 },
      { filter: {}, sort: 'active:desc,updatedAt:desc' }
    ),
    strapiClient.getPage('stores'),
  ]);
  const store = storeResponse.data?.[0];
  const stores = response?.data || [];
  const page = pageResponse?.data?.[0] as Page;

  return (
    <Container size="xl" pt={0} pb={{ base: 'xl', md: 60 }}>
      <Stack gap="xl">
        <Box
          style={{
            background: `linear-gradient(120deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 54%, ${markketColors.sections.shop.main} 100%)`,
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            marginTop: 0,
            overflow: 'hidden',
            position: 'relative',
            paddingTop: 46,
            paddingBottom: 52,
          }}
        >
          <Box
            style={{
              inset: 0,
              position: 'absolute',
              background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 38%), radial-gradient(circle at 80% 75%, rgba(255,255,255,0.18), transparent 34%)',
              pointerEvents: 'none',
            }}
          />
          <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
            <Stack align="center" gap="md">
              <img
                src={store?.Logo?.url || markketplace.blank_logo_url}
                alt={store?.SEO?.metaTitle || 'Markket Logo'}
                style={{ width: 82, height: 82, borderRadius: 16, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: 8 }}
              />
              <Title
                ta="center"
                c="white"
                style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 850, lineHeight: 1.16 }}
              >
                {page?.Title || 'Discover Stores'}
              </Title>
              <Text size="lg" ta="center" c="rgba(255,255,255,0.96)" maw={760} style={{ lineHeight: 1.55 }}>
                {page?.SEO?.metaDescription || store?.SEO?.metaDescription || 'Explore highlights from independent creators and browse the latest stores joining the marketplace.'}
              </Text>
              <Group gap="xs" justify="center">
                <Badge
                  variant="light"
                  radius="xl"
                  style={{
                    background: 'rgba(255,255,255,0.94)',
                    color: markketColors.neutral.charcoal,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Highlights
                </Badge>
                <Badge
                  variant="light"
                  radius="xl"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    color: markketColors.neutral.charcoal,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Discover
                </Badge>
              </Group>
            </Stack>
          </Container>
        </Box>
        <StoreGrid stores={stores} />
        <PageContent params={{ page }} />
      </Stack>
    </Container>
  );
}
