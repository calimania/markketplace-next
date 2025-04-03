import { Anchor, Code, Group, Text, Title , type TitleOrder} from '@mantine/core';
import { IconBrandSoundcloud, IconBrandSpotify, IconLink } from '@tabler/icons-react';

export type ContentBlock = {
  type: string;
  level?: number;
  children: Array<{
    text: string;
    type: string;
    url?: string;
  }>;

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
      if (!block.children.some(child => child.text || child.url)) return null;
      return (
        <div>
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
                  {child.text || 'Visit link'}
                </Anchor>
              </Group>
            ) : (
                <Text key={i} component="p" >
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

    default:
      return null;
  }
};
