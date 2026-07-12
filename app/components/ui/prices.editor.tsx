'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  NumberInput,
} from '@mantine/core';
import { IconCheck, IconChevronDown, IconChevronUp, IconDeviceFloppy, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { tiendaClient } from '@/markket/api.tienda';
import { readTiendaAuthToken } from '@/app/tienda/[storeSlug]/content.find';
import { useStore } from '@/app/tienda/[storeSlug]/store.provider';
import { markketColors } from '@/markket/colors.config';
import type { Price } from '@/markket/product';

export type PriceItemDraft = Price;

const PRICE_CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
];

const SHIP_TO_OPTIONS = [
  { value: 'US', label: 'USA' },
  { value: 'CO', label: 'Colombia' },
  { value: 'MX', label: 'Mexico' },
];

const EVENT_PRICE_DEFAULT_NAMES = [
  'GA',
  'Early Bird',
  'Last Call',
];

function createEmptyPrice(index = 0, contentType: 'product' | 'event' = 'product'): PriceItemDraft {
  const tempId = -Date.now() - index;
  const defaultName = contentType === 'event'
    ? EVENT_PRICE_DEFAULT_NAMES[index] || `Option ${index + 1}`
    : '';

  return {
    id: tempId,
    Price: 0,
    Currency: 'USD',
    STRIPE_ID: '',
    Description: '',
    inventory: undefined,
    count: 1,
    Name: defaultName,
    hidden: false,
    ships_to: ['US'],
  };
}

function getSortedPrices(prices: PriceItemDraft[]) {
  return [...prices].sort((left, right) => Number(left.Price || 0) - Number(right.Price || 0));
}

export function normalizePrices(prices?: Array<Partial<PriceItemDraft> | null | undefined>): PriceItemDraft[] {
  const normalized = (prices || [])
    .filter(Boolean)
    .map((price, index) => ({
      ...createEmptyPrice(index),
      ...price,
      id: Number(price?.id || 0) || -Date.now() - index,
      Price: Number(price?.Price || 0) || 0,
      Currency: (price?.Currency || 'USD').toUpperCase(),
      STRIPE_ID: price?.STRIPE_ID || '',
      Description: price?.Description || '',
      inventory: typeof price?.inventory === 'number' ? price.inventory : undefined,
      count: typeof price?.count === 'number' ? price.count : 1,
      Name: price?.Name || '',
      hidden: Boolean(price?.hidden),
      ships_to: Array.isArray(price?.ships_to) && price.ships_to.length > 0 ? price.ships_to : ['US'],
    }));

  return normalized.length > 0 ? normalized : [];
}

export function serializePricesForPayload(prices: PriceItemDraft[]) {
  return prices.map((price) => ({
    ...(price.id > 0 ? { id: price.id } : {}),
    Price: Number(price.Price || 0),
    Currency: (price.Currency || 'USD').toUpperCase(),
    ...(price.STRIPE_ID?.trim() ? { STRIPE_ID: price.STRIPE_ID.trim() } : {}),
    Description: price.Description || '',
    inventory: typeof price.inventory === 'number' ? price.inventory : undefined,
    Name: price.Name || '',
    hidden: Boolean(price.hidden),
    ships_to: Array.isArray(price.ships_to) ? price.ships_to : ['US'],
  }));
}

type PricesEditorProps = {
  storeRef: string;
  contentType: 'product' | 'event';
  itemDocumentId: string;
  value: PriceItemDraft[];
  onSaved?: (prices: PriceItemDraft[]) => void | Promise<void>;
  label?: string;
  description?: string;
};

function summarizePrices(prices: PriceItemDraft[]) {
  if (!prices.length) return 'Add prices to start selling';

  const visibleCount = prices.filter((price) => !price.hidden).length;
  const syncedCount = prices.filter((price) => Boolean(price.STRIPE_ID?.trim())).length;

  return [
    `${visibleCount} price${prices.length === 1 ? '' : 's'}`,
    `${syncedCount}/${prices.length} synced`,
  ].filter(Boolean).join(' · ');
}

function isStripeSynced(price: PriceItemDraft) {
  return Boolean(price.STRIPE_ID?.trim());
}

