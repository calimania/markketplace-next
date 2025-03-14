
type CollectionPageProps = {
  params: Promise<{
    slug: string;
    collection_slug: string
  }>;
};

const CollectionPage = async ({params}: CollectionPageProps) => {
  const { slug, collection_slug } = await params;

  return (
    <div>
      <h1>Collection Page</h1>
      <p>Slug: {slug}</p>
      <p>Collection Slug: {collection_slug}</p>
    </div>
  );
};

export default CollectionPage;
