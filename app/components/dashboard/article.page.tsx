'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Article } from '@/markket/';
import { useState, useEffect, useContext } from 'react';
import { strapiClient as strapi } from '@/markket/api.strapi';
import { DashboardContext } from '@/app/providers/dashboard.provider';

const ArticlePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
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
          populate: 'Tags,SEO,SEO.socialImage',
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
    }
  }, [store?.id]);

  return (
    <DashboardCMS
      singular="article"
      plural="articles"
      items={articles}
      loading={loading}
      store={store}
      description="Articles are the main content of your blog, used to share news, updates, and stories with your audience."
    ></DashboardCMS>
  );
};

export default ArticlePage;
