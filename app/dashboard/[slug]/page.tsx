import ComingSoon from '@/app/components/ui/coming.soon';
import { Container, Title } from '@mantine/core';

type AnyDashboardPageProps = {
  params: {
    slug: string;
  };
};

export default function AnyDashboardPage({
  params: {
    slug,
  }
}: AnyDashboardPageProps) {
  return (
    <Container size="lg" py="xl">
      <Title>
        {slug} Dashboard
      </Title>
      <ComingSoon />
    </Container>
  );
};
