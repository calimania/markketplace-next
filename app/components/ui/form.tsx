'use client';

import { ContentItem } from '@/app/hooks/common';
import { useState, ReactNode, useContext, useEffect } from 'react';
import SEOPreview from '../dashboard/seo.preview';

import {
  TextInput,
  Container,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Text,
  Title,
  Switch,
  NumberInput,
  ColorInput,
  Select,
  Checkbox,
  FileInput,
  PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuildingStore, IconSpade, IconDeviceFloppy, IconDisc, IconArticle, IconShoppingCart } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useAuth } from '@/app/providers/auth.provider';

import ContentEditor from '@/app/components/ui/form.input.tiptap';
import URLsInput from './form.input.urls';
import TagsInput from './form.input.tags';

// Define field types
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'switch'
  | 'checkbox'
  | 'color'
  | 'file'
  | 'urls'
  | 'tags'
  | 'markdown'
  | 'blocks'
  | 'password';

// Define field configuration
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  minRows?: number;
  maxRows?: number;
  min?: number;
  max?: number;
  step?: number;
  groupName?: string; // For grouped fields like SEO.title
}

// Define section configuration
interface SectionConfig {
  title: string;
  description?: string;
  fields: FieldConfig[];
}

// Define form configuration
interface FormConfig {
  sections: SectionConfig[];
  initialValues: Record<string, any>;
  validation?: Record<string, any>;
}

// Define content types icons
const contentTypeIcons: Record<string, ReactNode> = {
  stores: <IconBuildingStore size={24} color="magenta" />,
  articles: <IconArticle size={24} />,
  products: <IconShoppingCart size={24} />,
  pages: <IconSpade size={24} />,
};

interface ItemFormProps {
  contentType: 'store' | 'article' | 'product' | string;
  onSubmit: (values: any) => Promise<void>;
  action: 'create' | 'update';
  item?: ContentItem;
  id?: string;
  formConfig: FormConfig;
  title?: string;
  description?: string;
  singular?: string;
}

