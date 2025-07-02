'use client';

import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import ViewItem from '@/app/components/dashboard/actions/item.view';
import { Skeleton, Container, Stack, Group, Button, } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { IconBuildingStore, IconPencilCog, IconCoin, IconInfoHexagonFilled, } from '@tabler/icons-react';
import StripeSetup from './stripe.setup';
import StripeHeader from './stripe.header';
import { Tabs } from '@mantine/core';
import { useCMSItem } from '@/app/hooks/dashboard.item.hook';

export default function StoreDashboardPage() {
  const { store, stripe } = useContext(DashboardContext);
  const [isLoading, setIsLoading] = useState(0);
  const router = useRouter();

  const { refresh, item } = useCMSItem('stores', store?.documentId, { append: 'populate[]=SEO.socialImage&populate=Cover&populate[]=Favicon&populate[]=Slides&populate[]=Logo' });

  useEffect(() => {
    setIsLoading(store?.id);

    setTimeout(() => {
      setIsLoading(0);
    }, 180);
  }, [store?.id])

  if (isLoading || !item) {
    return (
      <Container size="lg" pb="xs">
        <Skeleton height={50} circle mb="xl" />
        <Skeleton height={120} radius="sm" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </Container>
    );
  }

  if (store) {
    return (
      <div className="pt-[50px] ">
        <Container size="lg" pb="xs">
          <Tabs defaultValue="store">
            <Tabs.List>
              <Tabs.Tab value="store" leftSection={<IconInfoHexagonFilled size={16} />}>
                Store Info
              </Tabs.Tab>
              <Tabs.Tab value="stripe" leftSection={<IconCoin size={16} />}>
                Payouts [stripe]
              </Tabs.Tab>
              {/* <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
                Stats
              </Tabs.Tab> */}
            </Tabs.List>
            <Tabs.Panel value="store">
              <>
                <Stack gap="sm" my="lg">
                  <Group justify="space-between">
                    <Button
                      variant="light"
                      leftSection={<IconBuildingStore size={16} />}
                      onClick={() => router.push(`/dashboard/stores`)}
                    >
                      Store List
                    </Button>

                    <Button
                      variant="light"
                      rightSection={<IconPencilCog size={16} />}
                      onClick={() => router.push(`/dashboard/stores/edit/${store.documentId}?store=${store.documentId}`)}
                    >
                      Edit
                    </Button>
                  </Group>
                </Stack>
                <ViewItem item={item} store={store} singular="store" previewUrl={`/store/${store.slug}`} imageManager imageSection={false} refresh={refresh} />
              </>
            </Tabs.Panel>
            <Tabs.Panel value="stripe">
              <StripeHeader />
              <StripeSetup store={store} stripe={stripe} />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </div>
    );
  }
};
