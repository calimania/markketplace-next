import { Container, Stack, Title } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import Header from '@/app/components/layout/header';

export default async function Page() {
  const { data: [page] } = await strapiClient.getPage('newsletter');

  return (
    <>
      <Header />
      <Container size="md" className="">
        <Stack gap="xl">
          <Title>{page?.Title}</Title>
          <BlocksRenderer content={page?.Content || []} />
          <SubscribeForm
            store={page?.store}
          />
        </Stack>
      </Container>
    </>
  );
};
