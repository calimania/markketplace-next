import { Product } from "@/markket/product.d";
import { strapiClient } from "@/markket/api.strapi";
import { notFound } from "next/navigation";
import StoreHeaderButtons from "@/app/components/ui/store.header.buttons";
import Markdown from "@/app/components/ui/page.markdown";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/markket/metadata";
import { markketConfig } from "@/markket/config";
import ProductCard from "@/app/components/ui/product.card";
import {
  Container,
  Title,
  Text,
  Group,
  Paper,
  SimpleGrid,
  Box,
  Divider,
} from "@mantine/core";
import { IconShoppingBag } from '@tabler/icons-react';
import PageContent from "@/app/components/ui/page.content";
import './product-list.css';
import './product-page-effects.css';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: [StoreProductPage] } = await strapiClient.getPage('products', slug);

  let page = StoreProductPage;
  if (!page) {
    const { data } = await strapiClient.getPage('products', markketConfig.slug);
    page = data?.[0];
  }

  return generateSEOMetadata({
    slug: `store/${slug}/products`,
    entity: {
      url: `/store/${slug}/products`,
      SEO: page?.SEO,
      id: page?.id?.toString(),
    },
    defaultTitle: `Products`,
  });
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  const { data: [StoreProductPage] } = await strapiClient.getPage('products', slug);

  let page = StoreProductPage;
  if (!page) {
    const { data } = await strapiClient.getPage('products', markketConfig.slug);
    page = data?.[0];
  }

  if (!store) {
    notFound();
  }

  const productsResponse = await strapiClient.getProducts(
    { page: 1, pageSize: 50 },
    { sort: "createdAt:desc", filter: "" },
    slug
  );
  const products = productsResponse?.data || [];

  const title = StoreProductPage?.Title || `${store?.title} Products`;

  return (
    <Container size="xl" py="xl">
      <Paper
        radius="md"
        p={40}
        mb={40}
        className="product-hero-paper"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(${page?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Group justify="center" mb="xl">
          <IconShoppingBag size={48} color="var(--mantine-color-blue-6)" />
        </Group>

        <Title order={1} ta="center" mb="sm">
          {title}
        </Title>

        {page?.Content ? (
          <Box maw={600} mx="auto">
            <PageContent params={{ page }} />
          </Box>
        ) : (
          <Text c="dimmed" size="lg" ta="center" maw={600} mx="auto">
            Discover our curated collection of products. Each item is carefully selected to ensure quality and satisfaction.
          </Text>
        )}

        <Group justify="center" mt="xl">
          <StoreHeaderButtons store={store} />
        </Group>
      </Paper>

      {!!products.length && (<Title order={2} size="h3" mb={40}>
        Product Catalog
      </Title>)}

      <Box mb={40}>
        {products.length > 0 ? (
          <SimpleGrid
            cols={{ base: 1, sm: 2 }}
            spacing="xl"
            verticalSpacing="xl"
            className="product-grid"
          >
            {products.map((product) => (
              <Box
                key={(product as Product).id}
                className="product-card-neobrutal"
                style={{
                  transform: 'translateY(0)',
                  transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s',
                  borderWidth: 3,
                  borderColor: '#222',
                  borderStyle: 'solid',
                  boxShadow: '6px 6px 0 #222',
                  background: '#fffbe6',
                  borderRadius: 16,
                }}
              >
                <ProductCard
                  product={product as Product}
                  slug={slug}
                />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Paper p="xl" withBorder ta="center">
            <Text size="lg" c="dimmed">
              No products available yet. Check back soon!
            </Text>
          </Paper>
        )}
      </Box>

      {/* Store Description */}
      {store?.Description && (
        <>
          <Divider my={40} className="product-divider" />
          <Paper p="xl" radius="md" withBorder className="about-fade-in">
            <Title order={2} size="h3" mb="md" ta="center">
              About {store.title}
            </Title>
            <Box maw={800} mx="auto">
              <Markdown content={store.Description} />
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};
