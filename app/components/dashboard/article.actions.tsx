import { useState, useEffect } from 'react';
import { Article } from '@/markket';
import ViewArticle from '@/app/components/dashboard/article.view';
import Link from 'next/link';
import { IconChevronCompactLeft } from '@tabler/icons-react';
import { Group } from '@mantine/core';

const EditArticle = ({ article }: { article: Article }) => {
  return (
    <div>
      <h1>Edit Article</h1>
      {article?.Title}
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
      const response = await fetch(`/api/markket?path=/api/articles/${_id}?populate[]=SEO&populate[]=SEO.socialImage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json();

      setData(json?.data as Article);
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
      <Link href="/dashboard/articles" className='text-blue-700'>
        <Group className='mb-4' align="center">
          <IconChevronCompactLeft size={16} />
          <span> Back to Articles</span>
        </Group>
      </Link>
      <ActionComponent article={data} />
    </div>
  );
}
