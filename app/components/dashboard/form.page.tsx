'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Form } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const FormsPage = () => {
  const { store } = useContext(DashboardContext);
  const { items, loading } = useCMSItems<Form>('forms', store);

  return (
    <DashboardCMS
      singular="form"
      plural="forms"
      items={items}
      loading={loading}
      store={store}
      description="Questionnaires & Forms to collect information from your audience"
    ></DashboardCMS>
  );
};

export default FormsPage;
