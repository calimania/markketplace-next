import ComingSoon from '@/app/components/ui/coming.soon';
import { Container, Title } from '@mantine/core';

import StoreDashboardPage from '@/app/components/dashboard/store.page';
import SettingsDashboardPage from '@/app/components/dashboard/settings.page';
import StripeDashboardPage from '@/app/components/dashboard/stripe.page';
import ArticlesDashboardPage from '@/app/components/dashboard/article.page';
import PagesDashboardPage from '@/app/components/dashboard/page.page';
import ProductDashboardPage from '@/app/components/dashboard/product.page';
import EventsDashboardPage from '@/app/components/dashboard/event.page';
import AlbumsDashboardPage from '@/app/components/dashboard/album.page';

type AnyDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AnyDashboardPage({
  params,
}: AnyDashboardPageProps) {
  const { slug } = await params;

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
  }

  return (
    <Container size="lg" py="xl">
      <Title>
        {slug} Dashboard
      </Title>
      <ComingSoon />
    </Container>
  );
};
