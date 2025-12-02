import { Product } from "@/markket/product.d";
import { strapiClient } from "@/markket/api.strapi";
import { notFound } from "next/navigation";
import Markdown from "@/app/components/ui/page.markdown";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/markket/metadata";
import { markketplace } from "@/markket/config";
import ProductCard from "@/app/components/ui/product.card";
import {
  Container,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Box,
  Divider,
  Stack,
  Button,
} from "@mantine/core";
import { IconShoppingBag, IconMail } from '@tabler/icons-react';
import StorePageHeader from "@/app/components/ui/store.page.header";
import { markketColors } from '@/markket/colors.config';
import './product-list.css';
import './product-page-effects.css';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: [StoreProductPage] } = await strapiClient.getPage('products', slug);
  const { data: products } = await strapiClient.getProducts({ page: 1, pageSize: 100 }, { filter: '', sort: '' }, slug);

  let page = StoreProductPage;
  if (!page) {
    const { data } = await strapiClient.getPage('products', markketplace.slug);
    page = data?.[0];
  }

  const productCount = products?.length || 0;
  const productNames = (products as Product[])?.slice(0, 5).map(p => p.Name).filter(Boolean) || [];

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}/products`,
      SEO: page?.SEO,
      id: page?.id?.toString(),
    },
    defaultTitle: `Shop`,
    defaultDescription: productCount > 0
      ? `Browse ${productCount} products. ${productNames.slice(0, 3).join(', ')}${productNames.length > 3 ? ' and more' : ''}.`
      : `Discover our curated collection of quality products.`,
    keywords: ['products', 'shop', 'buy', 'ecommerce', ...productNames.slice(0, 5)],
  });
}; export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  const { data: [StoreProductPage] } = await strapiClient.getPage('products', slug);

  let page = StoreProductPage;
  if (!page) {
    const { data } = await strapiClient.getPage('products', markketplace.slug);
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
    <Container size="lg" py="xl">
      <StorePageHeader
        icon={<IconShoppingBag size={48} />}
        title={title}
        description="Discover our curated collection of products. Each item is carefully selected to ensure quality and satisfaction."
        page={page}
        backgroundImage={page?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
        iconColor={markketColors.sections.shop.main}
      />

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

      {/* Newsletter CTA */}
      <Divider my="xl" />
      <Paper
        p="xl"
        radius="md"
        style={{
          background: markketColors.neutral.offWhite,
          borderWidth: '1px',
          borderColor: markketColors.neutral.gray,
        }}
      >
        <Stack align="center" gap="md">
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: '8px',
              background: markketColors.rosa.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconMail size={28} color={markketColors.rosa.main} stroke={1.5} />
          </Box>
          <Title order={3} ta="center" fw={500} style={{ color: markketColors.neutral.charcoal }}>
            Stay in the Loop
          </Title>
          <Text size="sm" ta="center" maw={500} style={{ color: markketColors.neutral.mediumGray, lineHeight: 1.5 }}>
            Get notified when we add new products and special offers.
          </Text>
          <Button
            component="a"
            href={`/${slug}/about/newsletter`}
            size="md"
            radius="md"
            style={{
              background: markketColors.rosa.main,
              color: 'white',
              fontWeight: 500,
            }}
            leftSection={<IconMail size={18} />}
          >
            Subscribe Now
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
