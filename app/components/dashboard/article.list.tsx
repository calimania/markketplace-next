import { Article } from "@/markket/article";
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

type ArticleListProps = {
  articles: Article[];
  actions: {
    onEdit?: (article: Article) => void;
    onDelete?: (article: Article) => void;
    onPublish?: (article: Article) => void;
    onUnpublish?: (article: Article) => void;
    onView?: (article: Article) => void;
    onPreview?: (article: Article) => void;
    onClone?: (article: Article) => void;
  }
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

export default function ArticleList({ articles, actions }: ArticleListProps) {
  const handleAction = (action: keyof typeof map, article: Article) => {

    const fn = actions[map[action] as actions]  as (article: Article) => void;

    if (fn) {
      fn(article);
    } else {
      console.warn(`Action ${action} is not defined`);
    }
  };

  if (!articles.length) {
    return (
      <Paper p="xl" withBorder>
        <Text ta="center" c="dimmed">
          No articles found. Create your first article to get started.
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
              <Table.Th>Tags</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {articles.map((article) => (
              <Table.Tr key={article.documentId}>
                  <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <Tooltip label="Edit">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => handleAction('edit', article)}
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
                          onClick={() => handleAction('view', article)}
                        >
                          View
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => handleAction('clone', article)}
                        >
                          Clone
                        </Menu.Item>
                        {article.publishedAt ? (
                          <Menu.Item
                            leftSection={<IconRocketOff size={14} />}
                            onClick={() => handleAction('unpublish', article)}
                            color="yellow"
                          >
                            Unpublish
                          </Menu.Item>
                        ) : (
                          <Menu.Item
                            leftSection={<IconRocket size={14} />}
                            onClick={() => handleAction('publish', article)}
                            color="green"
                          >
                            Publish
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleAction('delete', article)}
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
                      src={article.cover?.formats?.thumbnail?.url || article.cover?.url}
                      alt={article.Title}
                    >
                      <IconPhoto size={20} />
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {article.Title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {article.slug}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={article.publishedAt ? 'green' : 'yellow'}
                    variant="light"
                  >
                    {article.publishedAt ? 'Published' : 'Draft'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {article.Tags?.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        size="sm"
                        variant="outline"
                        color={tag.Color}
                      >
                        {tag.Label}
                      </Badge>
                    ))}
                    {(article.Tags?.length || 0) > 2 && (
                      <Badge size="sm" variant="outline" color="gray">
                        +{article.Tags!.length - 2}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}