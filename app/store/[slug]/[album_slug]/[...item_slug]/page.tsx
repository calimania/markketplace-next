
type CollectionPageProps = {
  params: Promise<{
    slug: string;
    item_slug: string
    collection_slug: string
  }>;
};

const CollectionPage = async ({params}: CollectionPageProps) => {
  const { slug, collection_slug, item_slug } = await params;

  return (
    <div>
      <h1>Collection Page</h1>
      <p>Slug: {slug}</p>
      <p>Collection Slug: {collection_slug}</p>
      <p>Item Slug: {item_slug}</p>
    </div>
  );
};

export default CollectionPage;
