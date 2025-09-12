'use client';

import { ContentItem } from '@/app/hooks/common';
import {
  Container,
  Paper,
} from '@mantine/core';
import { Store, type ContentTypes } from '../index.d';

import DashboardForm from '@/app/components/ui/form'
import { useContext, } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';

export type FormValues = ContentTypes;

export type ItemFormProps = {
  onSubmit: (values: FormValues) => void;
  action: string;
  item: ContentItem;
  id?: string;
  store: Store;
  singular: string;
  previewUrl?: string;
  plural?: string;
  create?: any;
  description?: string;
  update?: any;
  form?: {
    config: {
      initialValues: any;
      validation: any;
    }
    sections: any[];
  };
};

const FormItem = ({ id, item, create, update, form, singular, plural, description, action, onSubmit }: ItemFormProps) => {
  const { store } = useContext(DashboardContext);

  const handleSubmit = async (values: FormValues) => {
    console.log(`form:${action}:${singular}`, { update, id });

    let result = null as (null | { data: FormValues });

    try {
      if (action == 'new' && create) {
        result = await create(values, store?.documentId);
      }
      if (action == 'edit' && update && id) {
        result = await update(values, item.documentId, store.documentId, item);
      }
    } catch (error) {
      console.warn({ error });
    }

    console.log(`${singular}:${action}`, { result, id: result?.data?.documentId });

    if (onSubmit) onSubmit({ item: result?.data });
  };

  return (
    <Container size="md" py="xl" mx={0} px={0}>
      <Paper withBorder p="md" radius="md" mx={0} px={0}>
        <DashboardForm
          contentType={plural as string}
          action={action === 'new' ? 'create' : 'update'}
          onSubmit={handleSubmit}
          item={item}
          singular={singular as string}
          description={description as string}
          formConfig={{
            sections: form?.sections || [],
            initialValues: form?.config?.initialValues || {},
            validation: form?.config?.validation || {},
          }}
        />
      </Paper>
    </Container>
  );
};

export default FormItem;
