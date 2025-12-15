'use client';

import { type FC, useEffect, useState } from "react";
import {
  Modal,
  Button,
  Select,
  NumberInput,
  Stack,
  Text,
  Title,
  Group,
  Divider,
  Paper,
  Container,
} from '@mantine/core';
import { IconShoppingBagHeart, IconShoppingBagPlus, IconX } from "@tabler/icons-react";
import { createPaymentLink, type PaymentLinkOptions } from "../../../scripts/payment";
import { notifications } from '@mantine/notifications';
import { type Store, type Price, type Product } from "@/markket";
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from "@/markket/config";

interface Props {
  prices: Price[];
  product: Product;
  store?: Store;
}

const CheckoutModal: FC<Props> = ({ prices, product, store }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tip, setTip] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState({} as Price);
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false);
  const [disabledStripeIds, setDisabledStripeIds] = useState<string[]>([]);

  const isValidOrder = selectedPriceId && total > 0;
  const url = new URL(`/${store?.slug}/receipt`, (typeof window !== 'undefined' ? window?.location?.origin : 'https://markket.place')).origin;

  const [options, setOptions] = useState({
    totalPrice: 0,
    product: product.documentId,
    prices: [],
    stripe_test: false,
    includes_shipping: false,
    redirect_to_url: url,
  } as PaymentLinkOptions);

  useEffect(() => {
    if (attempts >= 3) {
      notifications.show({
        title: 'Having trouble opening the payment page?',
        message: 'We had trouble opening the payment page — try a different browser or copy the link from your network inspector.',
        color: 'orange',
      })
    }
  }, [attempts]);

  useEffect(() => {
    const priceId = selectedPriceId;
    const price = prices.find((p: Price) => p.STRIPE_ID == priceId);
    const basePrice = Number(price?.Price) || 0;
    const subtotal = basePrice * quantity;
    const newTotal = subtotal + tip;

    const option_prices = [
      {
        quantity,
        price: String(selectedPriceId),
        currency: "usd",
        unit_amount: price?.Price,
        Name: price?.Name,
      } as unknown as Price,
    ];

    if (tip > 0) {
      option_prices.push({
        unit_amount: String(tip),
        Currency: "usd",
        product: product.SKU,
        quantity: 1,
        Name: 'Tip',
      } as unknown as Price);
    }

    setOptions(
      (prevOptions: any) =>
        ({
          ...prevOptions,
          totalPrice: newTotal,
          prices: option_prices,
        } as PaymentLinkOptions)
    );
    setTotal(newTotal);
    setSelectedPrice(price || ({} as Price));
  }, [selectedPriceId, quantity, tip, prices, product.SKU]);

  // If a selected price has limited inventory, ensure quantity stays within bounds
  useEffect(() => {
    const inv = (selectedPrice as any)?.inventory;
    if (typeof inv === 'number' && quantity > inv) {
      setQuantity(inv);
      notifications.show({
        title: 'Quantity adjusted',
        message: `We reduced your quantity to the available stock (${inv}).`,
        color: 'yellow',
      });
    }
  }, [selectedPrice?.inventory]);

  const redirectToPaymentLink = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidOrder) {
      notifications.show({
        title: 'Please select an option',
        message: 'You need to select a product option to continue',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      // @TODO: improve shipping options extra data
      await createPaymentLink({
        ...options,
        stripe_test: !!product?.Name?.toLowerCase()?.includes('test'),
        includes_shipping: !selectedPrice?.Name?.toLowerCase()?.includes('digital'),
        store_id: store?.documentId,
        redirect_to_url: new URL(`/${store?.slug}/receipt`, markketplace.markket_url).toString(),
        countries: selectedPrice?.ships_to?.filter(p => typeof p == 'string') || null,
      });

    } catch (error: any) {
      console.error('Payment link error:', error);

      const msg = (error && (error.message || error?.toString?.())) || String(error || '');

      // Detect inventory-exceeded error messages coming from backend/stripe webhook
      // Product/price "Medianito " requested quantity (50) exceeds available inventory:[(3)]
      if (msg && /requested quantity/i.test(msg) && /inventory/i.test(msg)) {
        const nameMatch = msg.match(/Product\/?price\s*"([^"]+)"/i);
        const numbers = msg.match(/\d+/g) || [];
        const available = numbers.length > 1 ? Number(numbers[numbers.length - 1]) : null;
        const priceName = nameMatch ? nameMatch[1].trim() : undefined;
        let matchedPrice: Price | undefined = undefined;

        if (priceName) {
          matchedPrice = prices.find(p => (p.Name || '').trim() === priceName || (p.Name || '').includes(priceName));
        }

        if (!matchedPrice && selectedPrice?.Name) {
          matchedPrice = selectedPrice as Price;
        }

        if (matchedPrice && typeof available === 'number') {
          try {
            const productSlug = product?.slug || product?.SKU || product?.documentId || '';
            const storeSlug = store?.slug || '';
            const { data: freshData } = await strapiClient.getProduct(productSlug, storeSlug);
            const freshProduct = Array.isArray(freshData) ? freshData[0] : freshData;
            const freshPrices = (freshProduct?.PRICES || []) as any[];

            const freshMatched = freshPrices.find((p) => {
              return String(p?.STRIPE_ID) === String(matchedPrice.STRIPE_ID)
                || String(p?.id) === String((matchedPrice as any).id)
                || (p?.Name || '').trim() === (matchedPrice?.Name || '').trim();
            });

            const canonicalAvailable = typeof freshMatched?.inventory === 'number' ? freshMatched.inventory : available;

            const newQty = Math.min(quantity, canonicalAvailable || quantity);
            setQuantity(newQty);
            setSelectedPrice((prev: any) => ({ ...prev, inventory: canonicalAvailable }));

            if (canonicalAvailable <= 0) {
              const stripeId = (matchedPrice as any).STRIPE_ID || String((matchedPrice as any).id);
              setDisabledStripeIds((prev) => Array.from(new Set([...prev, stripeId])));
              if (selectedPriceId === stripeId || String((matchedPrice as any).id) === String(selectedPriceId)) {
                setSelectedPriceId('');
                setSelectedPrice({} as Price);
              }
              notifications.show({
                title: 'Sold out',
                message: `The option "${(matchedPrice as any).Name || ''}" is no longer available and has been disabled. Please choose another option.`,
                color: 'red',
              });
              setIsModalOpen(false);
            } else {
              notifications.show({
                title: 'Quantity adjusted',
                message: `Requested quantity exceeded stock. Available: ${canonicalAvailable}. We've adjusted your quantity to ${newQty}.`,
                color: 'red',
              });
            }

          } catch (fetchError) {
            console.error('Failed to refresh product inventory from Strapi:', fetchError);
            const newQty = Math.min(quantity, available || quantity);
            setQuantity(newQty);
            setSelectedPrice((prev: any) => ({ ...prev, inventory: available }));
            notifications.show({
              title: "Couldn't refresh availability",
              message: 'We couldn\'t refresh stock info right now. Please reduce the quantity and try again, or try again later.',
              color: 'red',
            });
          }

        } else {
          notifications.show({
            title: 'Availability issue',
            message: 'Requested quantity exceeds available stock. Please reduce quantity and try again.',
            color: 'red',
          });
        }

        return;
      }

      notifications.show({
        title: "Couldn't create payment",
        message: 'Something went wrong while creating the payment. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceSelect = (value: string | null) => {
    // If value is null and we already had a selection, keep the previous selection
    if (!value && selectedPriceId) {
      return;
    }
    setSelectedPriceId(value || '');
  };

  useEffect(() => {
    if (!isModalOpen) return;
    if (selectedPriceId) return;

    const availableOptions = prices.filter(p => {
      return (
        (!(p.hidden === true) && !disabledStripeIds.includes(p.STRIPE_ID || '')
          && !(typeof p.inventory == 'number' && p.inventory == 0))
      )
    });

    if (availableOptions.length === 1) {
      setSelectedPriceId(availableOptions[0].STRIPE_ID || '');
    }

  }, [isModalOpen, prices, selectedPriceId, disabledStripeIds]);

  return (
    <>
      <Button
        fullWidth
        size="lg"
        leftSection={<IconShoppingBagHeart />}
        onClick={() => setIsModalOpen(true)}
        variant="filled"
        color="blue"
        mb="md"
      >
        Purchase Options
      </Button>
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <Group>
            <IconShoppingBagPlus size={27} color={'#E4007C'} />
          </Group>
        }
        closeButtonProps={{
          icon: <IconX size={20} />,
        }}
        padding="lg"
        size="md"
        centered
        overlayProps={{
          backgroundOpacity: 0.75,
          blur: 3,
        }}
      >
        <Container size="sm">
          <form onSubmit={(e) => {
            e.preventDefault();
            setAttempts((prev) => prev + 1)
            redirectToPaymentLink(e);
          }}>
            <Stack gap="md">
              <Select
                label="Choose an option"
                description="Pick the variant you'd like to buy"
                placeholder="Pick a variant..."
                value={selectedPriceId || ''}
                onChange={handlePriceSelect}
                data={prices.filter(p => !(p.hidden == true)).map((price) => ({
                  value: price.STRIPE_ID || '',
                  disabled: ((price as any).inventory !== null && (price as any).inventory == 0) || disabledStripeIds.includes(price.STRIPE_ID || ''),
                  label: `${(price.Name || '').replace(/_/gi, " ")} - $${price.Price} ${price.Currency}`,
                }))}
                required
                clearable={false}
                searchable={false}
                disabled={loading}
              />
              <NumberInput
                label="Quantity"
                value={quantity}
                onChange={(value) => setQuantity(Number(value || 1))}
                min={1}
                max={selectedPrice?.inventory ?? 99}
                required
                disabled={loading || !selectedPriceId}
              />
              {typeof (selectedPrice as any)?.inventory === 'number' && (selectedPrice.inventory < 10) && (
                <Text size="sm" c="dimmed">Only {(selectedPrice as any).inventory} {selectedPrice.inventory > 1 && 'more'} available</Text>
              )}
              {(product.extras || []).find((e: any) => e.key == 'markket:product:tipping')?.content?.enabled && (
                <NumberInput
                  label="Tip (optional)"
                  description="Support the creator with an additional amount"
                  value={tip}
                  onChange={(value) => setTip(Number(value))}
                  min={0}
                  placeholder="0"
                  prefix="$"
                />
              )}
              <Paper
                withBorder
                p="md"
                radius="md"
                style={{
                  transition: 'transform 0.2s ease',
                  transform: total > 0 ? 'translateY(0)' : 'translateY(10px)',
                  opacity: total > 0 ? 1 : 0.7,
                }}
              >
                <Stack gap="xs" c={!selectedPrice?.Name ? 'dimmed' : ''}>
                  <Title order={4}>Order Summary</Title>
                  <Divider />
                  <Group justify="space-between">
                    <Text>{selectedPrice.Name}</Text>
                    <Text fw={500}>
                      ${selectedPrice?.Price || 0}
                    </Text>
                  </Group>
                  {selectedPrice?.Description && (
                    <Text size="sm" c="dimmed">
                      {selectedPrice.Description}
                    </Text>
                  )}
                  {quantity > 0 && (
                    <>
                      <Group justify="space-between">
                        <Text>Quantity:</Text>
                        <Text fw={500}>× {quantity}</Text>
                      </Group>
                    </>
                  )}

                  {tip > 0 && (
                    <>
                      <Group justify="space-between">
                        <Text>Tip:</Text>
                        <Text fw={500}>+ ${tip}</Text>
                      </Group>
                      <Divider />
                    </>
                  )}
                </Stack>
              </Paper>
              <Button
                type="submit"
                loading={loading}
                disabled={!isValidOrder || loading}
                fullWidth
                size="lg"
                color="blue"
              >
                {isValidOrder ? `Proceed to Checkout  $${total}` : 'Select an option'}
              </Button>
            </Stack>
          </form>
        </Container>
      </Modal>
    </>
  );
};

export default CheckoutModal;
