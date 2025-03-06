import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { strapiClient } from '@/markket/api';
import "./globals.css";
import '@/app/styles/main.scss';
import { AuthProvider } from '@/app/providers/auth';
import { PostHogProvider } from '@/app/providers/posthog';
import { GlobalBanner } from '@/app/components/global.banner';
import '@mantine/code-highlight/styles.css';

async function generateMetadata(): Promise<Metadata> {
  const { data: [store] } = await strapiClient.getStore();
  const seo = store?.SEO;
  const favicon = store?.Favicon?.url;

  return {
    title: seo?.metaTitle || "Markket Next",
    description: seo?.metaDescription || "Dashboard for Markket storefronts",
    keywords: seo?.metaKeywords,
    authors: seo?.metaAuthor ? [{ name: seo.metaAuthor }] : undefined,
    openGraph: {
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      images: [seo?.socialImage?.url as string],
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
};

import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = await generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PostHogProvider>
            <MantineProvider>
              <GlobalBanner />
              {children}
            </MantineProvider>
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

