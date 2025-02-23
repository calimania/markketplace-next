import { Container, Stack, Title } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = 'newsletter';
  const response = await strapiClient.getPage(slug);
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}`,
      SEO: page?.SEO,
    },
    type: 'article',
  });
};

export default async function NewsletterPage() {
  const { data: [page] } = await strapiClient.getPage('newsletter');

  return (
    <Container size="md" className="">
      <Stack gap="xl">
        <Title>{page?.Title}</Title>
        <PageContent params={{ page }} />
        <SubscribeForm
          store={page?.store as Store}
        />
      </Stack>
    </Container>
  );
};
