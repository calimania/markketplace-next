'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Article } from '@/markket/';
import { useState, useEffect, useContext } from 'react';
import { strapiClient as strapi } from '@/markket/api.strapi';
import { DashboardContext } from '@/app/providers/dashboard.provider';

const PagePage = () => {
  const [pages, setPages] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const { store } = useContext(DashboardContext);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        const ar = await strapi.fetch({
          contentType: 'pages',
          filters: {
            store: {
              $eq: store?.id,
            }
          },
          populate: 'SEO,SEO.socialImage',
        });
        setPages((ar?.data || []) as Article[]);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (store?.id) {
      fetchPages();
    } else {
      setPages([]);
    }
  }, [store?.id]);

  return (
    <DashboardCMS
      singular="page"
      plural="pages"
      items={pages}
      loading={loading}
      store={store}
      description={'Pages are static content that can be used for various purposes, such as landing pages, about us, contact information, etc.'}
    ></DashboardCMS>
  );
};

export default PagePage;
