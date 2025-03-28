'use client';

import ArticleList from '@/app/components/dashboard/article.list';
import { Article } from '@/markket/';
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  Text,
  Skeleton,
  Stack,
} from '@mantine/core';
import {
  IconPlus,
  IconArticle,
  IconSearch,
} from '@tabler/icons-react';
import { useState, useEffect, useContext } from 'react';
import { strapiClient as strapi } from '@/markket/api.strapi';
import { useRouter } from 'next/navigation';
import { DashboardContext } from '@/app/providers/dashboard.provider';

const ArticlePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { store } = useContext(DashboardContext);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const ar = await strapi.fetch({
          contentType: 'articles',
          filters: {
            store: {
              $eq: store?.id,
            }
          },
          populate: 'Tags,SEO',
        });
        setArticles((ar?.data || []) as Article[]);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (store?.id) {
      fetchArticles();
    } else {
      setArticles([]);
      setLoading(false);
    }
  }, [store?.id]);

  if (!store) {
    return (
      <Container size="lg" py="xl">
        <Paper p="xl" withBorder>
          <Text ta="center" c="dimmed">
            Please select a store to view articles
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
              <IconArticle size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <div>
                <Title order={2} size="h3">
                  Articles
                </Title>
                <Text size="sm" c="dimmed">
                  Manage articles for {store.title}
                </Text>
              </div>
            </Group>

            <Group gap="sm">
              <Button
                variant="light"
                leftSection={<IconSearch size={16} />}
                disabled={articles.length === 0}
              >
                Search
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/articles/new?store=${store.documentId}`)}
                disabled
                leftSection={<IconPlus size={16} />}
              >
                New Article
              </Button>
            </Group>
          </Group>
        </Paper>

        {loading ? (
          <Stack gap="md">
            <Skeleton height={50} radius="md" />
            <Skeleton height={50} radius="md" />
            <Skeleton height={50} radius="md" />
          </Stack>
        ) : (
          <ArticleList
            articles={articles}
            actions={{
              onView: (article) => {
                router.push(`/dashboard/articles/view/${article.documentId}?store=${store.documentId}`);
              },
              onEdit: (article) => {
                router.push(`/dashboard/articles/edit/${article.documentId}?store=${store.documentId}`);
              },
              onDelete: async (article) => {
                console.log('Deleting article:', article.documentId);
                // Add delete functionality
              },
              onPublish: async (article) => {
                console.log('Publishing article:', article.documentId);
                // Add publish functionality
              },
              onUnpublish: async (article) => {
                console.log('Unpublishing article:', article.documentId);
                // Add unpublish functionality
              },
            }}
          />
        )}
      </Stack>
    </Container>
  );
};

export default ArticlePage;
