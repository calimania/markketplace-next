import { Container, Stack, Title } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import Header from '@/app/components/layout/header';
import { Store } from '@/markket/store';

export default async function Page() {
  const { data: [page] } = await strapiClient.getPage('newsletter');

  return (
    <>
      <Header />
      <Container size="md" className="">
        <Stack gap="xl">
          <Title>{page?.Title}</Title>
          <BlocksRenderer content={page?.Content as BlocksContent || []} />
          <SubscribeForm
            store={page?.store as Store}
          />
        </Stack>
      </Container>
    </>
  );
};
