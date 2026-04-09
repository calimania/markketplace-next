import type { Metadata } from "next";
import { strapiClient } from '@/markket/api.strapi';
import "./globals.css";
import '@/app/styles/main.scss';
import { AuthProvider } from '@/app/providers/auth.provider';
import { PostHogProvider } from '@/app/providers/posthog.provider';
import { GlobalBanner } from '@/app/components/global.banner';
import EmbedQueryPropagator from '@/app/components/embed.query.propagator';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { Store } from "@/markket";
import { markketplace } from "@/markket/config";

export async function generateMetadata(): Promise<Metadata> {
  const storeData = await strapiClient.getStore();
  const store = storeData?.data?.[0] as Store;
  const seo = store?.SEO;
  const favicon = store?.Favicon?.formats?.thumbnail?.url || markketplace.blank_favicon_url;
  const currentDate = new Date().toISOString();
  const baseUrl = markketplace.markket_url;

  return {
    title: {
      default: seo?.metaTitle || "Markkët Next",
      template: "%s"
    },
    description: seo?.metaDescription || "Dashboard for Markkët storefronts",
    keywords: seo?.metaKeywords || "ecommerce, web publishing, cms, headless cms, pages",
    authors: seo?.metaAuthor ? [{ name: seo.metaAuthor }] : undefined,
    creator: seo?.metaAuthor || "Markketplace",
    publisher: store?.title || "Markketplace",
    alternates: {
      canonical: seo?.metaUrl || baseUrl
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: seo?.metaUrl || baseUrl,
      siteName: store?.title || seo?.metaTitle || "Markketplace",
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      images: seo?.socialImage?.url ? [{
        url: seo.socialImage.url,
        width: 1200,
        height: 630,
        alt: seo.metaTitle || 'Markketplace',
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      images: seo?.socialImage?.url ? [seo.socialImage.url] : [],
      creator: seo?.metaAuthor ? `@${seo.metaAuthor}` : undefined,
    },
    robots: {
      index: !seo?.excludeFromSearch || true,
      follow: !seo?.excludeFromSearch || true,
      googleBot: {
        index: !seo?.excludeFromSearch || true,
        follow: !seo?.excludeFromSearch || true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    metadataBase: new URL(baseUrl),
    other: {
      'revisit-after': '7 days',
      'date': currentDate,
      'last-modified': currentDate,
    },
  };
};

import '@mantine/core/styles.css';

import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
  type MantineColorsTuple,
} from '@mantine/core';
import { markketMantineColors } from '@/markket/colors.config';

const toMantineTuple = (colors: readonly string[]) => colors as MantineColorsTuple;

const theme = createTheme({
  colors: {
    rosa: toMantineTuple(markketMantineColors.rosa),
    cyan: toMantineTuple(markketMantineColors.cyan),
    magenta: toMantineTuple(markketMantineColors.magenta),
    sand: toMantineTuple(markketMantineColors.sand),
    charcoal: toMantineTuple(markketMantineColors.charcoal),
  },
  primaryColor: 'rosa',
  defaultRadius: 'md',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const embedBootstrapScript = `
    (function () {
      try {
        var params = new URLSearchParams(window.location.search);
        var display = (params.get('display') || '').toLowerCase();
        var navbar = (params.get('navbar') || '').toLowerCase();
        var footer = (params.get('footer') || '').toLowerCase();
        var breadcrumbs = (params.get('breadcrumbs') || params.get('crumbs') || '').toLowerCase();

        var embedFromQuery =
          display.indexOf('embed') === 0 ||
          navbar === 'hide' ||
          footer === 'hide';

        if (embedFromQuery) {
          document.documentElement.setAttribute('data-display-mode', 'embed');
        } else {
          document.documentElement.removeAttribute('data-display-mode');
        }

        if (breadcrumbs === 'hide') {
          document.documentElement.setAttribute('data-breadcrumbs', 'hide');
        } else {
          document.documentElement.removeAttribute('data-breadcrumbs');
        }

        var raw = localStorage.getItem('markket.injected');
        if (!raw) return;
        var parsed = JSON.parse(raw || '{}');
        if (parsed && parsed.embedded) {
          document.documentElement.setAttribute('data-display-mode', 'embed');
        }
      } catch (_) {}
    })();
  `;

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <script dangerouslySetInnerHTML={{ __html: embedBootstrapScript }} />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <PostHogProvider>
            <MantineProvider theme={theme}>
              <Notifications position="top-right" zIndex={1000} />
              <EmbedQueryPropagator />
              <GlobalBanner />
              {children}
            </MantineProvider>
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

