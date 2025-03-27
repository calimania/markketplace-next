'use client';

import ArticleList from '@/app/components/dashboard/article.list';
import { Article, Store } from '@/markket/';
import { Container } from '@mantine/core';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useContext, useState, useEffect } from 'react';
import { strapiClient } from '@/markket/api.strapi';

const ArticlePage = () => {
  const { store } = useContext(DashboardContext) as { store: Store };
  const [articles, setArticles] = useState<Article[]>([]);
  const strapi =  strapiClient;

  useEffect(() => {
     const fetchArticles = async () => {
          const ar =  await strapi.fetch(
          {
            contentType: 'articles',
            filters: {
              store: {
                  $eq: store.id,
              }
            },
            populate: 'Tags,SEO',
          });
          console.log(ar);
          setArticles((ar?.data || []) as Article[]);
        }

    if (store?.id) {
      fetchArticles();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.id]);

  return (
    <Container size="lg" py="xl">
      <ArticleList articles={articles as Article[]} actions={{
        onView: (article) => {
          window.open(`/store/${store.slug}/blog/${article.slug}`, '_blank');
        }
      }}></ArticleList>
    </Container>
  )
};

export default ArticlePage;
