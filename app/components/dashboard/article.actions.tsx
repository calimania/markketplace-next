import { useState, useEffect } from 'react';
import { Article } from '@/markket';
import { markketConfig } from '@/markket/config';

const ViewArticle = ({ article }: { article: Article }) => {
  return (
    <div>
      <h1>View Article</h1>
      {article?.Title}
      <p>This is the view article component.</p>
    </div>
  );
};


const EditArticle = ({ article }: { article: Article }) => {
  return (
    <div>
      <h1>View Article</h1>
      {article?.Title}
      <p>This is the view article component.</p>
    </div>
  );
};


const ActionComponents = {
  view: ViewArticle,
  edit: EditArticle,
};

export default function ArticleActions({ action, id }: { action: string, id: string }) {
  const ActionComponent = ActionComponents[action as keyof typeof ActionComponents];

  const [data, setData] = useState<Article>({} as Article);

  useEffect(() => {
    const fetchData = async (_id: string) => {
      const response = await fetch(`/api/markket?path=/api/articles/${_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json();


      console.log('fetching data', id, json);
    };

    if (id) {
      fetchData(id);
    }
  }, [id]);

  if (!ActionComponent) {
    return <div>Action not found</div>;
  }

  return (
    <div>
      <h1>{action} Article</h1>
      <p>Article ID: {id}</p>
      <ActionComponent article={data} />
    </div>
  );
}
