'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge, Button, Card, Group, Loader, Paper, Stack, Text, Title, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { strapiClient } from '@/markket/api.strapi';
import { createPaymentLink, type PaymentLinkOptions } from '@/app/scripts/payment';
import { markketplace } from '@/markket/config';
import type { Price, Product, Store } from '@/markket';

type CheckoutSelection = {
  productSlug: string;
  priceId: string;
  quantity: number;
  tip: number;
};

type StoreCartItem = {
  productSlug: string;
  productDocumentId: string;
  quantity: number;
  tip: number;
  selectedPriceId: string;
  PRICES: Price[];
};

type StoreCartState = Record<string, { products: StoreCartItem[] }>;

const STORE_CART_STORAGE_KEY = 'markket.cart';

function parseNumber(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStoreCart(storeSlug: string) {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORE_CART_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoreCartState;
    const entry = parsed?.[storeSlug];
    const firstItem = entry?.products?.[0];

    return firstItem || null;
  } catch (error) {
    console.error('Could not read checkout cart:', error);
    return null;
  }
}

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const [storeSlug, setStoreSlug] = useState('');
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selection, setSelection] = useState<CheckoutSelection | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);

  useEffect(() => {
    params.then(({ slug }) => setStoreSlug(slug));
  }, [params]);

  useEffect(() => {
    if (!storeSlug) return;

    const storedCartItem = readStoreCart(storeSlug);
    const productSlug = storedCartItem?.productSlug || searchParams.get('product') || '';
    const priceId = storedCartItem?.selectedPriceId || searchParams.get('priceId') || '';
    const quantity = Math.max(1, storedCartItem?.quantity || parseNumber(searchParams.get('quantity'), 1));
    const tip = Math.max(0, storedCartItem?.tip || parseNumber(searchParams.get('tip'), 0));

    setSelection({ productSlug, priceId, quantity, tip });

    async function loadCheckoutData() {
      try {
        setLoading(true);
        const [productResponse, storeResponse] = await Promise.all([
          productSlug ? strapiClient.getProduct(productSlug, storeSlug) : Promise.resolve({ data: [] as Product[] }),
          strapiClient.getStore(storeSlug),
        ]);

        const [productItem] = (productResponse?.data || []) as Product[];
        const [storeItem] = (storeResponse?.data || []) as Store[];

        setProduct(productItem || null);
        setStore(storeItem || null);

        const prices = (storedCartItem?.PRICES?.length ? storedCartItem.PRICES : (productItem?.PRICES || [])) as Price[];
        const matched = prices.find((price) => String(price.STRIPE_ID || '') === String(priceId));
        setSelectedPrice(matched || null);
      } catch (error) {
        console.error('Failed to load checkout data:', error);
        notifications.show({
          title: 'Checkout unavailable',
          message: 'We could not load your selection. Please go back and try again.',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [searchParams, storeSlug]);

  const checkoutOptions = useMemo<PaymentLinkOptions | null>(() => {
    if (!product || !store || !selection || !selectedPrice) return null;

    const explicitTestMode = searchParams.get('test') === '1';
    const legacyTestMode = Boolean(product?.Name?.toLowerCase()?.includes('test'));
    const isTestTransaction = explicitTestMode || legacyTestMode;

    const subtotal = Number(selectedPrice.Price || 0) * selection.quantity;
    const totalPrice = subtotal + selection.tip;
    const shipsTo = Array.isArray(selectedPrice.ships_to) ? selectedPrice.ships_to.filter((item) => typeof item === 'string') : ['US'];
    const prices: Price[] = [
      {
        ...selectedPrice,
        quantity: selection.quantity,
        price: String(selectedPrice.STRIPE_ID || ''),
        currency: 'usd',
        unit_amount: selectedPrice.Price,
        Name: selectedPrice.Name,
      } as unknown as Price,
    ];

    if (selection.tip > 0) {
      prices.push({
        unit_amount: String(selection.tip),
        Currency: 'usd',
        product: product.SKU,
        quantity: 1,
        Name: 'Tip',
      } as unknown as Price);
    }

    return {
      totalPrice,
      product: product.documentId,
      prices,
      includes_shipping: !selectedPrice?.Name?.toLowerCase()?.includes('digital'),
      stripe_test: isTestTransaction,
      store_id: store.documentId,
      redirect_to_url: new URL(`/${storeSlug}/receipt`, markketplace.markket_url).toString(),
      countries: shipsTo,
    };
  }, [product, selectedPrice, selection, store, storeSlug]);

  const onConfirm = async () => {
    if (!checkoutOptions) {
      notifications.show({
        title: 'Selection incomplete',
        message: 'Please go back and choose a valid option.',
        color: 'red',
      });
      return;
    }

    try {
      setCreating(true);
      await createPaymentLink(checkoutOptions);
    } catch (error) {
      console.error('Payment link error:', error);
      notifications.show({
        title: 'Could not open checkout',
        message: 'Something went wrong while creating the payment link.',
        color: 'red',
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedPriceLabel = selectedPrice
    ? `${selectedPrice.Name || 'Selected option'} · ${selectedPrice.Currency || 'USD'} ${Number(selectedPrice.Price || 0).toFixed(2)}`
    : 'No option selected';
  const isTestTransaction = searchParams.get('test') === '1' || Boolean(product?.Name?.toLowerCase()?.includes('test'));
  const productThumb = product?.Thumbnail?.formats?.small?.url || product?.Thumbnail?.url || product?.SEO?.socialImage?.formats?.small?.url || product?.SEO?.socialImage?.url || '';

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
        <Loader />
      </div>
    );
  }

  if (!product || !store || !selection || !selectedPrice) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Paper withBorder radius="xl" p="lg">
          <Stack gap="md">
            <Title order={2}>Checkout unavailable</Title>
            <Text c="dimmed">We could not find the selected product or price. Go back and choose again.</Text>
            <Button component="a" href={`/${storeSlug}/products`} variant="light">
              Back to products
            </Button>
          </Stack>
        </Paper>
      </div>
    );
  }

  const subtotal = Number(selectedPrice.Price || 0) * selection.quantity;
  const total = subtotal + selection.tip;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Stack gap="lg">
        <div>
          <Title order={1} mb={8}>Confirm your selection</Title>
          <Text c="dimmed">Take one more look, then continue to payment and we’ll open Stripe checkout for you.</Text>
        </div>

        <Card withBorder radius="xl" p="lg">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Group gap="md" align="flex-start" wrap="nowrap">
                <Box
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--mantine-color-gray-1)',
                    backgroundImage: productThumb ? `url(${productThumb})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div>
                  <Title order={3}>{product.Name}</Title>
                  <Text size="sm" c="dimmed">{store.title || store.SEO?.metaTitle || store.slug}</Text>
                </div>
              </Group>
              <Group gap={6}>
                {isTestTransaction && (
                  <Badge radius="xl" variant="light" color="yellow">
                    Test payment
                  </Badge>
                )}
                <Badge radius="xl" variant="light">
                  Checkout
                </Badge>
              </Group>
            </Group>

            <Paper withBorder radius="lg" p="md" bg="var(--mantine-color-gray-0)">
              <Stack gap={6}>
                <Group justify="space-between" align="center">
                  <Text fw={600}>Cart item</Text>
                  <Badge variant="light" radius="xl">
                    1 item
                  </Badge>
                </Group>
                <Text size="sm">{selectedPriceLabel}</Text>
                <Text size="sm">Quantity: {selection.quantity}</Text>
                {selection.tip > 0 && <Text size="sm">Tip: ${selection.tip.toFixed(2)}</Text>}
                <Text size="sm" c="dimmed">Ships to: {(selectedPrice.ships_to || ['US']).join(', ')}</Text>
              </Stack>
            </Paper>

            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" c="dimmed">Subtotal</Text>
                <Text fw={600}>${subtotal.toFixed(2)}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Total</Text>
                <Text fw={800} size="xl">${total.toFixed(2)}</Text>
              </div>
            </Group>

            <Group justify="space-between" align="center">
              <Button component="a" href={`/${storeSlug}/products/${product.slug}`} variant="light">
                Back
              </Button>
              <Button onClick={onConfirm} loading={creating}>
                Continue to payment
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
