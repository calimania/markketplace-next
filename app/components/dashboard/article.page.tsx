'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Article } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const ArticlePage = () => {
  const { store } = useContext(DashboardContext);
  const { items: articles, loading, } = useCMSItems<Article>('articles', store);

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
