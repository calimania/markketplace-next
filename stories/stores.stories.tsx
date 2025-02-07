import { DocsGrid } from '../app/components/docs/grid';

export default {
  title: 'Components/DocsGrid',
  component: DocsGrid,
};

export const Default = {
  args: {
    posts: [
      {
        id: 1,
        title: 'Demo Store',
        slug: 'demo',
        Description: 'A demo store',
        Logo: {
          data: {
            attributes: {
              url: 'https://placehold.co/600x400'
            }
          }
        }
      }
    ]
  }
};
