import type { Meta, StoryObj } from '@storybook/react';
import PageContent from '@/app/components/ui/page.content';
import { ContentBlock, Page } from '@/markket/page';


const meta: Meta<typeof PageContent> = {
  title: 'Components/PageContent',
  component: PageContent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PageContent>;

const mockContent: ContentBlock[] = [
  {
    type: 'heading',
    level: 1,
    children: [{ text: '🎨 Rich Content Demo', type: 'text' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Welcome to our styled content blocks demonstration!', type: 'text' }],
  },
  {
    type: 'heading',
    level: 2,
    children: [{ text: '📝 Text Formatting', type: 'text' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'This is a regular paragraph with ', type: 'text' },
      { text: 'bold text', type: 'text', bold: true },
      { text: ' and a ', type: 'text' },
      { url: 'https://markket.place', type: 'link', children: [{ text: 'hyperlink', type: 'text' }] },
      { text: '.', type: 'text' },
    ],
  },
  {
    type: 'heading',
    level: 3,
    children: [{ text: '📋 Lists Example', type: 'text' }],
  },
  {
    type: 'list',
    children: [
      {
        type: 'list-item',
        children: [{ text: 'First item with custom bullet', type: 'text' }],
      },
      {
        type: 'list-item',
        children: [{ text: 'Second item with hover effect', type: 'text' }],
      },
      {
        type: 'list-item',
        children: [{ text: 'Third item showing nested content:', type: 'text' }],
      },
    ],
  },
  {
    type: 'heading',
    level: 3,
    children: [{ text: '🖼️ Image Examples', type: 'text' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'link',
        url: 'https://markketplace.nyc3.digitaloceanspaces.com/uploads/d4ac974e47b0d0cd321823235da6d4eb.png',
        children: [{ text: 'Sample Image 1', type: 'text' }],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'link',
        url: 'https://markketplace.nyc3.digitaloceanspaces.com/uploads/7ae58c70fd18894170158d804840754a.png',
        children: [{ text: 'Sample Image 2', type: 'text' }],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    params: {
      page: {
        Content: mockContent,
        Title: 'Sample Page',
        Active: true,
        slug: 'sample',
      } as Page,
    },
  },
};

export const WithoutImages: Story = {
  args: {
    params: {
      page: {
        Content: mockContent.filter(block =>
          !(block.type === 'paragraph' &&
            block.children[0]?.type === 'link' &&
            block.children[0]?.url?.match(/\.(jpg|jpeg|png|gif)$/i)
          )
        ),
        Title: 'Text Only Content',
        Active: true,
        slug: 'text-only',
      } as Page,
    },
  },
};

export const OnlyImages: Story = {
  args: {
    params: {
      page: {
        Content: [
          {
            type: 'heading',
            level: 2,
            children: [{ text: 'Image Gallery', type: 'text' }],
          },
          ...mockContent.filter(block =>
            block.type === 'paragraph' &&
            block.children[0]?.type === 'link' &&
            block.children[0]?.url?.match(/\.(jpg|jpeg|png|gif)$/i)
          ),
        ],
        Title: 'Image Gallery',
        Active: true,
        slug: 'gallery',
      } as Page,
    },
  },
};
