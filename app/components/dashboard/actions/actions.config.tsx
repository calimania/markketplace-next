import ViewItem from '@/app/components/dashboard/actions/item.view';
import FormItem from '@/app/components/dashboard/actions/item.form';
import { Page, Article, Product, Event, Album, Store, AlbumTrack } from '@/markket';
import { markketClient } from '@/markket/api';
import { ElementType } from 'react';

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

type Values = Page | Article | Product | Event | Album | AlbumTrack;

const client = new markketClient();

const JSONDocToBlocks = (doc: any): any[] => {
  if (!doc || !doc.content) return [];

  return doc.content.map((node: any) => {
    switch (node.type) {
      case 'paragraph':
        return {
          type: 'paragraph',
          children: node.content
            ? node.content.map((child: any) => {
              if (child.type === 'text') {
                const marks = child.marks || [];
                const textNode: any = {
                  type: 'text',  // Add explicit type: 'text'
                  text: child.text || ''
                };

                // Apply formatting marks
                marks.forEach((mark: any) => {
                  if (mark.type === 'bold') textNode.bold = true;
                  if (mark.type === 'italic') textNode.italic = true;
                  if (mark.type === 'code') textNode.code = true;
                });

                return textNode;
              }

              if (child.type === 'link') {
                return {
                  type: 'link',
                  url: child.attrs?.href || '',
                  children: child.content?.map((c: any) => ({
                    type: 'text',  // Add explicit type: 'text'
                    text: c.text || ''
                  })) || [{ type: 'text', text: '' }]
                };
              }

              return { type: 'text', text: '' };  // Add explicit type: 'text'
            })
            : [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      case 'heading':
        return {
          type: 'heading',
          level: node.attrs?.level || 1,
          children: node.content
            ? node.content.map((child: any) => {
              if (child.type === 'text') {
                return { type: 'text', text: child.text || '' };  // Add explicit type: 'text'
              }

              if (child.type === 'link') {
                return {
                  type: 'link',
                  url: child.attrs?.href || '',
                  children: child.content?.map((c: any) => ({
                    type: 'text',  // Add explicit type: 'text'
                    text: c.text || ''
                  })) || [{ type: 'text', text: '' }]
                };
              }

              return { type: 'text', text: '' };  // Add explicit type: 'text'
            })
            : [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      case 'bulletList':
        return {
          type: 'bullet-list',
          children: node.content
            ? node.content.map((listItem: any) => ({
              type: 'list-item',
              children: listItem.content?.map((p: any) => ({
                type: 'paragraph',
                children: p.content?.map((c: any) => ({
                  type: 'text',  // Add explicit type: 'text'
                  text: c.text || ''
                })) || [{ type: 'text', text: '' }]
              })) || [{ type: 'text', text: '' }]
            }))
            : []
        };

      case 'orderedList':
        return {
          type: 'ordered-list',
          children: node.content
            ? node.content.map((listItem: any) => ({
              type: 'list-item',
              children: listItem.content?.map((p: any) => ({
                type: 'paragraph',
                children: p.content?.map((c: any) => ({
                  type: 'text',  // Add explicit type: 'text'
                  text: c.text || ''
                })) || [{ type: 'text', text: '' }]
              })) || [{ type: 'text', text: '' }]
            }))
            : []
        };

      case 'blockquote':
        return {
          type: 'blockquote',
          children: node.content
            ? node.content.flatMap((p: any) =>
              p.content?.map((c: any) => ({
                type: 'text',  // Add explicit type: 'text'
                text: c.text || ''
              })) || [{ type: 'text', text: '' }]
            )
            : [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      case 'code':
        return {
          type: 'code',
          language: node.attrs?.language || 'plaintext',
          children: [{ type: 'text', text: node.content?.[0]?.text || '' }]  // Add explicit type: 'text'
        };

      case 'image':
        return {
          type: 'image',
          url: node.attrs?.src || '',
          alt: node.attrs?.alt || '',
          children: [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      default:
        // Handle any other node types as paragraphs
        return {
          type: 'paragraph',
          children: [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };
    }
  });
  // .filter((block: any) => {
  //   // Filter out empty paragraphs (no text content)
  //   if (block.type === 'paragraph') {
  //     return block.children.some((child: any) => child.text?.trim().length > 0 || child.type === 'link');
  //   }
  //   return true;
  // });
};

const createContentAction = (contentType: string) =>
  async (values: Values, storeId?: string | number) => {

    if (['page'].includes(contentType)) {
      values.Content = JSONDocToBlocks(values.Content);
    }

    return await client.post(`/api/markket/cms?contentType=${contentType}&storeId=${storeId}`, {
      body: {
        [contentType]: values,
      },
    });
  };

const updateContentAction = (contentType: string) =>
  async (values: Values, id: string, storeId?: string | number) => {

    if (['page'].includes(contentType)) {
      values.Content = JSONDocToBlocks(values.Content);
    }

    return await client.put(`/api/markket/cms?contentType=${contentType}&storeId=${storeId}&id=${id}`, {
      body: {
        [contentType]: values,
      },
    });
  };

const commonSections = {
  initialValues: {
    SEO: {
      metaTitle: '',
      metaDescription: '',
      metaAuthor: '',
      metaKeywords: '',
    }
  },
  seo: {
    title: 'SEO Settings',
    description: 'Used to index your content, social sharing & discovery',
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
    label: 'URL Slug',
    type: 'text',
    placeholder: `my-awesome-${contentType}`,
    description: `This will be your ${contentType}'s URL path`,
    required
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
    singular: 'article',
    plural: 'articles',
    create: createContentAction('article'),
    update: updateContentAction('article'),
    form: {
      initialValues: {
        Title: '',
        Content: '',
        slug: '',
        SEO: commonSections.initialValues.SEO,
      },
      validation: {
        Title: commonSections.validations.title,
        Content: commonSections.validations.content,
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
            placeholder: 'My Awesome Article',
            required: true
          },
          commonSections.slugField('article'),
          {
            name: 'Content',
            label: 'Article Content',
            type: 'markdown',
            placeholder: 'Write your article content here...',
            required: true
          }
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
    singular: 'product',
    plural: 'products',
    create: createContentAction('product'),
    update: updateContentAction('product'),
    form: {
      initialValues: {
        Name: '',
        Description: '',
        slug: '',
        SKU: '',
        PRICES: [{
          Price: 0,
          Currency: 'USD',
          Name: 'Standard',
          Description: '',
        }],
        SEO: commonSections.initialValues.SEO,
      },
      validation: {
        Name: commonSections.validations.name,
        Description: commonSections.validations.description,
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
            placeholder: 'Premium Widget',
            required: true
          },
          commonSections.slugField('product'),
          {
            name: 'Description',
            label: 'Product Description',
            type: 'markdown',
            placeholder: 'Describe your product in detail...',
            required: true
          },
          {
            name: 'SKU',
            label: 'SKU',
            type: 'text',
            placeholder: 'PROD-001',
            description: 'Stock Keeping Unit - unique identifier for your product'
          },
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
    singular: 'event',
    plural: 'events',
    create: createContentAction('event'),
    update: updateContentAction('event'),
    form: {
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
            placeholder: 'My Awesome Event',
            required: true
          },
          commonSections.slugField('event'),
          {
            name: 'Description',
            label: 'Event Description',
            type: 'markdown',
            placeholder: 'Describe your event in detail...',
            required: true
          },
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
