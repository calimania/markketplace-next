import { Container, Title, Paper } from '@mantine/core';
import { Release } from '@/app/utils/cision';
import { Store, Page } from '@/markket';

type ReleasesPageProps = {
  news: Release[];
  store?: Store;
  page?: Page;
}

export default function ReleasesPage ({news, store, page}: ReleasesPageProps) {

  return (
    <Container>
      <Title order={1}>{page?.Title || 'Chisme'}</Title>
      {news?.map((n, i: number) => {
        return (
          <div key={i}>
            <Paper withBorder>
              <Title order={2}>{n.title}</Title>
            </Paper>
          </div>
        )
      })}
      <Paper>
        <p><strong>{store?.title}</strong></p>
        <p></p>
      </Paper>
    </Container>
  );
};
