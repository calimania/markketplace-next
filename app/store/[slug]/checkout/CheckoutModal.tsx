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
import { IconShoppingBagHeart, IconX } from "@tabler/icons-react";
import { createPaymentLink, type PaymentLinkOptions } from "../../../scripts/payment";
import { Price } from "@/markket/product";
import { notifications } from '@mantine/notifications';
import { Store } from "@/markket";
import { markketplace } from "@/markket/config";

interface Props {
  prices: Price[];
  product: any;
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
        title: 'Warning',
        message: 'Struggling to redirect; Would you mind trying a different browser?',
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

    try {
      await createPaymentLink({
        ...options,
        stripe_test: !!product?.Name?.toLowerCase()?.includes('test'),
        // @TODO: control delivery country options at store level (name convention SHIPPING_US_CO_X, defaul US only)
        includes_shipping: !selectedPrice?.Name?.toLowerCase()?.includes('digital'),
        store_id: store?.documentId,
        redirect_to_url: new URL(`/${store?.slug}/receipt`, markketplace.markket_url).toString(),
      });

    } catch (error) {
      console.error('Payment link error:', error);
      notifications.show({
        title: 'Payment Error',
        message: 'Could not create payment link. Please try again.',
        color: 'red',
      });
    }
  };

  const handlePriceSelect = (value: string | null) => {
    // If value is null and we already had a selection, keep the previous selection
    if (!value && selectedPriceId) {
      return;
    }
    setSelectedPriceId(value || '');
  };

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
          <>
            Purchase Options
            <Text size="sm" c="dimmed" mt={4}>
              Review the options and click below to continue
            </Text>
          </>
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
                label="Select Product Option"
                description="Choose the option that best fits your needs"
                placeholder="Available options..."
                value={selectedPriceId || ''}
                onChange={handlePriceSelect}
                data={prices.filter(p => !(p.hidden == true)).map((price) => ({
                  value: price.STRIPE_ID || '',
                  disabled: (price.inventory !== null && price.inventory == 0),
                  label: `${price.Name.replace(/_/gi, " ")} - $${price.Price} ${price.Currency}`,
                }))}
                required
                clearable={false}
                searchable={false}
              />
              <NumberInput
                label="Quantity"
                value={quantity}
                onChange={(value) => setQuantity(Number(value))}
                min={1}
                max={99}
                required
              />

              {(product.extras || []).find((e: any) => e.key == 'markket:product:tipping')?.content?.enabled && (
                <NumberInput
                  label="Ñapa"
                  description="Support the creator with an additional amount"
                  value={tip}
                  onChange={(value) => setTip(Number(value))}
                  min={0}
                  placeholder="0"
                  prefix="$"
                />
              )}

              {selectedPrice?.Description && (
                <Text size="sm" c="dimmed">
                  {selectedPrice.Description}
                </Text>
              )}

              {/* Order Summary */}
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
                <Stack gap="xs">
                  <Title order={4}>Order Summary</Title>
                  <Divider />

                  <Group justify="space-between">
                    <Text>Base Price:</Text>
                    <Text fw={500}>
                      ${selectedPrice?.Price || 0}
                    </Text>
                  </Group>

                  {quantity > 1 && (
                    <Group justify="space-between">
                      <Text>Quantity:</Text>
                      <Text fw={500}>× {quantity}</Text>
                    </Group>
                  )}

                  {tip > 0 && (
                    <Group justify="space-between">
                      <Text>Tip:</Text>
                      <Text fw={500}>+ ${tip}</Text>
                    </Group>
                  )}

                  <Divider />

                  <Group justify="space-between">
                    <Text fw={700}>Total:</Text>
                    <Text size="xl" fw={700} c="blue">
                      ${total}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              <Button
                type="submit"
                disabled={!isValidOrder}
                fullWidth
                size="lg"
                color="blue"
              >
                {isValidOrder
                  ? `Checkout ($${total})`
                  : 'Select an option'
                }
              </Button>
            </Stack>
          </form>
        </Container>
      </Modal>
    </>
  );
};

export default CheckoutModal;
