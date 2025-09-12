'use client';

import StoreDashboardPage from '@/app/components/dashboard/store.page';
import SettingsDashboardPage from '@/app/components/dashboard/settings.page';
import StripeDashboardPage from '@/app/components/dashboard/stripe.page';
import ArticlesDashboardPage from '@/app/components/dashboard/article.page';
import PagesDashboardPage from '@/app/components/dashboard/page.page';
import ProductDashboardPage from '@/app/components/dashboard/product.page';
import EventsDashboardPage from '@/app/components/dashboard/event.page';
import AlbumsDashboardPage from '@/app/components/dashboard/album.page';
import AlbumTracksDashboardPage from '@/app/components/dashboard/album.tracks.page';
import StoresDashboardPage from '@/app/components/dashboard/store.list.page';
import CRMDashboardPage from '@/app/components/dashboard/crm.page';

import { Container, Title, Grid, Button, Text } from '@mantine/core';
import { useAuth } from '@/app/providers/auth.provider';
import OnboardingComponent from './onboarding';
import { IconShoppingCart, IconArticle, IconSettings, IconBuildingStore, IconAlbum, IconCalendar, IconUser, IconHome } from '@tabler/icons-react';

const dashboardLinks = [
  { url: '/dashboard/products', icon: <IconShoppingCart size={20} />, title: 'Products' },
  { url: '/dashboard/articles', icon: <IconArticle size={20} />, title: 'Articles' },
  { url: '/dashboard/store', icon: <IconBuildingStore size={20} />, title: 'Store' },
  { url: '/dashboard/settings', icon: <IconSettings size={20} />, title: 'Settings' },
  { url: '/dashboard/albums', icon: <IconAlbum size={20} />, title: 'Albums' },
  { url: '/dashboard/events', icon: <IconCalendar size={20} />, title: 'Events' },
  { url: '/dashboard/crm', icon: <IconUser size={20} />, title: 'CRM' },
  { url: '/dashboard/pages', icon: <IconHome size={20} />, title: 'Pages' },
];

export default function AnyDashboardPage({slug}: {slug: string}) {
  const { stores, isLoading } = useAuth();

  if (slug !== 'settings' && (!isLoading && !stores.length)) {
    return <OnboardingComponent slug={slug} />
  }

  switch (slug) {
    case 'pages':
      return <PagesDashboardPage />;
    case 'articles':
      return <ArticlesDashboardPage />;
    case 'store':
      return <StoreDashboardPage />;
    case 'settings':
      return <SettingsDashboardPage />;
    case 'stripe':
      return <StripeDashboardPage />;
    case 'products':
      return <ProductDashboardPage />;
    case 'events':
      return <EventsDashboardPage />;
    case 'albums':
      return <AlbumsDashboardPage />;
    case 'stores':
      return <StoresDashboardPage />
    case 'tracks':
      return <AlbumTracksDashboardPage />
    case 'crm':
      return <CRMDashboardPage />
    case 'onboarding':
      return <OnboardingComponent slug={slug} />
  }

  // If no matching slug, show navigation grid
  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md">
        Dashboard
      </Title>
      <Text mb="xs" fw={500}>Navigation</Text>
      <Grid gutter="md">
        {dashboardLinks.map((link) => (
          <Grid.Col span={6} key={link.url}>
            <Button leftSection={link.icon} fullWidth variant="light" component="a" href={link.url}>
              {link.title}
            </Button>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};
