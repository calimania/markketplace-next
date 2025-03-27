'use client';

import StripeSetup from './stripe.setup';
import { Container } from '@mantine/core';
import StoreHeader from './store.header';
import StripeHeader from './stripe.header';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useContext } from 'react';

export default function StripePage() {

  const { store, stripe } = useContext(DashboardContext);

  return (
    <Container size="md" pb="xl">
      <StoreHeader store={store} />
      <StripeHeader />
      <StripeSetup store={store} stripe={stripe} />
    </Container>
  )
}


