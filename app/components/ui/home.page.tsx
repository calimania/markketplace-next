'use client';

import {
  IconRocket, IconBuildingStore,
  IconSparkles, IconArrowRight,
  IconCalendar,
} from "@tabler/icons-react";
import { Store, Page, Article, Event, Product } from "@/markket";
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from "@/markket/colors.config";
import { extractRichTextImageUrl, stripMarkdown } from '@/markket/richtext.utils';
import { StorefrontCarousel } from '@/app/components/ui/storefront.carousel';
import { FeatureCard } from '@/app/components/ui/feature.card';

const features = [
  {
    icon: IconRocket,
    title: "Launch in Minutes",
    description: "Verify email, add products, start selling. Simple as that.",
    color: markketColors.sections.events.main,
  },
  {
    icon: IconBuildingStore,
    title: "Own Your Content",
    description: "No ads or invasive trackers",
    color: markketColors.sections.shop.main,
  },
  {
    icon: IconSparkles,
    title: "Customizable",
    description: "Open source, headless, self-host, community support.",
    color: markketColors.rosa.main,
  },
];

const pickBestImage = (...values: Array<string | undefined | null>) => {
  return values.find((value): value is string => Boolean(value));
};

const createFallbackCoverUrl = (seed: string, width: number, height: number) => {
  const safeSeed = encodeURIComponent(seed || 'markket');
  return `https://picsum.photos/seed/${safeSeed}/${width}/${height}?grayscale&blur=1`;
};

const hasValidTimeZone = (value?: string) => {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const formatEventDate = (value?: string, timeZone?: string) => {
  if (!value) return 'TBD';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'TBD';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(hasValidTimeZone(timeZone) ? { timeZone } : {}),
  }).format(parsed);
};

type HomePageProps = {
  store?: Store;
  page?: Page;
  communityPosts?: Article[];
  featuredStores?: Store[];
  communityPages?: Page[];
  communityEvents?: Event[];
  communityProducts?: Product[];
};

const SectionLabel = ({ num, label, color }: { num: string; label: string; color?: string }) => (
  <span
    className="block text-xs font-semibold uppercase tracking-widest font-mono mb-1"
    style={{ color: color || markketColors.neutral.mediumGray }}
  >
    {num} — {label}
  </span>
);

