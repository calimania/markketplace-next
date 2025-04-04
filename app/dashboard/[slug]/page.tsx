import DashboardHomeComponent from '@/app/components/dashboard/home.page';

type AnyDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DashboardPage({ params }: AnyDashboardPageProps) {
  const { slug } = await params;

  return <DashboardHomeComponent slug={slug} />
}