const FormItem = ({
  contentType,
  onSubmit,
  action,
  item,
  singular,
  formConfig,
  title,
  description,
}: ItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { store } = useContext(DashboardContext);
  const { fetchStores } = useAuth();

  const form = useForm({
    initialValues: formConfig.initialValues,
    validate: formConfig.validation
  });

  useEffect(() => {
    form.setValues(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const response = await onSubmit(values) as any;

      notifications.show({
        title: 'Success',
        message: `${contentType} ${action === 'create' ? 'created' : 'updated'} successfully`,
        color: 'green',
      });

      const documentId = response?.data?.documentId;

      if (documentId) {
        let redirect_to = '';
        if (contentType === 'stores') {
          await fetchStores();
          redirect_to = `/dashboard/store?store=${documentId}`;
        } else {
          redirect_to = `/dashboard/${contentType}/view/${documentId}?store=${store.documentId}`
        }
        router.push(redirect_to);
      }
    } catch (error) {
      console.warn({ error });
      notifications.show({
        title: 'Error',
        message: `Failed to ${action} ${contentType}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to slugify a string
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 64);

  const renderField = (field: FieldConfig) => {
    const inputProps = field.groupName
      ? form.getInputProps(`${field.groupName}.${field.name}`)
      : form.getInputProps(field.name);

    if (field.name == 'slug') {
      return (
        <TextInput
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          name={field.name}
          value={form.values.slug}
          {...{ ...inputProps, }}
          onBlur={(e) => {
            form.setFieldValue('slug', slugify(e.target.value));
          }}
          onFocus={() => {
            if (!form.values.slug && form.values.title) {
              form.setFieldValue('slug', slugify(form.values.title));
            }
          }}
        />
      );
    }
    console.log({ field })
    if (field.groupName == 'SEO') {
      if (field.name === 'metaTitle') {
        console.log({ values: form.values })
        return (
          <TextInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            {...inputProps}
            onBlur={() => {
              const title = form?.values?.title || form?.values?.Title || form?.values?.Name;
              if (!form.values.SEO?.metaTitle && title) {
                form.setFieldValue('SEO.metaTitle', title);
              }
            }}
          />
        );
      }

      if (field.name === 'metaKeywords') {
        return (
          <Textarea
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            minRows={field.minRows || 3}
            {...inputProps}
            onBlur={() => {
              const title = form?.values?.title || form?.values?.Title || form?.values?.Name;
              console.log({ title, v: form.values })
              if (!form.values.SEO?.metaKeywords && title) {
                form.setFieldValue('SEO.metaKeywords', title.replace(/ /g, ', '))
              }
            }}
          />
        );
      }

      // if (field.name === 'metaDescription') {
      // Adapt to different ContentType
      // return (
      //     <Textarea
      //       key={field.name}
      //       label={field.label}
      //       placeholder={field.placeholder}
      //       description={field.description}
      //       required={field.required}
      //       minRows={field.minRows || 3}
      //       onBlur={() => {
      //         if (!form.values.SEO?.metaDescription && form.values.title) {
      //           form.setFieldValue('SEO.metaDescription', form.values.title.slice(0, 140));
      //         }
      //       }}
      //       {...inputProps}
      //     />
      //   );
      // }
    }

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            {...inputProps}
          />
        );
      case 'markdown':
      case 'blocks':
        return (
          <ContentEditor
            key={field.name}
            label={field.label}
            description={field.description}
            placeholder={field.placeholder || 'Write your content here...'}
            value={inputProps.value || ''}
            onChange={inputProps.onChange}
            error={inputProps.error}
            format={field.type}
          />
        );
      case 'urls':
        return (
          <URLsInput
            key={field.name}
            label={field.label}
            description={field.description}
            value={inputProps.value}
            onChange={inputProps.onChange}
          />
        );
      case 'tags':
        return (
          <TagsInput
            key={field.name}
            label={field.label}
            description={field.description}
            value={inputProps.value || []}
            onChange={inputProps.onChange}
            form={form}
            field={field.name}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            minRows={field.minRows || 3}
            {...inputProps}
          />
        );
      case 'number':
        return (
          <NumberInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            {...inputProps}
          />
        );
      case 'select':
        return (
          <Select
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            data={field.options || []}
            {...inputProps}
          />
        );
      case 'switch':
        return (
          <Switch
            key={field.name}
            label={field.label}
            description={field.description}
            {...inputProps}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            key={field.name}
            label={field.label}
            description={field.description}
            {...inputProps}
          />
        );
      case 'color':
        return (
          <ColorInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            {...inputProps}
          />
        );
      case 'file':
        return (
          <FileInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            {...inputProps}
          />
        );
      case 'password':
        return (
          <PasswordInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            required={field.required}
            {...inputProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container size="md" py="xl" mx={0} px='sm'>
      <Paper p={0} className={`${contentType} ${item.id}`} mx={0} >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Group>
              {contentTypeIcons[contentType] || <IconBuildingStore size={24} color="magenta" />}
              <Title order={3}>
                {title || `${action === 'create' ? 'Create' : 'Update'} ${singular}`}
              </Title>
            </Group>
            <Text size="sm" c="dimmed">
              {description || `Fill out the form below to ${action} a ${singular}.`}
            </Text>
            {formConfig.sections.map((section, index) => (
              <Stack key={index} mt={index > 0 ? "xl" : 0}>
                {section.title && (
                  <Title order={5}>{section.title}</Title>
                )}
                {section.description && (
                  <Text size="sm" c="dimmed">
                    {section.description}
                  </Text>
                )}
                {section.fields.map(renderField)}
              </Stack>
            ))}
            <Group justify="flex-end" mt="xl">
              <Button
                type="submit"
                loading={loading}
                leftSection={action === 'create' ? <IconDisc size={16} /> : <IconDeviceFloppy size={16} />}
              >
                {action === 'create' ? 'Create' : 'Update'} {singular}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
      <Paper pt="sm">
        <SEOPreview SEO={form.values?.SEO} previewUrl={`/${form.values.slug}`} />
      </Paper>
    </Container>
  );
};

export default FormItem;
