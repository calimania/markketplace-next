import { StoreGrid } from '../app/components/stores/grid';

export default {
  title: 'Components/StoreGrid',
  component: StoreGrid,
};

export const Default = {
  args: {
    stores: [
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
