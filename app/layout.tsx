import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { strapiClient } from '@/markket/api.strapi';
import "./globals.css";
import '@/app/styles/main.scss';
import { AuthProvider } from '@/app/providers/auth.provider';
import { PostHogProvider } from '@/app/providers/posthog.provider';
import { GlobalBanner } from '@/app/components/global.banner';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { Store } from "@/markket";

async function generateMetadata(): Promise<Metadata> {
  const storeData = await strapiClient.getStore();
  const store = storeData?.data?.[0] as Store;
  const seo = store?.SEO;
  const favicon = store?.Favicon?.formats?.thumbnail?.url;

  return {
    title: seo?.metaTitle || "Markkët Next",
    description: seo?.metaDescription || "Dashboard for Markkët storefronts",
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
              <Notifications position="top-right" zIndex={1000} />
              <GlobalBanner />
              {children}
            </MantineProvider>
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

