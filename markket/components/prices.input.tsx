import { useState } from 'react';
import { TextInput, NumberInput, Button, Group, Stack, Text, Paper, Box } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { Price } from '@/markket/product';

interface PricesInputProps {
  value: Price[];
  onChange: (prices: Price[]) => void;
}

const PricesInput = ({ value, onChange }: PricesInputProps) => {
  const [prices, setPrices] = useState<Price[]>(value || []);

  const handleAdd = () => {
    const newPrices = [
      ...prices,
      {
        id: -Date.now(), // temp id for new price
        Name: '',
        Price: 1,
        Currency: 'USD',
        Description: '',
        STRIPE_ID: '',
        hidden: false,
        extra: {},
        inventory: 0,
      },
    ];
    setPrices(newPrices);
    onChange(newPrices);
  };

  const handleRemove = (idx: number) => {
    const newPrices = prices.filter((_, i) => i !== idx);
    setPrices(newPrices);
    onChange(newPrices);
  };

  const handleChange = (idx: number, key: keyof Price, value: any) => {
    const newPrices = [...prices];
    (newPrices[idx] as any)[key] = value;
    setPrices(newPrices);
    onChange(newPrices);
  };

  // Responsive: show table on desktop, stacked cards on mobile
  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={500} size="sm">Prices</Text>
        <Button leftSection={<IconPlus size={16} />} size="xs" variant="light" onClick={handleAdd}>
          Add Price
        </Button>
      </Group>
      <Text size="xs" c="dimmed" mb={4}>You can edit prices directly here. Changes are saved when you click Save in the product view.</Text>
      {/* Desktop/tablet view */}
      <Box hiddenFrom="xs">
        {prices.length === 0 ? (
          <Paper withBorder p="md" ta="center" c="dimmed" style={{ borderStyle: 'dashed', backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Text size="sm">No prices added yet</Text>
          </Paper>
        ) : (
          <table className="min-w-full border text-sm mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Inventory</th>
                <th className="p-2 border">Hidden</th>
                <th className="p-2 border"> </th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p, i) => (
                <tr key={i}>
                  <td className="p-2 border">
                    <TextInput value={p.Name} onChange={e => handleChange(i, 'Name', e.target.value)} style={{ minWidth: 180 }} />
                  </td>
                  <td className="p-2 border">
                    <TextInput value={p.Description} onChange={e => handleChange(i, 'Description', e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <NumberInput value={p.Price} min={0} onChange={val => handleChange(i, 'Price', val as number)} />
                  </td>
                  <td className="p-2 border">
                    <NumberInput value={p.inventory ?? 0} min={0} onChange={val => handleChange(i, 'inventory', val)} />
                  </td>
                  <td className="p-2 border text-center">
                    <Button size="xs" variant={p.hidden ? 'filled' : 'outline'} color={p.hidden ? 'gray' : 'blue'} onClick={() => handleChange(i, 'hidden', !p.hidden)}>
                      {p.hidden ? 'Hidden' : 'Visible'}
                    </Button>
                  </td>
                  <td className="p-2 border text-center">
                    <Button size="xs" color="red" variant="subtle" onClick={() => handleRemove(i)}>
                      <IconTrash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
      {/* Mobile view: stacked cards */}
      <Box visibleFrom="xs">
        {prices.length === 0 ? (
          <Paper withBorder p="md" ta="center" c="dimmed" style={{ borderStyle: 'dashed', backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Text size="sm">No prices added yet</Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {prices.map((p, i) => (
              <Paper key={i} withBorder p="sm" radius="md">
                <TextInput label="Name" value={p.Name} onChange={e => handleChange(i, 'Name', e.target.value)} mb={4} style={{ minWidth: 180 }} />
                <TextInput label="Description" value={p.Description} onChange={e => handleChange(i, 'Description', e.target.value)} mb={4} />
                <NumberInput label="Price" value={p.Price} min={0} onChange={val => handleChange(i, 'Price', val as number)} mb={4} />
                <NumberInput label="Inventory" value={p.inventory ?? 0} min={0} onChange={val => handleChange(i, 'inventory', val)} mb={4} />
                <Button size="xs" variant={p.hidden ? 'filled' : 'outline'} color={p.hidden ? 'gray' : 'blue'} onClick={() => handleChange(i, 'hidden', !p.hidden)} mb={4}>
                  {p.hidden ? 'Hidden' : 'Visible'}
                </Button>
                <Button size="xs" color="red" variant="subtle" onClick={() => handleRemove(i)}>
                  <IconTrash size={16} />
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default PricesInput;
