const ViewArticle = () => {
  return (
    <div>
      <h1>View Article</h1>
      <p>This is the view article component.</p>
    </div>
  );
};

const ActionComponents = {
  view: ViewArticle,
  edit : () => <div>Edit Article</div>,
};

export default function ArticleActions({ action, id }: { action: string, id: string }) {
  const ActionComponent = ActionComponents[action as keyof typeof ActionComponents];

  if (!ActionComponent) {
    return <div>Action not found</div>;
  }

  return (
    <div>
      <h1>{action} Article</h1>
      <p>Article ID: {id}</p>
      <ActionComponent />
    </div>
  );
}