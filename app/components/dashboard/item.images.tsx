import { useState } from 'react';
import {
  Group,
  Text,
  Badge,
  SimpleGrid,
  Card,
  Image,
  Modal,
  ActionIcon,
  Tooltip,
  rem,
} from '@mantine/core';
import { ContentType, } from '@/app/hooks/common';
import { Media, Product } from '@/markket';
import { IconMaximize, IconDownload, IconPhoto } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';

type Name = 'Cover' | 'cover' | 'Logo' | 'Favicon' | 'Slides' | 'socialImage' | 'Thumbnail' | 'image' | 'images' | 'photo' | 'photos' | 'picture' | 'pictures' | 'media' | 'SEO.socialImage';


interface ImageCardProps {
  image: Media;
  onView: (image: Media) => void;
  name?: string;
}

const ImageCard = ({ image, onView, name }: ImageCardProps) => (
  <Card shadow="sm" padding="sm" radius="md" withBorder className={`max-w-[300px] relative`}>
    <Card.Section>
      <Image
        src={image?.formats?.thumbnail?.url || image.url}
        height={180}
        alt={image.alternativeText || ''}
        style={{ objectFit: 'cover' }}
      />
      <div
        className="absolute top-2 right-2 flex gap-2"
        style={{ zIndex: 2 }}
      >
        <span className="text-white">{name}</span>
        <Tooltip label="View full size">
          <ActionIcon
            variant="light"
            onClick={() => onView(image)}
            className="bg-white/80 hover:bg-white"
          >
            <IconMaximize size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Download">
          <ActionIcon
            variant="light"
            component="a"
            href={image.url}
            download
            target="_blank"
            className="bg-white/80 hover:bg-white"
          >
            <IconDownload size={16} />
          </ActionIcon>
        </Tooltip>
      </div>
    </Card.Section>

    <Text size="sm" c="dimmed" mt="sm">
      {image.alternativeText || image.caption || 'No description'}
    </Text>

    <Group mt="xs">
      <Badge size="sm">
        {image.formats?.thumbnail ? 'Has thumbnail' : 'Original only'}
      </Badge>
      <Badge size="sm" color="blue">
        {(image.size / 1024).toFixed(0)}KB
      </Badge>
    </Group>
  </Card>
);

export default function DashboardItemImages({
  item,
  name,
  multiple
}: {
  item: ContentType & Record<Name, Media | Media[]>,
  name: Name,
  multiple?: boolean
}) {
  const [viewingImage, setViewingImage] = useState<Media | null>(null);
  let image = item[name] as Media;
  let images: Media[] = [];
  let displayName: string = name || 'Image';

  if (name == 'SEO.socialImage') {
    image = (item as any as Product)?.SEO?.socialImage as Media;
    displayName = 'Social Image';
  }

  if (Array.isArray(item[name])) {
    images = item[name] as Media[];
    image = images[0];
  }

  if (!image?.url) {
    return null;
  }

  if (multiple && images.length > 0) {
    return (
      <>
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconPhoto size={20} color="magenta" />
            <Text fw={500} size="lg" >
              {name || 'Images'}
            </Text>
          </Group>
          <Badge size="lg">
            {images.length} images
          </Badge>
        </Group>

        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing="md"
        >
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onView={setViewingImage}
            />
          ))}
        </SimpleGrid>

        <Modal
          opened={!!viewingImage}
          onClose={() => setViewingImage(null)}
          size="xl"
          padding="md"
          centered
        >
          {viewingImage && (
            <Carousel
              withIndicators
              height={rem(600)}
              initialSlide={images.findIndex(img => img.id === viewingImage.id)}
              styles={{
                indicator: {
                  width: rem(12),
                  height: rem(4),
                  transition: 'width 250ms ease',
                  '&[data-active]': {
                    width: rem(40),
                  },
                },
              }}
            >
              {images.map((img) => (
                <Carousel.Slide key={img.id}>
                  <Image
                    src={img.url}
                    alt={img.alternativeText || ''}
                    height={rem(600)}
                    fit="contain"
                  />
                </Carousel.Slide>
              ))}
            </Carousel>
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="md" mt="md">
        <Group gap="xs">
          <IconPhoto size={20} color="magenta" />
          <Text fw={500} size="lg">
            {displayName}
          </Text>
        </Group>
      </Group>

      <ImageCard
        image={image}
        name={name}
        onView={setViewingImage}
      />

      <Modal
        opened={!!viewingImage}
        onClose={() => setViewingImage(null)}
        size="xl"
        padding="md"
        centered
      >
        {viewingImage && (
          <Image
            src={viewingImage.url}
            alt={viewingImage.alternativeText || ''}
            fit="contain"
            height={rem(600)}
          />
        )}
      </Modal>
    </>
  );
}
