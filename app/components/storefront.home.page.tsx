import Link from 'next/link';
import { Container, Title, Text, Stack, Paper, Box, Overlay, Group, Badge, SimpleGrid } from "@mantine/core";
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import { StoreSectionLinks } from '@/app/components/ui/store.section.links';
import RichTextContent from '@/app/components/ui/richtext.content';
import Albums from '@/app/components/ui/albums.grid';
import StoreSlidesGallery from '@/app/components/ui/store.slides.gallery';
import { Album } from '@/markket/album';
import { markketColors } from '@/markket/colors.config';
import { type Store, type Page } from '@/markket';
import { extractRichTextImageUrl, richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';

// --- STUBS & UTILITIES FOR ABSTRACTED DATA ---
// (Adjust these imports or values if they are defined elsewhere in your project)
const storefrontFallbackImage = "";

function compact(value?: string | null, max = 96) {
  if (!value) return '';
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

function mediaImageUrl(media?: {
  formats?: {
    large?: { url?: string | null };
    medium?: { url?: string | null };
    small?: { url?: string | null };
    thumbnail?: { url?: string | null };
  };
  url?: string | null;
} | null): string | undefined {
  if (!media) return undefined;

  return imageOrFallback(
    media.formats?.large?.url,
    media.formats?.medium?.url,
    media.formats?.small?.url,
    media.formats?.thumbnail?.url,
    media.url,
  );
}


function compactRich(value: unknown, max = 96) {
  if (!value) return '';
  const plain = stripMarkdown(richTextToPlainText(value as string));
  return compact(plain, max);
}

function imageOrFallback(...candidates: Array<string | undefined | null>): string | undefined {
  return candidates.find((item): item is string => typeof item === 'string' && item.length > 0);
}

function railCardBasis(count: number) {
  if (count <= 2) return '0 0 320px';
  if (count <= 4) return '0 0 292px';
  return '0 0 270px';
}

function railCardOffset(index: number, count: number) {
  if (index === 0 || count <= 1) return 0;

  const denominator = Math.max(2, count - 1);
  const progress = index / denominator;
  const wave = Math.sin(progress * Math.PI);
  const depth = 10 + Math.round(wave * 14);

  return depth;
}


type StorefrontHomeProps = {
  homePage: Page & { albums?: Album[]; Title?: string };
  store: Store & { Description?: any; slug: string };
  slug: string;
  heroImage: string;
  showSectionSquares: boolean;
  previewCards: any[];
  showSignalSquares: boolean;
  signalCards: any[];
  // Missing properties used in JSX added below:
  homePageImage?: string;
  hasHomePageBlocks?: boolean;
  hasHomePageStory?: boolean;
  shouldRenderRichDescription?: boolean;
  publishedProducts?: any[];
  publishedPosts?: any[];
  eventsToDisplay?: any[];
  aboutPages?: any[];
  showShop?: boolean;
  showBlog?: boolean;
  showEvents?: boolean;
  showAbout?: boolean;
  isShowingPastOnly?: boolean;
  slides?: any[];
  storeImages?: any[];
  shouldShowEmptyLaunchState?: boolean;
  sectionLinks?: any[];
};

const StorefrontHome = (props: StorefrontHomeProps) => {
  const {
    homePage,
    store,
    slug,
    heroImage,
    showSectionSquares,
    previewCards = [],
    signalCards = [],
    showSignalSquares,
    // De-structure variables that were missing from props assignment:
    homePageImage = "",
    hasHomePageBlocks = false,
    hasHomePageStory = false,
    shouldRenderRichDescription = false,
    publishedProducts = [],
    publishedPosts = [],
    eventsToDisplay = [],
    aboutPages = [],
    showShop = false,
    showBlog = false,
    showEvents = false,
    showAbout = false,
    isShowingPastOnly = false,
    slides = [],
    storeImages = [],
    shouldShowEmptyLaunchState = false,
    sectionLinks = [],
  } = props;

  return (
    <>
      <div>
        {/* Hero */}
        <Box
          pos="relative"
          mb={64}
          style={{
            overflow: 'hidden',
            background: '#fcfcfc',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at top left, rgba(15,23,42,0.06), transparent 34%), radial-gradient(circle at top right, rgba(15,23,42,0.04), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,1) 100%)',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              top: -40,
              right: '8%',
              width: 180,
              height: 180,
              border: '2px solid rgba(15, 23, 42, 0.14)',
              borderRadius: 20,
              transform: 'rotate(18deg)',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              bottom: 48,
              left: '6%',
              width: 110,
              height: 110,
              border: '2px dashed rgba(97, 97, 97, 0.28)',
              borderRadius: 18,
              transform: 'rotate(-14deg)',
            }}
          />
          <Container size="lg" py={{ base: 56, md: 72 }} pos="relative">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'xl', md: 36 }} verticalSpacing="xl">
              <Stack gap="lg" justify="center">
                <Group gap="sm" wrap="wrap">
                  <Badge
                    size="lg"
                    radius="md"
                    variant="light"
                    style={{
                      background: 'rgba(15,23,42,0.06)',
                      color: markketColors.neutral.darkGray,
                      border: '1px solid rgba(15,23,42,0.14)',
                    }}
                  >
                    {homePage?.Title || 'Homepage'}
                  </Badge>
                </Group>

                <Stack gap="xs">
                  <Title order={1} style={{ fontSize: 'clamp(2.4rem, 7vw, 5.2rem)', lineHeight: 0.95, letterSpacing: '-0.05em', maxWidth: 760 }}>
                    {store?.title || store?.SEO?.metaTitle}
                  </Title>
                  <Text
                    maw={640}
                    size="lg"
                    lh={1.75}
                    c="dimmed"
                    style={{ fontSize: 'clamp(1rem, 2.2vw, 1.16rem)' }}
                  >
                    {homePage?.SEO?.metaDescription || store?.SEO?.metaDescription || '....φ(︶▽︶)φ....'}
                  </Text>
                </Stack>

                {store?.URLS?.length > 0 && (
                  <StoreTabs urls={store.URLS} basePath={`/${slug}`} />
                )}

              </Stack>

              <Stack gap="md">
                <Box
                  style={{
                    borderRadius: 22,
                    padding: 8,
                    background: 'rgba(255,255,255,0.82)',
                    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <Box
                    style={{
                      position: 'relative',
                      minHeight: 380,
                      borderRadius: 22,
                      overflow: 'hidden',
                      background: heroImage ? `url(${heroImage}) center/cover no-repeat` : markketColors.gradients.hero,
                    }}
                  >
                    <Overlay
                      gradient={heroImage ? markketColors.gradients.overlay : 'linear-gradient(140deg, rgba(228,0,124,0.16), rgba(15,23,42,0.08))'}
                      opacity={heroImage ? 0.42 : 1}
                      zIndex={1}
                    />
                  </Box>
                </Box>

                {showSignalSquares && (
                  <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                    {signalCards.map((card) => (
                      <Paper
                        key={card.label}
                        withBorder
                        radius="xl"
                        p="md"
                        style={{
                          background: card.bg,
                          borderColor: `${card.color}55`,
                        }}
                      >
                        <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: card.color }}>
                          {card.label}
                        </Text>
                        <Text size="xl" fw={800} style={{ letterSpacing: '-0.04em', color: markketColors.neutral.charcoal }}>
                          {card.value}
                        </Text>
                      </Paper>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            </SimpleGrid>
          </Container>
        </Box>

        <Container size="lg" pb="xl">
          <Stack gap="xl">
            {(!hasHomePageBlocks && (hasHomePageStory || previewCards.length > 0 || homePage?.Title)) && (
              <Box
                style={{
                  borderRadius: 22,
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(246,246,247,0.94) 0%, rgba(255,255,255,0.98) 52%, rgba(242,243,245,0.92) 100%)',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" wrap="wrap">
                    <Stack gap={4} maw={560}>
                      <Text fw={700} size="xl" style={{ letterSpacing: '-0.03em' }}>
                        {homePage?.Title || '(ノ°∀°)ノ⌒･*:.｡. .｡.:*･゜ﾟ･*☆'}
                      </Text>
                    </Stack>
                    {homePageImage ? (
                      <Box
                        style={{
                          width: 'min(100%, 360px)',
                          flex: 1,
                          borderRadius: 14,
                          padding: 6,
                          background: 'rgba(255,255,255,0.72)',
                        }}
                      >
                        <Box
                          style={{
                            height: 180,
                            borderRadius: 14,
                            background: `url(${homePageImage}) center/cover no-repeat`,
                          }}
                        />
                        <Stack gap={4} p="xs">
                          <Text size="sm" fw={700}>
                            {homePage?.Title || store?.title || slug}
                          </Text>
                          {!!homePage?.albums?.length && (
                            <Text size="xs" c="dimmed">
                              Includes {homePage.albums.length} gallery {homePage.albums.length === 1 ? 'set' : 'sets'}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    ) : null}
                  </Group>
                </Stack>
              </Box>
            )}

            {showSectionSquares && previewCards.length > 0 && (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {previewCards.map((card) => (
                  <Link key={card.key} href={card.href} style={{ textDecoration: 'none' }}>
                    <Paper
                      withBorder
                      radius="xl"
                      p="md"
                      style={{
                        borderColor: `${card.color}44`,
                        background: `linear-gradient(145deg, ${card.bg} 0%, #ffffff 72%)`,
                        minHeight: 190,
                      }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                        <Stack gap={6} style={{ flex: 1 }}>
                          <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: card.color }}>
                            {card.title}
                          </Text>
                          <Text fw={700} size="lg" lineClamp={2} style={{ letterSpacing: '-0.02em', color: markketColors.neutral.charcoal }}>
                            {card.headline}
                          </Text>
                          <Text size="sm" c="dimmed" lineClamp={3} lh={1.65}>
                            {card.description}
                          </Text>
                          <Text size="xs" fw={700} style={{ color: card.color }}>
                            {card.countLabel}
                          </Text>
                        </Stack>
                        <Box
                          style={{
                            width: 82,
                            height: 82,
                            borderRadius: 14,
                            flexShrink: 0,
                            background: card.imageUrl ? `url(${card.imageUrl}) center/cover no-repeat` : card.bg,
                            border: `1px solid ${card.color}55`,
                          }}
                        />
                      </Group>
                    </Paper>
                  </Link>
                ))}
              </SimpleGrid>
            )}

            {shouldRenderRichDescription && (
              <Box maw={720} mx="auto" w="100%">
                <RichTextContent content={store.Description} />
              </Box>
            )}

            {hasHomePageBlocks && (
              <Box
                style={{
                  borderRadius: 18,
                  background: '#fff',
                }}
              >
                <PageContent params={{ page: homePage }} />
              </Box>
            )}

            {(publishedProducts.length > 0 || publishedPosts.length > 0 || eventsToDisplay.length > 0 || aboutPages.length > 0) && (
              <Stack gap="lg">
                {showShop && publishedProducts.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.shop.main }}>
                        Shop
                      </Text>
                      <Link href={`/${slug}/products`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.shop.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group
                      align="flex-start"
                      gap="md"
                      wrap="nowrap"
                      className="storefront-rail"
                      style={{ overflowX: 'auto', paddingTop: 4, paddingBottom: 20, scrollSnapType: 'x mandatory' }}
                    >
                      {publishedProducts.slice(0, 6).map((product, index) => {
                        const image = imageOrFallback(
                          mediaImageUrl(product?.Thumbnail as any),
                          mediaImageUrl(product?.Slides?.[0] as any),
                          mediaImageUrl(product?.SEO?.socialImage as any),
                          storefrontFallbackImage,
                        );

                        return (
                          <Link
                            key={product.documentId || product.id || product.slug}
                            href={`/${slug}/products/${product.slug}`}
                            style={{ textDecoration: 'none', flex: railCardBasis(publishedProducts.length), scrollSnapAlign: 'start', marginTop: railCardOffset(index, publishedProducts.length) }}
                          >
                            <Paper
                              radius="xl"
                              p="sm"
                              style={{
                                background: '#fff',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                                transition: 'transform 180ms ease, box-shadow 180ms ease',
                              }}
                            >
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.shop.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{product.Name}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compactRich(product.Description, 90) || 'A featured piece from this store.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}

                {showBlog && publishedPosts.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.blog.main }}>
                        Stories
                      </Text>
                      <Link href={`/${slug}/blog`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.blog.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group
                      align="flex-start"
                      gap="md"
                      wrap="nowrap"
                      className="storefront-rail"
                      style={{ overflowX: 'auto', paddingTop: 4, paddingBottom: 20, scrollSnapType: 'x mandatory' }}
                    >
                      {publishedPosts.slice(0, 6).map((post, index) => {
                        const image = imageOrFallback(
                          mediaImageUrl(post?.cover as any),
                          mediaImageUrl(post?.SEO?.socialImage as any),
                          storefrontFallbackImage,
                        );

                        return (
                          <Link
                            key={post.documentId || post.id || post.slug}
                            href={`/${slug}/blog/${post.slug}`}
                            style={{ textDecoration: 'none', flex: railCardBasis(publishedPosts.length), scrollSnapAlign: 'start', marginTop: railCardOffset(index, publishedPosts.length) }}
                          >
                            <Paper
                              radius="xl"
                              p="sm"
                              style={{
                                background: '#fff',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                                transition: 'transform 180ms ease, box-shadow 180ms ease',
                              }}
                            >
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.blog.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{post.Title}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compact(post?.SEO?.metaDescription || '') || 'A story from this storefront.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}

                {showEvents && eventsToDisplay.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.events.main }}>
                        {isShowingPastOnly ? 'Past Events' : 'Events'}
                      </Text>
                      <Link href={`/${slug}/events`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.events.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group
                      align="flex-start"
                      gap="md"
                      wrap="nowrap"
                      className="storefront-rail"
                      style={{ overflowX: 'auto', paddingTop: 4, paddingBottom: 20, scrollSnapType: 'x mandatory', opacity: isShowingPastOnly ? 0.7 : 1 }}
                    >
                      {eventsToDisplay.slice(0, 6).map((event, index) => {
                        const image = imageOrFallback(
                          mediaImageUrl(event?.Thumbnail as any),
                          mediaImageUrl(event?.Slides?.[0] as any),
                          mediaImageUrl(event?.SEO?.socialImage as any),
                          storefrontFallbackImage,
                        );

                        return (
                          <Link
                            key={event.documentId || event.id || event.slug}
                            href={`/${slug}/events/${event.slug}`}
                            style={{ textDecoration: 'none', flex: railCardBasis(eventsToDisplay.length), scrollSnapAlign: 'start', marginTop: railCardOffset(index, eventsToDisplay.length) }}
                          >
                            <Paper
                              radius="xl"
                              p="sm"
                              style={{
                                background: '#fff',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                                transition: 'transform 180ms ease, box-shadow 180ms ease',
                              }}
                            >
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.events.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{event.Name}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compactRich(event.Description, 90) || 'An upcoming event from this store.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}

                {slides.length > 0 && (
                  <StoreSlidesGallery slides={slides} title="Visual Story" />
                )}

                {slides.length === 0 && storeImages.length > 0 && (
                  <StoreSlidesGallery slides={storeImages} title="Gallery" />
                )}

                {showAbout && aboutPages.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.about.main }}>
                        Pages
                      </Text>
                      <Link href={`/${slug}/about`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.about.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group
                      align="flex-start"
                      gap="md"
                      wrap="nowrap"
                      className="storefront-rail"
                      style={{ overflowX: 'auto', paddingTop: 4, paddingBottom: 20, scrollSnapType: 'x mandatory' }}
                    >
                      {aboutPages.slice(0, 6).map((page, index) => {
                        const image = imageOrFallback(
                          mediaImageUrl(page?.SEO?.socialImage as any),
                          mediaImageUrl(store?.Cover as any),
                          storefrontFallbackImage,
                        );

                        return (
                          <Link
                            key={page.documentId || page.id || page.slug}
                            href={`/${slug}/about/${page.slug}`}
                            style={{ textDecoration: 'none', flex: railCardBasis(aboutPages.length), scrollSnapAlign: 'start', marginTop: railCardOffset(index, aboutPages.length) }}
                          >
                            <Paper
                              radius="xl"
                              p="sm"
                              style={{
                                background: '#fff',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                                transition: 'transform 180ms ease, box-shadow 180ms ease',
                              }}
                            >
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.about.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{page.Title}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compact(page?.SEO?.metaDescription || '', 90) || 'Learn more from this page.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}
              </Stack>
            )}

            {shouldShowEmptyLaunchState && (
              <Paper
                withBorder
                radius="xl"
                p={{ base: 'lg', sm: 'xl' }}
                style={{
                  borderColor: 'rgba(15, 23, 42, 0.1)',
                  background: 'linear-gradient(135deg, rgba(255,245,250,0.95) 0%, rgba(255,255,255,0.98) 45%, rgba(235,250,252,0.95) 100%)',
                  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack gap="md" align="center" ta="center">
                  <Badge
                    size="lg"
                    radius="md"
                    variant="light"
                    style={{
                      background: markketColors.rosa.light,
                      color: markketColors.rosa.main,
                      border: `1px solid ${markketColors.rosa.main}2A`,
                    }}
                  >
                    New highlights coming soon
                  </Badge>
                  <Title order={3} fw={700} style={{ letterSpacing: '-0.02em' }}>
                    This collection is growing.
                  </Title>
                  <Text c="dimmed" maw={640} lh={1.75}>
                    Check back soon for new products, stories, events, and pages.
                    More updates are on the way.
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" w="100%" maw={760}>
                    <Paper withBorder radius="lg" p="md" style={{ borderColor: `${markketColors.sections.shop.main}35`, background: '#fff' }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.shop.main }}>
                        Shop
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.55}>
                        Product drops will show up here first.
                      </Text>
                    </Paper>
                    <Paper withBorder radius="lg" p="md" style={{ borderColor: `${markketColors.sections.blog.main}35`, background: '#fff' }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.blog.main }}>
                        Blog
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.55}>
                        Stories and updates are coming soon.
                      </Text>
                    </Paper>
                    <Paper withBorder radius="lg" p="md" style={{ borderColor: `${markketColors.sections.events.main}35`, background: '#fff' }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.events.main }}>
                        Events
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.55}>
                        Future sessions and launches will appear here.
                      </Text>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Paper>
            )}

            {!hasHomePageBlocks && <PageContent params={{ page: homePage }} />}

            {sectionLinks.length > 0 && (
              <Stack gap="sm">
                <Group justify="center" gap="xs">
                  <Text fw={600} ta="center" size="sm" tt="uppercase" style={{ letterSpacing: '0.08em', color: markketColors.neutral.mediumGray }}>
                    Quick links
                  </Text>
                </Group>
                <Box style={{ borderRadius: 16 }}>
                  <StoreSectionLinks links={sectionLinks} borderColor={markketColors.neutral.gray} />
                </Box>
              </Stack>
            )}
            {!!homePage?.albums?.length && <Albums albums={homePage.albums as Album[]} store_slug={store.slug} />}
          </Stack>
        </Container>
      </div>
    </>
  )
};

export default StorefrontHome;
