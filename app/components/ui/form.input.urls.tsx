import { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
  Group,
  Paper,
  ActionIcon,
  Stack,
  Text,
  Box,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconLink,
  IconWorldUpload
} from '@tabler/icons-react';
import { UseFormReturnType } from '@mantine/form';

interface URL {
  id?: number;
  Label: string;
  URL: string;
}

interface URLsInputProps {
  label?: string;
  description?: string;
  value: URL[];
  onChange: (urls: URL[]) => void;
  form?: UseFormReturnType<any>;
  field?: string;
}

export default function URLsInput({
  label = 'URLs',
  description,
  value = [],
  onChange,
  form,
  field = 'URLS',
}: URLsInputProps) {
  const [urls, setUrls] = useState<URL[]>(value || []);

  useEffect(() => {
    if (!!value.length) {
      setUrls(value || []);
    }

  }, [value]);

  const handleAddUrl = () => {
    const newUrls = [...urls, { Label: '', URL: '', id: -Date.now() }];
    setUrls(newUrls);
    onChange(newUrls);
    if (form && field) {
      form.setFieldValue(field, newUrls);
    }
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
    onChange(newUrls);
    if (form && field) {
      form.setFieldValue(field, newUrls);
    }
  };

  const handleChangeUrl = (index: number, key: 'Label' | 'URL', value: string) => {
    const newUrls = [...urls];
    newUrls[index][key] = value;
    setUrls(newUrls);
    onChange(newUrls);
    if (form && field) {
      form.setFieldValue(field, newUrls);
    }
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={500} size="sm">{label}</Text>
        <Button
          leftSection={<IconPlus size={16} />}
          size="xs"
          variant="light"
          onClick={handleAddUrl}
        >
          Add URL
        </Button>
      </Group>

      {description && (
        <Text size="xs" c="dimmed">{description}</Text>
      )}

      {urls.length === 0 ? (
        <Paper
          withBorder
          p="md"
          ta="center"
          c="dimmed"
          style={{
            borderStyle: 'dashed',
            backgroundColor: 'var(--mantine-color-gray-0)'
          }}
        >
          <IconWorldUpload size={24} style={{ marginBottom: 8 }} />
          <Text size="sm"> 0 </Text>
        </Paper>
      ) : (
        <Stack gap="xs">
          {urls.map((url, index) => (
            <Paper key={url.id || index} withBorder p="xs" radius="md">
              <input
                type="hidden"
                name={`${field}[${index}].id`}
                value={url.id || ''}
              />
              <Group grow align="flex-start">
                <TextInput
                  label="Label"
                  placeholder="e.g., Official Website"
                  value={url.Label}
                  onChange={(e) => handleChangeUrl(index, 'Label', e.target.value)}
                  radius="md"
                  size="sm"
                />
                <Box style={{ flex: 1.5 }}>
                  <TextInput
                    label="URL"
                    placeholder="https://example.com"
                    value={url.URL}
                    onChange={(e) => handleChangeUrl(index, 'URL', e.target.value)}
                    radius="md"
                    size="sm"
                    leftSection={<IconLink size={14} />}
                  />
                </Box>
                <ActionIcon
                  color="red"
                  mt={24}
                  onClick={() => handleRemoveUrl(index)}
                  variant="light"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
