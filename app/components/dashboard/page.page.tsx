'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
// @deprecated - Used by old /dashboard/pages route. Replaced by /tienda/[storeSlug]/pages (if available)
import { Article } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const PagePage = () => {
  const { store } = useContext(DashboardContext);
  const { items: pages, loading, } = useCMSItems<Article>('pages', store);

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
