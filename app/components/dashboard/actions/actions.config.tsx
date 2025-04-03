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
      validate: {
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
    }
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
