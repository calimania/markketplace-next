import { Collection } from '@/markket/collection.d';

type CollectionListProps = {
  collections: Collection[];
};

export default function CollectionList({ collections }: CollectionListProps) {
  const list = (collections || []);

  return (
    <div>
      {list.map((collection) => (
        <div key={collection.id}>
          <h2>{collection.title}</h2>
          <p>{collection.description}</p>
        </div>
      ))}
    </div>
  );
};
