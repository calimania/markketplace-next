import { Paper,  } from '@mantine/core';
import { ContentType } from '@/app/hooks/common';
import { Media } from '@/markket';

type Name = 'Cover' | 'cover' | 'Logo' | 'Favicon' | 'Slides' | 'socialImage' | 'thumbnail' | 'image' | 'images' | 'photo' | 'photos' | 'picture' | 'pictures';

export default function DashboardItemImages  ({item, name , multiple }: { item: ContentType & Record<Name, Media | Media[]>, name: Name, multiple?: boolean})  {


  let image = item[name] as Media;
  let images;

  if (Array.isArray(image)) {
    image = image[0];
  }

  if (!image?.url) {
    return null;
  }

  if (multiple) {
    images = item[name] as Media[];

    return (
      <>
        <h3>{name || 'Image'}</h3>


          <Paper
            key={image?.id}
            withBorder
            p="sm"
            radius="md"
            mt="sm"
            className="prose max-w-none content-wrapper "
            style={{
              backgroundColor: 'var(--mantine-color-gray-0)',
            }}
          >
            {images?.map((image) => (
              <>
                <a href={image?.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={image?.formats?.thumbnail?.url || image.url }
                    alt={image.alternativeText || ''}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      right: '0',
                    }}
                  />
                </a>
              </>
            ))}
          </Paper>

      </>
    )
  }

  console.log({ image, name})

  return (
    <>
      <h3>{name || 'Image'}</h3>

      {(image?.url) && (
        <Paper
          key={image?.id}
          withBorder
          p="sm"
          radius="md"
          mt="sm"
          className="prose max-w-none content-wrapper "
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          <a href={image?.url} target="_blank" rel="noopener noreferrer">
            <img
              src={image?.formats?.thumbnail?.url || image.url }
              alt={image?.alternativeText || ''}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                right: '0',
              }}
            />
          </a>
        </Paper>
      )}
    </>
  )
};
