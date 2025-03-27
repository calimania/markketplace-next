'use client';

import ArticleList from '@/app/components/dashboard/article.list';
import { Article } from '@/markket/';
import { Container } from '@mantine/core';
import { useState, useEffect, useContext } from 'react';
import { strapiClient as strapi } from '@/markket/api.strapi';
import { useRouter, } from 'next/navigation';
import { DashboardContext } from '@/app/providers/dashboard.provider';

const ArticlePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();
  const { store } = useContext(DashboardContext);


  useEffect(() => {
    console.log("Store ID", store?.documentId);

     const fetchArticles = async () => {
          const ar =  await strapi.fetch(
          {
            contentType: 'articles',
            filters: {
              store: {
                $eq: store?.id,
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

  }, [store]);

  return (
    <Container size="lg" py="xl">
      <h1>Articles - {store?.title}</h1>
      <ArticleList articles={articles as Article[]} actions={{
        onView: (article) => {
          router.push(`/dashboard/articles/view/${article.documentId}`);
        }
      }}></ArticleList>
    </Container>
  )
};

export default ArticlePage;
