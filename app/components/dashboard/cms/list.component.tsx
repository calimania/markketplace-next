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
  // IconCopy,
  IconDotsVertical,
  // IconRocket,
  // IconRocketOff,
  IconPhoto,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Article, Product, Album } from '@/markket';

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

export default function ListComponent({ items, actions, plural, singular }: ArticleListProps) {
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
      <Paper p="xl" withBorder radius="xl" className="border-4 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-sky-50 shadow-lg">
        <Text ta="center" c="dimmed" className="text-lg font-bold text-fuchsia-700">
          No {plural} found.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="xl" className="border-4 border-black bg-white/90 shadow-xl">
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="md" horizontalSpacing="lg" className="rounded-xl">
          <Table.Thead className="bg-fuchsia-50 border-b-2 border-fuchsia-200">
            <Table.Tr>
              <Table.Th style={{ width: 120 }} className="text-fuchsia-700 font-bold">Actions</Table.Th>
              <Table.Th className="text-sky-900 font-bold">{singular.charAt(0).toUpperCase()}{singular.slice(1)}</Table.Th>
              <Table.Th className="text-sky-900 font-bold">Status</Table.Th>
              <Table.Th className="text-sky-900 font-bold">Last Updated</Table.Th>
              {'Tags' in items?.[0] && <Table.Th className="text-sky-900 font-bold">Tags</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {articles.map((item) => (
              <Table.Tr key={item.documentId} className="hover:bg-fuchsia-50 transition-all">
                <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <Tooltip label="Edit" color="fuchsia" withArrow>
                      <ActionIcon
                        variant="light"
                        color="fuchsia"
                        className="border-2 border-fuchsia-200 bg-white hover:bg-fuchsia-100"
                        onClick={() => handleAction('edit', item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Menu position="bottom-end" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="light" color="fuchsia" className="border-2 border-fuchsia-200 bg-white hover:bg-fuchsia-100">
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
                        {/* <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => handleAction('clone', item)}
                        >
                          Clone
                        </Menu.Item> */}
                        {/* {item.publishedAt ? (
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
                        )} */}
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
                      size={44}
                      radius="xl"
                      src={
                        item.SEO?.socialImage?.formats?.thumbnail?.url || item.SEO?.socialImage?.formats.thumbnail?.url
                        || item.SEO?.socialImage?.url || item?.cover?.thumbnail?.url || item?.Favicon?.url
                      }
                      alt={(item as Article).Title || (item as Album).title || (item as Product).Name}
                      className="border-2 border-fuchsia-200 bg-white"
                    >
                      <IconPhoto size={22} />
                    </Avatar>
                    <div>
                      <Text size="md" fw={700} lineClamp={1} className="text-sky-900">
                        <a href="#" onClick={() => handleAction('view', item)} className="hover:underline">
                          {(item as Article).Title || (item as Album).title || (item as Product).Name}
                        </a>
                      </Text>
                      <Text size="xs" c="dimmed" className="italic">
                        {item.slug}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={(item?.SEO?.excludeFromSearch || !item.publishedAt) ? 'yellow' : 'green'}
                    variant="filled"
                    className="border-2 border-black font-bold"
                  >
                    {(!!item?.SEO?.excludeFromSearch || !item.publishedAt) ? 'Draft' : 'Published'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" className="text-fuchsia-700 font-semibold">
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
                          className="border-2 border-black font-bold"
                        >
                          {tag.Label}
                        </Badge>
                      ))}
                      {((item as HasTags).Tags?.length || 0) > 2 && (
                        <Badge size="sm" variant="outline" color="gray" className="border-2 border-black font-bold">
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
