"use client";

import { default as ActionForm, ItemFormProps, FormValues } from '@/app/components/dashboard/actions/item.form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { useState } from 'react';
import ActionWaiting from './actions.waiting';

const FormItem = (props: ItemFormProps) => {
  const [waiting, setWaiting] = useState(false);
  const { singular,action , plural,  item  } = props;
  const router = useRouter();
  const { fetchStores } = useAuth();

  // we cache some GET responses, a synthetic delay helps load the latest versions
  // after updating a store, refresh the store list in nav
  const onSubmit = (data: FormValues) => {
    const params = new URLSearchParams(window.location.search);
    const currentStoreId = params.get('store');

    setWaiting(true);

    if (singular == 'store') {
      setTimeout(async () => {
        await fetchStores();
        return router.push(`/dashboard/store/?store=${data?.item?.documentId || ''}`);
      }, (1000));
      return;
    }

    setTimeout(async () => {
      return router.push(`/dashboard/${plural}/view/${item?.documentId || data?.item?.documentId || ''}?store=${currentStoreId}`);
    }, ((0.8) * 1000));
  }

  if (waiting) {
    return <ActionWaiting singular={singular} action={action} />
  }

  return <ActionForm {...props} onSubmit={onSubmit} />;
}

export default FormItem;
