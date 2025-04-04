import ViewItem from '@/app/components/dashboard/actions/item.view';
import FormItem from '@/app/components/dashboard/actions/item.form';
import { AlbumTrack, Article, Page, Store, Product, Album, Event } from '@/markket'
import { ElementType } from 'react';
import { markketClient } from '@/markket/api.markket';

interface ActionComponent {
  view: ElementType;
  edit: ElementType;
  new?: ElementType;
  url: string;
  singular: string;
  plural: string;
  form?: any;
  create?: any;
  update?: any;
  form_sections?: any[];
}

export const actionsMap: Record<string, ActionComponent> = {
  articles: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Tags&populate[]=cover`,
    view: ViewItem,
    edit: (item: Article) => <> edit {item.documentId}  </>,
    singular: 'article',
    plural: 'articles',
    create: async (values: any) => {
      const client = new markketClient();
      const response = await client.post('/api/markket/store', {
        body: {
          store: values,
        },
      });

      if (!response?.data?.id) {
        throw new Error('Failed to create store');
      }

      return response;
    },
  },
  pages: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=albums&populate[]=albums.tracks`,
    view: ViewItem,
    edit: (item: Page) => <> edit {item.documentId}  </>,
    singular: 'page',
    plural: 'pages',
  },
  products: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Slides&populate[]=Thumbnail&populate[]=Tag&populate[]=PRICES`,
    view: ViewItem,
    edit: (item: Product) => <> edit {item.documentId}  </>,
    singular: 'product',
    plural: 'products',
  },
  stores: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Cover&populate[]=Favicon&populate[]=Logo&populate[]=Slides`,
    view: ViewItem,
    edit: (item: Store) => <> edit {item.documentId}  </>,
    singular: 'store',
    new: FormItem,
    plural: 'stores',
    form: {
      initialValues: {
        title: '',
        Description: '',
        slug: '',
        SEO: {
          metaDescription: '',
          metaTitle: '',
          excludeFromSearch: true,
        }
      },
      validation: {
        title: (value: string) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
        slug: (value: string) => {
          if (value.length < 5) return 'Slug must be at least 5 characters';
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
            return 'Slug can only contain lowercase letters, numbers, and hyphens';
          }
          return null;
        },
        SEO: {
          metaTitle: (value: string | undefined) => ((value?.length || 0) < 3 ? 'Meta title must be at least 3 characters' : null),
          metaDescription: (value: string | undefined) => ((value?.length || 0) < 10 ? 'Meta description must be at least 10 characters' : null),
        },
        Description: (value: string) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'title',
            label: 'Store Name',
            type: 'text',
            placeholder: 'My Awesome Store',
            required: true
          },
          {
            name: 'slug',
            label: 'Store Slug',
            type: 'text',
            placeholder: 'my-awesome-store',
            description: "This will be your store's URL: markket.place/store/[slug]",
            required: true
          },
          {
            name: 'Description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Tell us about your store...',
            required: true
          }
        ]
      },
      {
        title: 'META Settings',
        description: 'This content is used by aggregators to better understand your store',
        fields: [
          {
            name: 'metaTitle',
            label: 'Meta Title',
            type: 'text',
            placeholder: 'Your Store Name - Key Product or Service',
            description: 'Title that appears in search engine results (50-60 characters recommended)',
            required: true,
            groupName: 'SEO'
          },
          {
            name: 'metaDescription',
            label: 'Meta Description',
            type: 'textarea',
            placeholder: 'Brief description of your store for search results...',
            description: 'Short description that appears in search results (150-160 characters recommended)',
            required: true,
            minRows: 2,
            groupName: 'SEO'
          }
        ]
      }
    ]
  },
  events: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Thumbnail&populate[]=Slides&populate[]=Tag&populate[]=PRICES`,
    view: ViewItem,
    edit: (item: Event) => <> edit {item.documentId}  </>,
    singular: 'event',
    plural: 'events',
  },
  albums: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=tracks`,
    view: ViewItem,
    edit: (item: Album) => <> edit {item.documentId}  </>,
    singular: 'album',
    plural: 'albums',
  },
  tracks: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=urls&populate[]=media`,
    view: ViewItem,
    edit: (item: AlbumTrack) => <>edit {item.documentId}</>,
    singular: 'track',
    plural: 'tracks',
  }
};