const HomePage = ({
  store,
  page,
  communityPosts = [],
  featuredStores = [],
  communityPages = [],
  communityEvents = [],
  communityProducts = []
}: HomePageProps) => {
  const eventsToDisplay = communityEvents;

  return (
    <main className="min-h-screen bg-white selection:bg-rose-100 selection:text-rose-900">

      {/* ── 00 — STORES ───────────────────────────────────── */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <SectionLabel num="00" label="Stores" color={markketColors.sections.shop.main} />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-950 mt-1">
                Discover Creators
              </h2>
            </div>
            <a
              href="/stores"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              All stores <IconArrowRight size={14} />
            </a>
          </div>

          {featuredStores.length > 0 ? (
            <StorefrontCarousel stores={featuredStores} />
          ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <p className="text-gray-500 mb-4 font-medium">No stores yet — be the first!</p>
                <a
                  href="/auth/magic"
                  className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: markketColors.rosa.main }}
                >
                  Create your store
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── 01 — PLATFORM ───────────────────────────────────── */}
      <section
        className="py-20 border-b border-gray-100"
        style={{ backgroundColor: markketColors.neutral.offWhite }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <SectionLabel num="01" label="Platform" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 mt-2 leading-[1.05]">
                {store?.SEO?.metaTitle || 'Markkët'}
                <br />
                <span style={{ color: markketColors.rosa.main }}>Content Manager</span>
              </h1>
            </div>
            <div className="md:col-span-5 flex flex-col gap-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                {store?.SEO?.metaDescription ||
                  'Beautiful storefronts for creators, artists, and small businesses. Start selling today.'}
              </p>
              <div>
                <a
                  href="/auth/magic"
                  className="inline-flex items-center gap-2 px-6 py-3.5 font-semibold text-white rounded-2xl shadow-lg shadow-rose-500/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
                  style={{ backgroundColor: markketColors.rosa.main }}
                >
                  <IconSparkles size={16} /> Create your store
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 — BLOG ───────────────────────────────────────── */}
      {communityPosts.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <SectionLabel num="02" label="Blog" color={markketColors.sections.blog.main} />
                <h2 className="text-3xl font-extrabold text-gray-950 mt-1">Latest Stories</h2>
                <p className="text-gray-500 mt-1">Fresh writing from creators across the community.</p>
              </div>
              <a
                href="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                See all stories <IconArrowRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityPosts.slice(0, 6).map((post) => {
                const contentImage = extractRichTextImageUrl(post?.Content);
                const coverUrl = pickBestImage(
                  contentImage,
                  post?.cover?.formats?.medium?.url,
                  post?.cover?.formats?.small?.url,
                  post?.cover?.formats?.thumbnail?.url,
                  post?.cover?.url,
                  post?.SEO?.socialImage?.formats?.medium?.url,
                  post?.SEO?.socialImage?.formats?.small?.url,
                  post?.SEO?.socialImage?.formats?.thumbnail?.url,
                  post?.SEO?.socialImage?.url,
                  post?.store?.Logo?.formats?.small?.url,
                  post?.store?.Logo?.formats?.thumbnail?.url,
                  post?.store?.Logo?.url,
                );
                const storeSlug = post?.store?.slug;
                const href = storeSlug ? `/${storeSlug}/blog/${post.slug}` : '/docs';
                const fallbackCoverUrl = createFallbackCoverUrl(
                  [post.Title, post.slug, post.documentId, storeSlug].filter(Boolean).join('-') || post.id?.toString() || 'blog-post',
                  900,
                  520,
                );

                return (
                  <a
                    key={post.documentId || post.id}
                    href={href}
                    className="group flex flex-col overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    aria-label={`Read blog post ${post.Title}`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={post.Title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                          <div
                            className="w-full h-full bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${fallbackCoverUrl})` }}
                          >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">Blog</span>
                        {post?.store?.title && (
                          <span className="text-xs text-gray-500 font-medium">{post.store.title}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug mb-2">
                        {post.Title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                        {post?.SEO?.metaDescription || '...'}
                      </p>

                      <span
                        className="text-sm font-semibold mt-auto flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                        style={{ color: markketColors.sections.blog.main }}
                      >
                        Read story <IconArrowRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 03 — EVENTS ──────────────────────────────────── */}
      {eventsToDisplay.length > 0 && (
        <section
          className="py-20 border-t border-gray-100"
          style={{ backgroundColor: `${markketColors.sections.events.light}30` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <SectionLabel num="03" label="Events" color={markketColors.sections.events.main} />
                <h2 className="text-3xl font-extrabold text-gray-950 mt-1">Join upcoming events</h2>
                <p className="text-gray-500 mt-1">Workshops, launches, and meetups from community stores.</p>
              </div>
              <a
                href="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-white hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                More Events <IconArrowRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventsToDisplay.slice(0, 9).map((event: Event) => {
                const thumbnailUrl = pickBestImage(
                  event?.Thumbnail?.formats?.medium?.url,
                  event?.Thumbnail?.formats?.small?.url,
                  event?.Thumbnail?.formats?.thumbnail?.url,
                  event?.Thumbnail?.url,
                  event?.Slides?.[0]?.formats?.medium?.url,
                  event?.Slides?.[0]?.formats?.small?.url,
                  event?.Slides?.[0]?.formats?.thumbnail?.url,
                  event?.Slides?.[0]?.url,
                  event?.SEO?.socialImage?.formats?.medium?.url,
                  event?.SEO?.socialImage?.formats?.small?.url,
                  event?.SEO?.socialImage?.formats?.thumbnail?.url,
                  event?.SEO?.socialImage?.url,
                  (event as any)?.stores?.[0]?.Logo?.formats?.small?.url,
                  (event as any)?.stores?.[0]?.Logo?.formats?.thumbnail?.url,
                  (event as any)?.stores?.[0]?.Logo?.url,
                );
                const storeSlug = (event as any)?.stores?.[0]?.slug;
                const href = storeSlug ? `/${storeSlug}/events/${event.slug}` : '/stores';
                const eventDate = formatEventDate(event.startDate, event.timezone);

                return (
                  <a
                    key={event.documentId || event.id}
                    href={href}
                    className="group flex flex-col h-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    aria-label={`Learn more about event ${event.Name}`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={event.Name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                            style={{ backgroundColor: markketColors.sections.events.light, color: markketColors.sections.events.main }}
                          >
                          <IconCalendar size={32} className="mb-1" />
                          <span className="text-sm font-semibold">Event</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                          <IconCalendar size={12} /> {eventDate}
                        </span>
                        {(event as any)?.stores?.[0]?.title && (
                          <span className="text-xs text-gray-500 font-medium">{(event as any).stores[0].title}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug mb-2">
                        {event.Name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {event?.SEO?.metaDescription || 'Join us for this event'}
                      </p>

                      <span
                        className="text-sm font-semibold mt-auto flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                        style={{ color: markketColors.sections.events.main }}
                      >
                        View event <IconArrowRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 05 — FEATURES ───────────────────────────────── */}
      {communityProducts.length > 0 && (
        <section
          className="py-16 border-b border-gray-100"
          style={{ backgroundColor: markketColors.neutral.offWhite }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <SectionLabel num="05" label="Features" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 — SHOP ───────────────────────────────────── */}
      {communityProducts.length > 0 && (
        <section
          className="py-20"
          style={{ backgroundColor: `${markketColors.sections.shop.light}30` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <SectionLabel num="06" label="Shop" color={markketColors.sections.shop.main} />
                <h2 className="text-3xl font-extrabold text-gray-950 mt-1">Shop Community Picks</h2>
                <p className="text-gray-500 mt-1">Featured products from active stores.</p>
              </div>
              <a
                href="/stores"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                Browse Stores <IconArrowRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityProducts.slice(0, 6).map((product) => {
                const storeSlug = (product as any)?.stores?.[0]?.slug;
                const contentImage = extractRichTextImageUrl(product?.Description as string);
                const productImage = pickBestImage(
                  contentImage,
                  product?.Thumbnail?.url,
                  product?.Slides?.[0]?.formats?.medium?.url,
                  product?.Slides?.[0]?.formats?.small?.url,
                  product?.Slides?.[0]?.formats?.thumbnail?.url,
                  product?.Slides?.[0]?.url,
                );
                const href = storeSlug ? `/${storeSlug}/products/${product.slug}` : '/stores';
                const price = typeof product.usd_price === 'number' && product.usd_price > 0
                  ? `$${(product.usd_price / 100).toFixed(2)}`
                  : 'See details';

                return (
                  <a
                    key={product.documentId || product.id}
                    href={href}
                    className="group flex flex-col overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    aria-label={`View product ${product.Name}`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.Name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                          <div
                            className="w-full h-full bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${createFallbackCoverUrl([product.Name, product.slug, storeSlug].filter(Boolean).join('-') || product.id?.toString() || 'product', 900, 520)})` }}
                          >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md">Product</span>
                        {(product as any)?.stores?.[0]?.title && (
                          <span className="text-xs text-gray-500 font-medium">{(product as any).stores[0].title}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-cyan-600 transition-colors line-clamp-2 leading-snug mb-1">
                        {product.Name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                        {product?.SEO?.metaDescription || stripMarkdown(product?.Description as string) || 'Discover this product from the Markket community.'}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <span className="text-sm font-bold text-gray-900">{price}</span>
                        <span
                          className="text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                          style={{ color: markketColors.sections.shop.main }}
                        >
                          View Product <IconArrowRight size={14} className="stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CUSTOM PAGE CONTENT ───────────────────────────── */}
      {page?.Content && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageContent params={{ page }} />
        </section>
      )}

      {/* ── 04 — PAGES ──────────────────────────────────── */}
      {communityPages.length > 0 && (
        <section
          className="py-20 border-t border-gray-100"
          style={{ backgroundColor: markketColors.neutral.offWhite }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <SectionLabel num="04" label="Pages" color={markketColors.sections.about.main} />
              <h2 className="text-3xl font-extrabold text-gray-950 mt-1">From the Community</h2>
              <p className="text-gray-500 mt-1">Evergreen pages from creators, studios, and brands.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityPages.slice(0, 6).map((p) => {
                const storeSlug = (p as any)?.store?.slug;
                const href = storeSlug ? `/${storeSlug}/about/${p.slug}` : '/stores';
                const logoUrl = pickBestImage(
                  (p as any)?.store?.Logo?.formats?.small?.url,
                  (p as any)?.store?.Logo?.formats?.thumbnail?.url,
                  (p as any)?.store?.Logo?.url,
                );

                return (
                  <a
                    key={p.documentId || p.id}
                    href={href}
                    className="group flex flex-col p-6 min-h-[160px] bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    aria-label={`Read page ${p.Title}`}
                  >
                    {logoUrl && (
                      <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
                        <img
                          src={logoUrl}
                          alt={(p as any)?.store?.title || storeSlug || 'Store'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 gap-2">
                      {storeSlug && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                          {(p as any)?.store?.title || storeSlug}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-indigo-600 transition-colors leading-snug">
                        {p.Title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {p.SEO?.metaDescription || 'Read this page from the community.'}
                      </p>

                      <span
                        className="text-sm font-semibold mt-auto pt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                        style={{ color: markketColors.sections.about.main }}
                      >
                        Read page <IconArrowRight size={14} className="stroke-[2.5]" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)` }}
      >
        {/* Abstract decorative graphic overlay for polish */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Ready to Launch?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 font-medium mb-8">
            Join creators and businesses already selling on Markkët
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/auth/magic"
              className="px-8 py-4 bg-white text-base font-bold rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-gray-50 active:scale-95 transition-all duration-150"
              style={{ color: markketColors.rosa.main }}
            >
              Create your store
            </a>
            <a
              href="/about"
              className="px-8 py-4 border border-white/40 text-base font-bold text-white rounded-2xl hover:bg-white/10 hover:border-white/60 active:scale-95 transition-all duration-150"
            >
              About & Policies
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
