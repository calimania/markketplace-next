
// import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';
import {
  Container,
  Paper,
} from '@mantine/core';
import { Store, SEO } from '@/markket';

import DashboardForm from '@/app/components/ui/form'

interface StoreFormValues {
  title: string;
  Description: string;
  slug: string;
  SEO?: SEO;
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
  update?: any;
  form?: {
    config: {
      initialValues: any;
      validation: any;
    }
    sections: any[];
  };
};

const FormItem = ({ id, item, create, update, form, plural, action }: ItemFormProps) => {


  const handleSubmit = async (values: StoreFormValues) => {
    console.log("form item ", { action, update, id })
    try {
      if (action == 'new' && create) return create(values);
      if (action == 'edit' && update && id) return update(values, item.documentId);
    } catch (error) {
      console.warn({ error });
    }
  };

  return (
    <Container size="md" py="xl" >
      <Paper withBorder p="md" radius="md">
        <DashboardForm
          contentType={plural as string}
          action={action === 'new' ? 'create' : 'update'}
          onSubmit={handleSubmit}
          item={item}
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
