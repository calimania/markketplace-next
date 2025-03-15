import { Store } from "@/markket/store";
import { Album } from "@/markket/album";
import { Container, Group, Text, Paper } from "@mantine/core";
import { IconHomeHeart, IconPhotoStar } from '@tabler/icons-react';
import Link from 'next/link';

type AlbumNavProps = {
  album?: Album;
  store: Store;
};

const AlbumNav = ({ album, store }: AlbumNavProps) => {

  return (
    <Container size="lg" className="mt-18 mb-9">
      <Paper>
        {album?.title && (
          <Group align="center" mt="lg" mb="lg">
            <IconPhotoStar size={24} color='#e1016d' />
            <Text size="lg" fw={500} ml="sm" className='text-color-markket-pink'>
              <Link href={`/store/${store.slug}/${album.slug}`}>Back to {album.title}</Link>
            </Text>
          </Group>
        )}
        <Group align="center" mt="lg" mb="lg">
          <IconHomeHeart size={24} color='#e1016d' />
          <Text size="lg" fw={500} ml="sm" className='text-color-markket-pink'>
            <Link href={`/store/${store.slug}`}>Back to {store.title}</Link>
          </Text>
        </Group>
      </Paper>
    </Container>
  )
};

export default AlbumNav;
