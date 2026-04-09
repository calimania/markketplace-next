import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import { markketColors } from '@/markket/colors.config';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import HeroSection from '@/app/components/design-system/hero-section';
import ColorsSection from '@/app/components/design-system/colors-section';
import DashboardSection from '@/app/components/design-system/dashboard-section';
import EditorialGallerySection from '@/app/components/design-system/editorial-gallery-section';
import FooterSection from '@/app/components/design-system/footer-section';
import TypographySection from '@/app/components/design-system/typography-section';
import InteractionsSection from '@/app/components/design-system/interactions-section';
import ContentCardsSection from '@/app/components/design-system/content-cards-section';
import SpecimenTag from '@/app/components/design-system/specimen-tag';

type PageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Design System | Markketplace',
  description: 'Store-scoped design specimen for Markketplace.',
  robots: {
    index: false,
    follow: false,
  },
};

const sans = localFont({
  src: '../../../fonts/Manrope/Manrope-VariableFont_wght.ttf',
  variable: '--font-markket-sans',
  display: 'swap',
});

const label = localFont({
  src: '../../../fonts/Space_Grotesk/SpaceGrotesk-VariableFont_wght.ttf',
  variable: '--font-markket-label',
  display: 'swap',
});

const serif = localFont({
  src: [
    {
      path: '../../../fonts/Newsreader/Newsreader-VariableFont_opsz,wght.ttf',
      style: 'normal',
    },
    {
      path: '../../../fonts/Newsreader/Newsreader-Italic-VariableFont_opsz,wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-markket-serif',
  display: 'swap',
});

const mono = localFont({
  src: [
    {
      path: '../../../fonts/Roboto_Mono/RobotoMono-VariableFont_wght.ttf',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../../../fonts/Roboto_Mono/RobotoMono-Italic-VariableFont_wght.ttf',
      style: 'italic',
      weight: '400',
    },
  ],
  variable: '--font-markket-mono',
  display: 'swap',
});

const rootClassName = `${sans.variable} ${label.variable} ${serif.variable} ${mono.variable}`;

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  color: '#1e1b4b',
  backgroundColor: '#ffffff',
  backgroundImage:
    'radial-gradient(at 0% 0%, rgba(219, 39, 119, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(250, 204, 21, 0.05) 0px, transparent 50%)',
};

const ctaCardStyle: CSSProperties = {
  borderRadius: 18,
  border: '2px dashed #fbcfe8',
  background: '#fef2f2',
  padding: 20,
};

export default async function StoreDesignSystemPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const demoSlug = storeSlug || markketplace.design_system_demo_slug;
  const [storeResponse, postsResponse, pagesResponse] = await Promise.all([
    strapiClient.getStore(demoSlug),
    strapiClient.getPosts(
      { page: 1, pageSize: 6 },
      { sort: 'publishedAt:desc' },
      demoSlug,
    ),
    strapiClient.getPages(demoSlug),
  ]);

  const store = storeResponse?.data?.[0] as Store | undefined;
  const posts = (postsResponse?.data || []) as Article[];
  const pages = (pagesResponse?.data || []) as Page[];
  const systemPages = ['home', 'about', 'blog', 'products', 'events'];
  const customPages = pages.filter((page) => !systemPages.includes(page.slug));

  const storeTitle = store?.title || demoSlug;
  const storeDescription =
    store?.SEO?.metaDescription ||
    store?.Description ||
    `Design specimen for ${storeTitle}. Optimized for mobile webview and editor clarity.`;
  const logoUrl = store?.Logo?.url || store?.Favicon?.url;
  const storeLinks = store?.URLS || [];

  return (
    <main className={rootClassName} style={shellStyle}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '34px 24px 72px' }}>
        <HeroSection
          slug={demoSlug}
          storeTitle={storeTitle}
          storeDescription={storeDescription}
          logoUrl={logoUrl}
        />
        <EditorialGallerySection />
        <ContentCardsSection storeSlug={demoSlug} posts={posts} pages={customPages} />
        <ColorsSection />
        <TypographySection />
        <InteractionsSection />
        <DashboardSection slug={demoSlug} />

        <section style={{ ...ctaCardStyle, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <SpecimenTag color={markketColors.rosa.dark}>Component / Signature CTA</SpecimenTag>
              <h4 style={{ margin: '10px 0 0', fontFamily: 'var(--font-markket-serif)', fontStyle: 'italic', fontSize: '2rem', lineHeight: 1.1 }}>
                Experience the vibrancy.
              </h4>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={{ borderRadius: 999, border: 'none', background: '#06b6d4', color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '12px 20px', fontSize: '0.74rem' }}>
                Primary
              </button>
              <button style={{ borderRadius: 999, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '12px 20px', fontSize: '0.74rem' }}>
                Secondary
              </button>
              <button style={{ borderRadius: 999, border: 'none', background: '#eab308', color: '#422006', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '12px 20px', fontSize: '0.74rem' }}>
                Accent
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: 18,
          }}
        >
          <SpecimenTag color={markketColors.neutral.mediumGray}>Influence Notes / Direction</SpecimenTag>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div style={{ borderRadius: 12, border: '1px dashed #e2e8f0', background: '#f8fafc', padding: '10px 12px' }}>
              <SpecimenTag color={markketColors.rosa.dark}>Bauhaus</SpecimenTag>
              <p style={{ margin: '8px 0 0', lineHeight: 1.5, color: '#475569' }}>Geometry, functional hierarchy, no decorative noise.</p>
            </div>
            <div style={{ borderRadius: 12, border: '1px dashed #e2e8f0', background: '#f8fafc', padding: '10px 12px' }}>
              <SpecimenTag color={markketColors.cyan.dark}>NASA Systems</SpecimenTag>
              <p style={{ margin: '8px 0 0', lineHeight: 1.5, color: '#475569' }}>Operational clarity, telemetry-like labels, state-first UI.</p>
            </div>
            <div style={{ borderRadius: 12, border: '1px dashed #e2e8f0', background: '#f8fafc', padding: '10px 12px' }}>
              <SpecimenTag color={markketColors.magenta.dark}>Evangelion / Akira</SpecimenTag>
              <p style={{ margin: '8px 0 0', lineHeight: 1.5, color: '#475569' }}>Controlled intensity: bold accents over restrained surfaces.</p>
            </div>
          </div>
        </section>

        <FooterSection links={storeLinks} />
      </div>
    </main>
  );
}