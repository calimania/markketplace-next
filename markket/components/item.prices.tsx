import { ContentItem } from "@/app/hooks/common";
import { Group, Button, Paper, ThemeIcon, Stack, Text } from '@mantine/core';
import { IconCurrencyDollar, IconPencil, IconDeviceFloppy, IconCloudDollar } from '@tabler/icons-react';
import { type Product } from '@/markket/index';
import PricesInput from './prices.input';
import { useState, useContext } from 'react';
import { DashboardContext } from "@/app/providers/dashboard.provider";
import { updateContentAction } from '../action.helpers';


const ItemPricesManager = ({ item, refresh }: { item: ContentItem, refresh?: () => void }) => {
  const [editing, setEditing] = useState(false);
  const [prices, setPrices] = useState((item as Product)?.PRICES || []);
  const [saving, setSaving] = useState(false);
  const editAction = updateContentAction('product')
    const { store } = useContext(DashboardContext);

  const handleSavePrices = async () => {
    setSaving(true);
    try {
      const res = await editAction({ ...item, PRICES: prices }, item.documentId, store.documentId)
      if (!res?.data?.documentId) throw new Error('Failed to save prices');
      setEditing(false); // Always toggle editing off after save
      if (refresh) refresh();
    } catch (err) {
      console.warn(err);
      // Optionally show notification
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" mt="xl">
      <Stack gap="xs">
        <Group justify="space-between" mb={8}>
          <Group gap="xs">
            <ThemeIcon size="md" variant="light" color="teal">
              <IconCurrencyDollar size={18} />
            </ThemeIcon>
            <Text fw={600}>Prices</Text>
          </Group>
          <Group gap="xs">
            {!editing ? (
              <Button
                size="xs"
                leftSection={<IconPencil size={16} />}
                variant="light"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Button
                size="xs"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={saving}
                variant="filled"
                color="green"
                onClick={handleSavePrices}
              >
                Save
              </Button>
            )}
            {editing && (
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                onClick={() => {
                  setEditing(false);
                  setPrices((item as Product)?.PRICES || []);
                }}
              >
                Cancel
              </Button>
            )}
          </Group>
        </Group>
        <Text size="sm" c="dimmed" mb={8}>
          Prices are what your customers pay for this product. Edit, add, or hide prices as needed. Each price can have a name, description, and inventory.
        </Text>
        {editing ? (
          <PricesInput value={prices} onChange={setPrices} />
        ) : (
          <Stack gap="xs">
            {prices.length === 0 ? (
              <Text c="dimmed" size="sm">No prices set.</Text>
            ) : (
              <table className="min-w-full border text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 border">
                        <Group>
                          <IconCloudDollar color={p.STRIPE_ID ? 'green' : 'gray'} />
                          <Text fw={500} c={p.hidden ? 'gray.5' : 'dark'}>{p.Name}</Text>
                        </Group>
                      </td>
                      <td className="p-2 border">{p.Description}</td>
                      <td className="p-2 border">{p.Price}</td>
                      <td className="p-2 border">{p.Currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default ItemPricesManager;
