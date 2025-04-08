import { ContentItem } from '@/app/hooks/common';
import { useState, ReactNode, useContext, useEffect } from 'react';
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
}

const FormItem = ({
  contentType,
  onSubmit,
  action,
  item,
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
          redirect_to = `/dashboards/${contentType}/view/${documentId}?store=${store.documentId}`
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

  // Render field based on type
  const renderField = (field: FieldConfig) => {
    const inputProps = field.groupName
      ? form.getInputProps(`${field.groupName}.${field.name}`)
      : form.getInputProps(field.name);

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
        return (
          <ContentEditor
            key={field.name}
            label={field.label}
            description={field.description}
            placeholder={field.placeholder || 'Write your content here...'}
            value={inputProps.value || ''}
            onChange={inputProps.onChange}
            error={inputProps.error}
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
                {title || `${action === 'create' ? 'Create' : 'Update'} ${contentType}`}
              </Title>
            </Group>

            <Text size="sm" c="dimmed">
              {description || `Fill out the form below to ${action} a ${contentType}.`}
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
                {action === 'create' ? 'Create' : 'Update'} {contentType}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default FormItem;