function formatPriceLine(price: PriceItemDraft, includeShipping = true) {
  const amount = Number(price.Price || 0);
  const currency = (price.Currency || 'USD').toUpperCase();
  const label = price.Name?.trim() || 'Untitled price';
  const hiddenLabel = price.hidden ? 'Hidden' : 'Visible';
  const inventoryLabel = typeof price.inventory === 'number' ? `Inventory ${price.inventory}` : 'Inventory not set';
  const shipsToLabel = includeShipping && Array.isArray(price.ships_to) && price.ships_to.length > 0
    ? price.ships_to.join(', ')
    : includeShipping ? 'USA' : '';

  return [label, `${currency} ${amount.toFixed(2)}`, inventoryLabel, includeShipping ? shipsToLabel : '', hiddenLabel]
    .filter(Boolean)
    .join(' · ');
}

function parseNumberInput(value: string | number): number | undefined {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function isRequestSuccessful(response: unknown) {
  const payload = response as { ok?: boolean; success?: boolean; status?: number } | null;

  if (!payload) return false;
  if (payload.ok === true || payload.success === true) return true;
  if (typeof payload.status === 'number') return payload.status >= 200 && payload.status < 300;

  return false;
}

export default function PricesEditor({
  storeRef,
  contentType,
  itemDocumentId,
  value,
  onSaved,
  label = 'Prices',
  description,
}: PricesEditorProps) {
  const store = useStore();
  const accent = contentType === 'event' ? markketColors.sections.events : markketColors.sections.shop;
  const canEditPrices = Boolean(store?.STRIPE_CUSTOMER_ID);
  const [expanded, setExpanded] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PriceItemDraft[]>(normalizePrices(value));
  const [saving, setSaving] = useState(false);

  if (!canEditPrices) {
    return null;
  }

  useEffect(() => {
    setDrafts(normalizePrices(value));
    setEditingIndex(null);
  }, [value]);

  const summary = useMemo(() => summarizePrices(drafts), [drafts]);

  const updateDrafts = (nextDrafts: PriceItemDraft[]) => {
    setDrafts(nextDrafts);
  };

  const addPrice = () => {
    const nextIndex = drafts.length;
    updateDrafts([...drafts, createEmptyPrice(nextIndex, contentType)]);
    setExpanded(true);
    setEditingIndex(nextIndex);
  };

  const removePrice = (index: number) => {
    updateDrafts(drafts.filter((_, currentIndex) => currentIndex !== index));
    setEditingIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const setPriceValue = <K extends keyof PriceItemDraft>(index: number, key: K, nextValue: PriceItemDraft[K]) => {
    const nextDrafts = drafts.map((draft, currentIndex) => (
      currentIndex === index ? { ...draft, [key]: nextValue } : draft
    ));
    updateDrafts(nextDrafts);
  };

  const savePrices = async () => {
    const token = readTiendaAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    try {
      setSaving(true);

      const response = await tiendaClient.updateContent(storeRef, contentType, itemDocumentId, {
        PRICES: serializePricesForPayload(drafts),
      }, { token });

      if (!response || (response?.status && response.status >= 400)) {
        throw new Error(response?.message || `Could not save ${contentType} prices.`);
      }

      const runStripeSync = async () => {
        if (contentType === 'product') {
          return tiendaClient.syncProductStripe(storeRef, itemDocumentId, { token });
        }

        if (contentType === 'event') {
          return tiendaClient.syncEventStripe(storeRef, itemDocumentId, { token });
        }

        return { ok: true, status: 200 };
      };

      let syncResponse = await runStripeSync();
      let syncOk = isRequestSuccessful(syncResponse);

      if (!syncOk) {
        syncResponse = await runStripeSync();
        syncOk = isRequestSuccessful(syncResponse);
      }

      notifications.show({
        title: 'Saved',
        message: `${label} updated successfully.`,
        color: 'green',
        autoClose: 2500,
      });

      if (!syncOk) {
        notifications.show({
          title: 'Stripe sync failed',
          message: 'Saved locally. Stripe sync failed after retry. Save again to retry.',
          color: 'yellow',
          autoClose: 5000,
        });
      }

      setExpanded(false);
      setEditingIndex(null);
      await onSaved?.(drafts);
    } catch (error) {
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : `Could not save ${contentType} prices.`,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        borderColor: markketColors.neutral.gray,
        background: `linear-gradient(135deg, ${markketColors.neutral.offWhite} 0%, ${markketColors.neutral.white} 100%)`,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} c={markketColors.neutral.charcoal}>{label}</Text>
            <Text size="sm" c="dimmed">{description || 'Manage purchase options'}</Text>
          </div>

          <Group gap={6}>
            <ActionIcon
              variant="light"
              size="md"
              radius="xl"
              hiddenFrom="md"
              aria-label={expanded ? 'Collapse prices section' : 'Expand prices section'}
              title={expanded ? 'Collapse' : 'Expand'}
              onClick={() => setExpanded((prev) => !prev)}
              style={{
                background: accent.light,
                color: accent.main,
                border: `1px solid ${markketColors.neutral.gray}`,
              }}
            >
              {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>

            <Button
              variant="light"
              size="xs"
              visibleFrom="md"
              leftSection={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              onClick={() => setExpanded((prev) => !prev)}
              style={{
                background: accent.light,
                color: accent.main,
                border: `1px solid ${markketColors.neutral.gray}`,
              }}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Button>

            <ActionIcon
              variant="light"
              size="md"
              radius="xl"
              hiddenFrom="md"
              aria-label="Add price option"
              title="Add price"
              onClick={addPrice}
              style={{
                background: accent.light,
                color: accent.main,
                border: `1px solid ${markketColors.neutral.gray}`,
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>

            <Button
              variant="light"
              size="xs"
              visibleFrom="md"
              leftSection={<IconPlus size={14} />}
              onClick={addPrice}
              style={{
                background: accent.light,
                color: accent.main,
                border: `1px solid ${markketColors.neutral.gray}`,
              }}
            >
              Add
            </Button>

            <ActionIcon
              variant="filled"
              color="dark"
              size="md"
              radius="xl"
              hiddenFrom="md"
              aria-label="Save prices"
              title="Save prices"
              onClick={savePrices}
              loading={saving}
              disabled={drafts.length === 0}
              style={{
                background: accent.main,
                color: markketColors.neutral.white,
              }}
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>

            <Button
              variant="filled"
              color="dark"
              size="xs"
              visibleFrom="md"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={savePrices}
              loading={saving}
              disabled={drafts.length === 0}
              style={{
                background: accent.main,
                color: markketColors.neutral.white,
              }}
            >
              Save
            </Button>
          </Group>
        </Group>

        {!expanded && drafts.length > 0 && (
          <Stack gap={6}>
            <Text size="sm" c="dimmed">{summary}</Text>
            <Group gap={6} wrap="wrap">
              {getSortedPrices(drafts).slice(0, 3).map((price, index) => (
                <Badge
                  key={price.id || index}
                  variant="light"
                  radius="xl"
                  style={{
                    textTransform: 'none',
                    background: price.hidden ? markketColors.neutral.lightGray : accent.light,
                    color: price.hidden ? markketColors.neutral.darkGray : accent.main,
                    border: `1px solid ${markketColors.neutral.gray}`,
                  }}
                >
                  {`${price.Currency || 'USD'} ${Number(price.Price || 0).toFixed(2)}`}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}

        {expanded && (
          <Stack gap="md" pt="xs">
            {drafts.length === 0 ? (
              <Paper
                withBorder
                p="md"
                radius="md"
                bg={markketColors.neutral.offWhite}
                style={{ borderColor: markketColors.neutral.gray }}
              >
                <Stack gap={8} align="flex-start">
                  <Text size="sm" fw={600}>Add prices</Text>
                  <Text size="sm" c="dimmed">Create the first price to make this item ready to buy.</Text>
                  <Button
                    variant="light"
                    size="xs"
                    onClick={addPrice}
                    style={{
                      background: accent.light,
                      color: accent.main,
                      border: `1px solid ${markketColors.neutral.gray}`,
                    }}
                  >
                    Add price
                  </Button>
                </Stack>
              </Paper>
            ) : (
              drafts.map((price, index) => (
                <Paper
                  key={price.id || index}
                  withBorder
                  p="md"
                  radius="md"
                  bg={editingIndex === index ? markketColors.neutral.offWhite : markketColors.neutral.white}
                  style={{
                    borderColor: isStripeSynced(price)
                      ? `${markketColors.status.success}66`
                      : `${markketColors.status.error}66`,
                    borderLeftWidth: 3,
                    borderLeftColor: isStripeSynced(price)
                      ? markketColors.status.success
                      : markketColors.status.error,
                    borderBottomWidth: 2,
                    borderBottomColor: isStripeSynced(price)
                      ? `${markketColors.status.success}99`
                      : `${markketColors.status.error}99`,
                  }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <div>
                        <Text fw={600}>{price.Name?.trim() || `Price ${index + 1}`}</Text>
                        <Text size="xs" c="dimmed">{formatPriceLine(price, contentType !== 'event')}</Text>
                      </div>
                      <Group gap={4}>
                        <ActionIcon
                          size="sm"
                          radius="xl"
                          variant={editingIndex === index ? 'filled' : 'light'}
                          aria-label={editingIndex === index ? `Finish editing price ${index + 1}` : `Edit price ${index + 1}`}
                          title={editingIndex === index ? 'Done' : 'Edit'}
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          style={editingIndex === index
                            ? { background: accent.main, color: markketColors.neutral.white }
                            : {
                              background: accent.light,
                              color: accent.main,
                              border: `1px solid ${markketColors.neutral.gray}`,
                            }}
                        >
                          {editingIndex === index ? <IconCheck size={14} /> : <IconPencil size={14} />}
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" aria-label={`Remove price ${index + 1}`} onClick={() => removePrice(index)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {editingIndex === index && (
                      <Stack gap="sm">
                        <div className="form-cols">
                          <TextInput
                            label="Name"
                            value={price.Name}
                            onChange={(event) => setPriceValue(index, 'Name', event.currentTarget.value)}
                            placeholder="Standard / VIP / Early bird"
                          />
                          <Select
                            label="Currency"
                            value={price.Currency || 'USD'}
                            onChange={(nextValue) => setPriceValue(index, 'Currency', (nextValue || 'USD') as PriceItemDraft['Currency'])}
                            data={PRICE_CURRENCIES}
                          />
                        </div>

                        <div className="form-cols">
                          <NumberInput
                            label="Price"
                            value={price.Price}
                            onChange={(nextValue) => setPriceValue(index, 'Price', parseNumberInput(nextValue) ?? 0)}
                            min={0}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          <NumberInput
                            label="Inventory"
                            value={typeof price.inventory === 'number' ? price.inventory : undefined}
                            onChange={(nextValue) => setPriceValue(index, 'inventory', parseNumberInput(nextValue))}
                            min={0}
                            allowDecimal={false}
                            description="Optional stock cap for this price."
                          />
                        </div>

                        {contentType !== 'event' ? (
                          <div className="form-cols">
                            <MultiSelect
                              label="Ships to"
                              data={SHIP_TO_OPTIONS}
                              value={price.ships_to || ['US']}
                              onChange={(nextValue) => setPriceValue(index, 'ships_to', nextValue.length > 0 ? nextValue : ['US'])}
                              searchable={false}
                              clearable={false}
                            />
                            <Switch
                              label="Hidden"
                              checked={Boolean(price.hidden)}
                              onChange={(event) => setPriceValue(index, 'hidden', event.currentTarget.checked)}
                            />
                          </div>
                        ) : (
                          <Group justify="flex-end">
                            <Switch
                              label="Hidden"
                              checked={Boolean(price.hidden)}
                              onChange={(event) => setPriceValue(index, 'hidden', event.currentTarget.checked)}
                            />
                          </Group>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              ))
            )}

          </Stack>
        )}

        {!expanded && drafts.length === 0 && (
          <Button variant="subtle" size="xs" onClick={() => setExpanded(true)}>
            Add prices
          </Button>
        )}
      </Stack>
    </Paper>
  );
}