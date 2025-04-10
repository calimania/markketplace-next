import ViewItem from '@/app/components/dashboard/actions/item.view';
import FormItem from '@/app/components/dashboard/actions/item.form';
import { Store, } from '@/markket';
import { ElementType } from 'react';
import { markketClient } from '@/markket/api.markket';
import { createContentAction, updateContentAction } from '@/markket/action.helpers';

const client = new markketClient();


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

const commonSections = {
  initialValues: {
    SEO: {
      metaTitle: '',
      metaDescription: '',
      metaAuthor: '',
      metaKeywords: '',
      metaUrl: '',
      metaDate: '',
    }
  },
  seo: {
    title: 'Index information',
    description: 'Metadata for social sharing & discovery',
    fields: [
      {
        name: 'metaTitle',
        label: 'Meta Title',
        type: 'text',
        placeholder: 'SEO-friendly title',
        description: 'Title that appears in search engine results (50-60 characters recommended)',
        required: true,
        groupName: 'SEO'
      },
      {
        name: 'metaDescription',
        label: 'Meta Description',
        type: 'textarea',
        placeholder: 'Brief description for search results...',
        description: 'Short description that appears in search results (150-160 characters recommended)',
        required: true,
        minRows: 2,
        groupName: 'SEO'
      },
      {
        name: 'metaKeywords',
        label: 'Meta Keywords',
        type: 'text',
        placeholder: 'Comma separated list of keywords',
        description: 'Optional to help categorize your content',
        groupName: 'SEO'
      }
    ]
  },
  validations: {
    title: (value: string) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
    name: (value: string) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
    slug: (value: string) => {
      if (value.length < 3) return 'Slug must be at least 3 characters';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
        return 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
      return null;
    },
    store_slug: (value: string) => {
      if (value.length < 5) return 'Slug must be at least 5 characters';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
        return 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
      return null;
    },
    content: (value: string) => (value?.length < 10 ? 'Content must be at least 10 characters' : null),
    description: (value: string) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
    seo: {
      metaTitle: (value: string | undefined) => ((value?.length || 0) < 3 ? 'Meta title must be at least 3 characters' : null),
      metaDescription: (value: string | undefined) => ((value?.length || 0) < 10 ? 'Meta description must be at least 10 characters' : null),
    }
  },
  slugField: (contentType: string, required = true) => ({
    name: 'slug',
    label: 'Slug [url path]',
    type: 'text',
    placeholder: `2025-${contentType}`,
    description: `The ${contentType}'s URL path suffix, and query identifier`,
    required
  }),
  tagsField: (name: string) => ({
    name: name || 'Tags',
    label: 'Tags',
    type: 'tags',
    description: 'Keywords to classify your blog',
  }),
  urlsField: {
    name: 'URLS',
    label: 'Links',
    type: 'urls',
    description: 'Easy to find, featured links'
  }
};
export const actionsMap: Record<string, ActionComponent> = {
  articles: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Tags&populate[]=cover`,
    view: ViewItem,
    edit: FormItem,
    new: FormItem,
    singular: 'article',
    plural: 'articles',
    create: createContentAction('article'),
    update: updateContentAction('article'),
    form: {
      initialValues: {
        Title: '',
        Content: '',
        slug: '',
        Tags: [],
        SEO: commonSections.initialValues.SEO,
      },
      validation: {
        Title: commonSections.validations.title,
        slug: commonSections.validations.slug,
        SEO: commonSections.validations.seo,
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'Title',
            label: 'Article Title',
            type: 'text',
            placeholder: 'To display in blog posts lists & page',
            required: true
          },
          commonSections.slugField('article'),
          {
            name: 'Content',
            label: 'Content',
            type: 'blocks',
            placeholder: 'Poetry should be more encouraging of not having virtue',
            required: true
          },
          commonSections.tagsField('Tags'),
        ]
      },
      commonSections.seo
    ]
  },
  pages: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=albums&populate[]=albums.tracks`,
    view: ViewItem,
    edit: FormItem,
    new: FormItem,
    singular: 'page',
    plural: 'pages',
    create: createContentAction('page'),
    update: updateContentAction('page'),
    form: {
      description: 'Use pages to engage your users. Most layouts recommend a few basic page slugs [home, about, products, newsletter, blog]',
      initialValues: {
        Title: '',
        Content: '',
        slug: '',
        SEO: commonSections.initialValues.SEO,
      },
      validation: {
        Title: commonSections.validations.title,
        slug: commonSections.validations.slug,
        SEO: commonSections.validations.seo,
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'Title',
            label: 'Page Title',
            type: 'text',
            placeholder: 'About Us',
            required: true
          },
          commonSections.slugField('page'),
          {
            name: 'Content',
            label: 'Page Content',
            type: 'blocks',
            placeholder: 'Write your page content here...',
            required: true
          }
        ]
      },
      commonSections.seo
    ]
  },

  products: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Slides&populate[]=Thumbnail&populate[]=Tag&populate[]=PRICES`,
    view: ViewItem,
    edit: FormItem,
    new: FormItem,
    singular: 'product',
    plural: 'products',
    create: createContentAction('product'),
    update: updateContentAction('product'),
    form: {
      initialValues: {
        Name: '',
        Description: '',
        slug: '',
        PRICES: [{
          Price: 0,
          Currency: 'USD',
          Name: 'DIGITAL_Standard',
          Description: 'online fullfilment',
        }],
        SEO: commonSections.initialValues.SEO,
      },
      validation: {
        Name: commonSections.validations.name,
        slug: commonSections.validations.slug,
        SEO: commonSections.validations.seo,
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'Name',
            label: 'Product Name',
            type: 'text',
            placeholder: 'Shards of Andúril',
            required: true
          },
          commonSections.slugField('product'),
          {
            name: 'Description',
            label: 'Description',
            type: 'markdown',
            placeholder: '...also called the Flame of the West and the Sword Reforged, was the sword which was reforged from the shards of Narsil in Rivendell',
            required: true
          },
          commonSections.tagsField('Tag'),
        ]
      },
      {
        title: 'Pricing',
        description: 'Set up pricing options for your product',
        fields: [
          {
            name: 'PRICES',
            label: 'Prices',
            type: 'prices',
            description: 'Define pricing options for this product'
          }
        ]
      },
      commonSections.seo
    ]
  },
  stores: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Cover&populate[]=Favicon&populate[]=Logo&populate[]=Slides&populate[]=URLS`,
    view: ViewItem,
    edit: FormItem,
    new: FormItem,
    singular: 'store',
    plural: 'stores',
    update: async (values: Store, id: string) => {
      return await client.put(`/api/markket/store?id=${id}`, {
        body: {
          store: values,
        },
      });
    },
    create: async (values: Store) => {
      return await client.post('/api/markket/store', {
        body: {
          store: values,
        },
      });
    },
    form: {
      initialValues: {
        title: '',
        Description: '',
        slug: '',
        SEO: commonSections.initialValues.SEO,
      },
      validation: {
        title: commonSections.validations.title,
        slug: commonSections.validations.store_slug,
        SEO: commonSections.validations.seo,
        Description: commonSections.validations.description,
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
          commonSections.slugField('store'),
          {
            name: 'Description',
            label: 'Description',
            type: 'markdown',
            placeholder: 'Tell us about your store...\nUse the editor to add styles & images',
            required: true
          },
          commonSections.urlsField
        ]
      },
      commonSections.seo
    ]
  },
  events: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=Thumbnail&populate[]=Slides&populate[]=Tag&populate[]=PRICES`,
    view: ViewItem,
    edit: FormItem,
    new: FormItem,
    singular: 'event',
    plural: 'events',
    create: createContentAction('event'),
    update: updateContentAction('event'),
    form: {
      description: 'Host activities with your community, and share ',
      initialValues: {
        Name: '',
        Description: '',
        slug: '',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString(),
        location: '',
        PRICES: [{
          Price: 0,
          Currency: 'USD',
          Name: 'General Admission',
          Description: '',
        }],
        SEO: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          metaUrl: '',
        }
      },
      validation: {
        Name: commonSections.validations.name,
        Description: commonSections.validations.description,
        slug: commonSections.validations.slug,
        SEO: commonSections.validations.seo,
        startDate: (value: string) => (!value ? 'Start date is required' : null),
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'Name',
            label: 'Event Name',
            type: 'text',
            placeholder: 'Noche bohemia',
            required: true
          },
          commonSections.slugField('event'),
          {
            name: 'Description',
            label: 'Event Description',
            type: 'markdown',
            placeholder: 'What does your favorite color taste like?',
            required: true
          },
          commonSections.tagsField('Tag')
        ]
      },
      {
        title: 'Event Details',
        fields: [
          {
            name: 'startDate',
            label: 'Start Date & Time',
            type: 'datetime',
            required: true
          },
          {
            name: 'endDate',
            label: 'End Date & Time',
            type: 'datetime',
          },
          {
            name: 'location',
            label: 'Location',
            type: 'text',
            placeholder: 'Event venue or online'
          },
          {
            name: 'PRICES',
            label: 'Ticket Prices',
            type: 'prices',
            description: 'Define pricing options for this event'
          }
        ]
      },
      commonSections.seo
    ]
  },
  albums: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=tracks`,
    view: ViewItem,
    edit: FormItem,
    singular: 'album',
    plural: 'albums',
    create: createContentAction('album'),
    update: updateContentAction('album'),
    form: {
      initialValues: {
        title: '',
        description: '',
        content: '',
        slug: '',
        displayType: 'grid',
        SEO: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
        }
      },
      validation: {
        title: commonSections.validations.title,
        description: commonSections.validations.description,
        slug: commonSections.validations.slug,
        SEO: commonSections.validations.seo,
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'title',
            label: 'Collection Title',
            type: 'text',
            placeholder: 'My Awesome Collection',
            required: true
          },
          commonSections.slugField('collection'),
          {
            name: 'description',
            label: 'Short Description',
            type: 'textarea',
            placeholder: 'Briefly describe this collection',
            minRows: 2,
            required: true
          },
          {
            name: 'content',
            label: 'Full Description',
            type: 'markdown',
            placeholder: 'Detailed description of your collection',
          },
          {
            name: 'displayType',
            label: 'Display Type',
            type: 'select',
            placeholder: 'Choose display type',
            options: [
              { value: 'grid', label: 'Grid' },
              { value: 'list', label: 'List' },
              { value: 'carousel', label: 'Carousel' },
            ],
            description: 'How this collection will display its items'
          }
        ]
      },
      commonSections.seo
    ]
  },
  tracks: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=urls&populate[]=media`,
    view: ViewItem,
    edit: FormItem,
    singular: 'track',
    plural: 'tracks',
    create: createContentAction('albumtrack'),
    update: updateContentAction('albumtrack'),
    form: {
      initialValues: {
        title: '',
        description: '',
        content: '',
        slug: '',
        urls: [],
        SEO: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
        }
      },
      validation: {
        title: commonSections.validations.title,
        slug: commonSections.validations.slug,
        SEO: commonSections.validations.seo,
      },
    },
    form_sections: [
      {
        title: '',
        fields: [
          {
            name: 'title',
            label: 'Item Title',
            type: 'text',
            placeholder: 'My Collection Item',
            required: true
          },
          commonSections.slugField('item'),
          {
            name: 'description',
            label: 'Short Description',
            type: 'textarea',
            placeholder: 'Briefly describe this item',
            minRows: 2,
          },
          {
            name: 'content',
            label: 'Full Description',
            type: 'markdown',
            placeholder: 'Detailed description of your item',
          },
          {
            name: 'urls',
            label: 'External Links',
            type: 'urls',
            description: 'Links to external platforms or resources'
          }
        ]
      },
      commonSections.seo
    ]
  }
};
