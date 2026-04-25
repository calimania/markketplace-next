
import { strapiClient } from '@/markket/api.strapi';
import { generateSEOMetadata } from '@/markket/metadata';
import { markketplace } from '@/markket/config';
import { Metadata } from "next";

// Cache the homepage community data for 5 minutes — only this route, not other pages
export const revalidate = 300;
import HomePageComponent from '@/app/components/ui/home.page';
import type { Article } from '@/markket/article';
import type { Store } from '@/markket/store.d';
import type { Page } from '@/markket/page.d';
import type { Event } from '@/markket/event.d';
import type { Product } from '@/markket/product.d';

const prioritizeWithImage = <T,>(items: T[], hasImage: (item: T) => boolean): T[] => {
  return items
    .map((item, index) => ({ item, index, imagePriority: hasImage(item) ? 0 : 1 }))
    .sort((a, b) => a.imagePriority - b.imagePriority || a.index - b.index)
    .map(({ item }) => item);
};

const articleHasImage = (article: Article) => Boolean(
  article?.cover?.formats?.medium?.url ||
  article?.cover?.formats?.small?.url ||
  article?.cover?.url ||
  article?.SEO?.socialImage?.url ||
  article?.store?.Logo?.url,
);

const storeHasImage = (store: Store) => Boolean(
  store?.Logo?.url ||
  store?.Cover?.url ||
  store?.SEO?.socialImage?.url,
);

const pageHasImage = (page: Page) => Boolean(
  page?.store?.Logo?.url ||
  page?.SEO?.socialImage?.url,
);

const eventHasImage = (event: Event) => Boolean(
  event?.Thumbnail?.formats?.medium?.url ||
  event?.Thumbnail?.formats?.small?.url ||
  event?.Thumbnail?.url ||
  event?.Slides?.[0]?.formats?.medium?.url ||
  event?.Slides?.[0]?.formats?.small?.url ||
  event?.Slides?.[0]?.url ||
  event?.SEO?.socialImage?.url,
);

const productHasImage = (product: Product) => Boolean(
  product?.Thumbnail?.url ||
  product?.Slides?.[0]?.formats?.medium?.url ||
  product?.Slides?.[0]?.formats?.small?.url ||
  product?.Slides?.[0]?.url ||
  product?.SEO?.socialImage?.url,
);

const toAbsoluteUrl = (path?: string) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${markketplace.markket_url.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
};

export async function generateMetadata(): Promise<Metadata> {
  const { data: [page] } = await strapiClient.getPage('home');
  const storeSlug = process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG || markketplace.slug;
  const homepageTitle = page?.Title || 'Home';
  const homepageDescription = page?.SEO?.metaDescription ||
    'Discover independent stores, products, events, and stories on Markketplace.';

  return generateSEOMetadata({
    slug: storeSlug,
    entity: {
      SEO: page?.SEO,
      title: homepageTitle,
      url: `/`,
    },
    type: 'website',
    defaultTitle: homepageTitle,
    defaultDescription: homepageDescription,
    keywords: ['homepage', 'stores', 'products', 'events', 'marketplace'],
  });
};

/**
 * home page for the markketplace
 *
 * @returns {JSX.Element}
 */
export default async function Home() {
  const [{ data: [store] }, { data: [page] }, communityPostsResponse, storesResponse, communityPagesResponse, communityEventsResponse, communityProductsResponse] = await Promise.all([
    strapiClient.getStore(),
    strapiClient.getPage('home'),
    strapiClient.getCommunityPosts({ page: 1, pageSize: 18 }, { sort: 'publishedAt:desc' }),
    strapiClient.getStores({ page: 1, pageSize: 12 }, { filter: { 'active': { $eq: true } }, sort: 'updatedAt:desc' }),
    strapiClient.getCommunityPages({ page: 1, pageSize: 36 }, { sort: 'updatedAt:desc' }),
    strapiClient.getCommunityEvents({ page: 1, pageSize: 36 }, { sort: 'startDate:asc' }),
    strapiClient.getCommunityProducts({ page: 1, pageSize: 18 }, { sort: 'updatedAt:desc' }),
  ]);

  const communityPosts = prioritizeWithImage((communityPostsResponse?.data || []) as Article[], articleHasImage);
  const featuredStores = prioritizeWithImage((storesResponse?.data || []) as Store[], storeHasImage);
  const communityPages = prioritizeWithImage((communityPagesResponse?.data || []) as Page[], pageHasImage);
  const communityEvents = prioritizeWithImage((communityEventsResponse?.data || []) as Event[], eventHasImage);
  const communityProducts = prioritizeWithImage((communityProductsResponse?.data || []) as Product[], productHasImage);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: store?.title || page?.Title || 'Markketplace',
    url: markketplace.markket_url,
    description: page?.SEO?.metaDescription || store?.SEO?.metaDescription,
  };

  const productsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Products',
    itemListElement: communityProducts.slice(0, 8).map((product, index) => {
      const storeSlug = (product as any)?.stores?.[0]?.slug;
      const image = product?.Thumbnail?.url || product?.Slides?.[0]?.formats?.medium?.url || product?.Slides?.[0]?.formats?.small?.url || product?.Slides?.[0]?.url || product?.SEO?.socialImage?.url;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.Name,
          description: product?.SEO?.metaDescription || product?.Description || undefined,
          image: image ? toAbsoluteUrl(image) : undefined,
          url: storeSlug ? `${markketplace.markket_url}/${storeSlug}/products/${product.slug}` : undefined,
          offers: typeof product.usd_price === 'number' && product.usd_price > 0
            ? {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: (product.usd_price / 100).toFixed(2),
              availability: 'https://schema.org/InStock',
            }
            : undefined,
        }
      };
    }),
  };

  const eventsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Upcoming Events',
    itemListElement: communityEvents.slice(0, 8).map((event, index) => {
      const storeSlug = (event as any)?.stores?.[0]?.slug;
      const image = event?.Thumbnail?.formats?.medium?.url || event?.Thumbnail?.formats?.small?.url || event?.Thumbnail?.url || event?.Slides?.[0]?.formats?.medium?.url || event?.Slides?.[0]?.formats?.small?.url || event?.Slides?.[0]?.url || event?.SEO?.socialImage?.url;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: event.Name,
          startDate: event.startDate,
          endDate: event.endDate || undefined,
          eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          image: image ? toAbsoluteUrl(image) : undefined,
          description: event?.SEO?.metaDescription || event?.Description || undefined,
          url: storeSlug ? `${markketplace.markket_url}/${storeSlug}/events/${event.slug}` : undefined,
          offers: typeof event.usd_price === 'number' && event.usd_price > 0
            ? {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: (event.usd_price / 100).toFixed(2),
              availability: 'https://schema.org/InStock',
            }
            : undefined,
        }
      };
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {communityProducts.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }} />
      )}
      {communityEvents.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }} />
      )}
      <HomePageComponent
        store={store}
        page={page}
        communityPosts={communityPosts}
        featuredStores={featuredStores}
        communityPages={communityPages}
        communityEvents={communityEvents}
        communityProducts={communityProducts}
      />
    </>
  );
};
