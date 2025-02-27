import ComingSoon from '@/app/components/ui/coming.soon';
import { Container, Title } from '@mantine/core';

import StoreDashboardPage from '@/app/components/dashboard/store.page';

type AnyDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AnyDashboardPage({
  params,
}: AnyDashboardPageProps) {
  const { slug } = await params;

  if (slug === 'store') {
    return <StoreDashboardPage />;
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
