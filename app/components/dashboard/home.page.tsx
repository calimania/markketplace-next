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

import { Container, Title } from '@mantine/core';
import { useAuth } from '@/app/providers/auth.provider';
import OnboardingComponent from './onboarding';

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

  return (
    <>
      <Container>
        <Title order={2} mb="md">
          {`${slug} Dashboard`}
        </Title>
      </Container>
    </>
  );
};
