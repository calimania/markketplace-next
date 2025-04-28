import { Anchor, Code, Group, Image, Text, Title, type TitleOrder } from '@mantine/core';
import { IconBrandSoundcloud, IconBrandSpotify, IconLink } from '@tabler/icons-react';


/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}


export type ContentBlock = {
  type: string;
  level?: number;
  children: Array<{
    text: string;
    type: string;
    url?: string;
    bold?: boolean;
    children?: any;
  }>
  image?: {
    url: string;
    alternativeText: string;
    size: number;
    name: string;
    ext: string;
  }
  language?: string;
};

export const ContentBlock = ({ block }: { block: ContentBlock }) => {

  switch (block.type) {
    case 'heading':
      return (
        <Title order={(block.level || 1) as TitleOrder} mt="lg" mb="md">
          {block.children.map((child, i) =>
            child.url ? (
              <Anchor key={i} href={child.url} target={child.url.startsWith('http') ? '_blank' : '_self'}>
                {child.text}
              </Anchor>
            ) : (
              child.text
            )
          )}
        </Title>
      );

    case 'paragraph':

      return (
        <div className='mb-6'>
          {block.children.map((child, i) =>
            child.url ? (
              <Group key={i} gap="xs" display="inline-flex" align="center">
                {child.url.includes('spotify') ? (
                  <IconBrandSpotify size={16} style={{ color: '#1DB954' }} />
                ) : child.url.includes('soundcloud') ? (
                  <IconBrandSoundcloud size={16} style={{ color: '#FF3300' }} />
                ) : (
                  <IconLink size={16} />
                )}
                <Anchor href={child.url} target="_blank">
                  {child?.children?.[0]?.text || 'Visit link'}
                </Anchor>
              </Group>
            ) : (
                <Text span key={i} component={child.bold ? 'strong' : 'span'} fw={child.bold ? '700' : '500'}>
                  {child.text}
                </Text>
            )
          )}
        </div>
      );

    case 'code':
      return (
        <Code block p="md" mb="md">
          {block.children.map(child => child.text).join('\n')}
        </Code>
      );

    case 'image':
      return (
        <>
          <Image radius={'sm'} src={block.image?.url} alt={block.image?.alternativeText} className='max-w-[420px]' />
          <span className='text-sm text-gray-600'>{block.image?.name} [{humanFileSize(block.image?.size as number)}]</span>
        </>
      )
    default:
      console.info('missing.block.render', { type: block.type })
      return null;
  }
};
