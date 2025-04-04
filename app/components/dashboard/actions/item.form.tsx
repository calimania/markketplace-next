
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

const FormItem = ({ id, create, update, form, plural, }: ItemFormProps) => {
  console.log("form item ", { form })

  const handleSubmit = async (values: StoreFormValues) => {

    try {
      if (create) return create(values);
      if (update && id) return update(values);
    } catch (error) {
      console.warn({ error });
    }
  };

  return (
    <Container size="md" py="xl" >
      <Paper withBorder p="md" radius="md">
        <DashboardForm
          contentType={plural as string}
          action='create'
          onSubmit={handleSubmit}
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
