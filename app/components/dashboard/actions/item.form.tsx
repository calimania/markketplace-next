'use client';

// import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';
import {
  Container,
  Paper,
} from '@mantine/core';
import { Store, SEO } from '@/markket';

import DashboardForm from '@/app/components/ui/form'
import { useContext, } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';

interface StoreFormValues {
  title: string;
  Description: string;
  slug: string;
  SEO?: SEO;
  Content?: string | { type: string, content: any[] };
};

type ItemFormProps = {
  onSubmit: (values: StoreFormValues) => void;
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

const FormItem = ({ id, item, create, update, form, singular, plural, description, action }: ItemFormProps) => {
  const { store } = useContext(DashboardContext);

  const handleSubmit = async (values: StoreFormValues) => {
    console.log("form item ", { action, update, id, values })

    try {
      if (action == 'new' && create) return create(values, store.documentId);
      if (action == 'edit' && update && id) return update(values, item.documentId, store.documentId);
    } catch (error) {
      console.warn({ error });
    }
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
