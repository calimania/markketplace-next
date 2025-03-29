
import {
  Table,
  Text,
  Group,
  ActionIcon,
  Menu,
  Badge,
  Paper,
  Avatar,
  Tooltip,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconCopy,
  IconDotsVertical,
  IconRocket,
  IconRocketOff,
  IconPhoto,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Page, Article, Product } from '@/markket';

import { ContentItem } from "@/app/hooks/common.d";

type HasTags = {
  Tags: {
    Label: string;
    Color: string;
  }[];
}

type ArticleListProps = {
  items: ContentItem[];
  actions: {
    onEdit?: (article: ContentItem) => void;
    onDelete?: (article: ContentItem) => void;
    onPublish?: (article: ContentItem) => void;
    onUnpublish?: (article: ContentItem) => void;
    onView?: (article: ContentItem) => void;
    onPreview?: (article: ContentItem) => void;
    onClone?: (article: ContentItem) => void;
  },
  plural: string;
  singular: string;
}

const map = {
  edit: 'onEdit',
  delete: 'onDelete',
  publish: 'onPublish',
  unpublish: 'onUnpublish',
  view: 'onView',
  preview: 'onPreview',
  clone: 'onClone',
};

type actions = 'onEdit' | 'onDelete' | 'onPublish' | 'onUnpublish' | 'onView' | 'onPreview' | 'onClone';

export default function ListComponent({ items, actions, plural }: ArticleListProps) {
  const handleAction = (action: keyof typeof map, article: ContentItem) => {

    const fn = actions[map[action] as actions] as (article: ContentItem) => void;

    if (fn) {
      fn(article);
    } else {
      console.warn(`Action ${action} is not defined`);
    }
  };
  const articles = items;
  if (!items.length) {
    return (
      <Paper p="xl" withBorder>
        <Text ta="center" c="dimmed">
          No {plural} found.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md">
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              <Table.Th>Article</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Last Updated</Table.Th>
              {'Tags' in items?.[0] && <Table.Th>Tags</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {articles.map((item) => (
              <Table.Tr key={item.documentId}>
                  <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <Tooltip label="Edit">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => handleAction('edit', item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Menu position="bottom-end" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => handleAction('view', item)}
                        >
                          View
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => handleAction('clone', item)}
                        >
                          Clone
                        </Menu.Item>
                        {item.publishedAt ? (
                          <Menu.Item
                            leftSection={<IconRocketOff size={14} />}
                            onClick={() => handleAction('unpublish', item)}
                            color="yellow"
                          >
                            Unpublish
                          </Menu.Item>
                        ) : (
                          <Menu.Item
                            leftSection={<IconRocket size={14} />}
                              onClick={() => handleAction('publish', item)}
                            color="green"
                          >
                            Publish
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleAction('delete', item)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar
                      size={40}
                      radius="md"
                      src={item.SEO?.socialImage?.formats?.thumbnail?.url || item.SEO?.socialImage?.formats.thumbnail?.url}
                      alt={(item as Article).Title || (item as Page).Title || (item as Product).Name}
                    >
                      <IconPhoto size={20} />
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} lineClamp={1}>
                        <a href="#" onClick={() => handleAction('view', item)} className="text-blue-600 hover:text-blue-900">
                          {(item as Article).Title || (item as Page).Title || (item as Product).Name}
                        </a>
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.slug}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={(item?.SEO?.excludeFromSearch || !item.publishedAt) ? 'yellow' : 'green'}
                    variant="light"
                  >
                    {(item?.SEO?.excludeFromSearch || !item.publishedAt) ? 'Draft' : 'Published'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                  </Text>
                </Table.Td>
                {'Tags' in items?.[0] && (
                  <Table.Td>
                    <Group gap={4}>
                      {(item as HasTags)?.Tags?.slice(0, 2).map((tag, id) => (
                        <Badge
                          key={id}
                          size="sm"
                          variant="outline"
                          color={tag.Color}
                        >
                          {tag.Label}
                        </Badge>
                      ))}
                      {((item as HasTags).Tags?.length || 0) > 2 && (
                        <Badge size="sm" variant="outline" color="gray">
                          +{(item as HasTags).Tags!.length - 2}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};
