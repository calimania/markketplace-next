import { Product } from "@/markket/product.d";
import { strapiClient } from "@/markket/api.strapi";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/markket/metadata";
import { markketplace } from "@/markket/config";
import ProductCard from "@/app/components/ui/product.card";
import PageContent from '@/app/components/ui/page.content';
import {
  Container,
  Text,
  Paper,
  SimpleGrid,
  Box,
  Group,
  Button,
} from "@mantine/core";
import { IconShoppingBag, IconMail } from '@tabler/icons-react';
import StorePageHeader from "@/app/components/ui/store.page.header";
import { markketColors } from '@/markket/colors.config';
import { cache } from 'react';
import './product-list.css';
import './product-page-effects.css';

const getStoreCached = cache((slug: string) => strapiClient.getStore(slug));
const getProductsPageCached = cache((slug: string) => strapiClient.getPage('products', slug));

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: [StoreProductPage] } = await getProductsPageCached(slug);
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
  const storeResponse = await getStoreCached(slug);
  const store = storeResponse?.data?.[0];

  const { data: [StoreProductPage] } = await getProductsPageCached(slug);

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
        description="Discover the current collection from this storefront, from signature pieces to fresh arrivals."
        page={page}
        backgroundImage={page?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
        iconColor={markketColors.sections.shop.main}
      />

      <Box mb={40}>
        {products.length > 0 ? (
          <SimpleGrid
            cols={{ base: 1, sm: 2 }}
            spacing="lg"
            verticalSpacing="lg"
            className="product-grid"
          >
            {products.map((product) => (
              <ProductCard
                key={(product as Product).id}
                product={product as Product}
                slug={slug}
              />
            ))}
          </SimpleGrid>
        ) : (
            <Paper p="xl" withBorder radius="xl" ta="center" style={{ borderColor: `${markketColors.sections.shop.main}33` }}>
              <Text size="lg" fw={600} style={{ color: markketColors.neutral.charcoal }}>
                The shop is being prepared.
              </Text>
              <Text c="dimmed" mt={6}>
                Products will appear here as soon as new items are added.
            </Text>
          </Paper>
        )}
      </Box>

      <PageContent params={{ page }} />

      <Group justify="center" mt="xl">
        <Button
          component="a"
          href={`/${slug}/about/newsletter`}
          variant="subtle"
          radius="xl"
          size="sm"
          leftSection={<IconMail size={16} />}
          style={{ color: markketColors.sections.newsletter.main }}
        >
          Subscribe for updates
        </Button>
      </Group>
    </Container>
  );
};
