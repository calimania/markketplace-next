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
  ColorInput,
  ColorSwatch,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconTags,
  IconTag,
} from '@tabler/icons-react';
import { UseFormReturnType } from '@mantine/form';
import { Tag } from '@/markket/tag.d';
import { TagColorCodes, getTagColorHex } from '@/markket/tag.helpers';

interface TagsInputProps {
  label?: string;
  description?: string;
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  form?: UseFormReturnType<any>;
  field?: string;
}

export default function TagsInput({
  label = 'Tags',
  description,
  value = [],
  onChange,
  form,
  field = 'Tags',
}: TagsInputProps) {
  const [tags, setTags] = useState<Tag[]>(value || []);

  useEffect(() => {
    if (!!value?.length) {
      console.log({ value })
      setTags(value.map(t => ({
        Label: t.Label,
        Color: t.Color?.startsWith('#') ? t.Color : getTagColorHex(t.Color as string),
      } as Tag)));
    }
  }, [value]);

  const handleAddTag = () => {
    const newTags = [...tags, { id: -Date.now(), Label: '', Color: '#0051ba' }];
    setTags(newTags);
    onChange(newTags);
    if (form && field) {
      form.setFieldValue(field, newTags);
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    onChange(newTags);
    if (form && field) {
      form.setFieldValue(field, newTags);
    }
  };

  const handleChangeTag = (index: number, key: 'Label' | 'Color', value: string) => {
    const newTags = [...tags];
    newTags[index][key] = value;
    setTags(newTags);
    onChange(newTags);
    if (form && field) {
      form.setFieldValue(field, newTags);
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
          onClick={handleAddTag}
        >
          Add Tag
        </Button>
      </Group>

      {description && (
        <Text size="xs" c="dimmed">{description}</Text>
      )}

      {tags.length === 0 ? (
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
          <IconTags size={24} style={{ marginBottom: 8 }} />
          <Text size="sm">No tags added yet</Text>
        </Paper>
      ) : (
        <Stack gap="xs">
          {tags.map((tag, index) => (
            <Paper key={tag.id || index} withBorder p="xs" radius="md">
              <input
                type="hidden"
                name={`${field}[${index}].id`}
                value={tag.id || ''}
              />
              <Group grow align="center">
                <TextInput
                  label="Tag Name"
                  placeholder="e.g., Featured"
                  value={tag.Label}
                  onChange={(e) => handleChangeTag(index, 'Label', e.target.value)}
                  radius="md"
                  size="sm"
                  leftSection={<IconTag size={14} style={{ color: tag.Color }} />}
                />

                <Box style={{ flex: 0.6 }}>
                  <ColorInput
                    label="Color"
                    withPicker={false}
                    placeholder="Choose color"
                    value={tag.Color || '#0051ba'}
                    onChange={(value) => handleChangeTag(index, 'Color', value)}
                    radius="md"
                    size="sm"
                    format="hex"
                    swatches={TagColorCodes}
                    withEyeDropper
                  />
                </Box>

                <ActionIcon
                  color="red"
                  mt={24}
                  onClick={() => handleRemoveTag(index)}
                  variant="light"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

              <Group mt="xs">
                <Text size="xs">Preview:</Text>
                <Group gap="xs">
                  <ColorSwatch color={tag.Color || '#0051ba'} size={16} />
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color: tag.Color || '#0051ba',
                      borderBottom: `2px solid ${tag.Color || '#0051ba'}`,
                      paddingBottom: 2
                    }}
                  >
                    {tag.Label || 'Tag Name'}
                  </Text>
                </Group>
              </Group>
            </Paper>
          ))}
          </Stack>
      )}
    </Stack>
  );
}

