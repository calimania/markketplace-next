import { ContentTypes, Store } from "@/markket"
import { Group, Tooltip, ScrollArea, Paper, Text, Title, Button, Stack, Box } from '@mantine/core';
import { useState } from 'react';
import ImageModal from './image.modal';
import { IconCactus, IconCameraPlus } from "@tabler/icons-react";

import { ImageConfig, ImageActions } from './item.image.config';

export type ImageManagerProps = {
  item?: ContentTypes,
  store: Store,
  singular: string;
  refresh?: () => null;
}

const PLACEHOLDER = 'https://markketplace.nyc3.digitaloceanspaces.com/uploads/4dd22c1b57887fe28307fb4784c974bb.png';

const map = ImageConfig;
const actions = ImageActions;

const THUMB_SIZE = 96;

// Helper to get nested value by path (e.g., 'SEO.socialImage')
function getNested(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const ImageManager = ({ singular, item, refresh  }: ImageManagerProps) => {
  const config = map[singular as 'store'] || {};

  const [modalState, setModalState] = useState<{
    open: boolean;
    key?: string;
    url?: string;
    alt?: string;
    maxWidth?: number;
    mode?: 'preview' | 'replace';
    multiIndex?: number;
  }>({ open: false });

  // Separate single and multi image keys
  const singleKeys = Object.keys(config).filter(k => !config[k]?.multi && k !== 'Slides');
  const multiKeys = Object.keys(config).filter(k => config[k]?.multi || k === 'Slides');

  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Group>
        <IconCactus size={18} color={`#c026d3`} />
        <Title order={3} className="font-black text-fuchsia-700 mb-4">
          Images
        </Title>
      </Group>
      <Stack gap="xl">
        <Group gap="xl" align="flex-start">
          {singleKeys.map((key) => {
            const img = getNested(item, key);
            const maxW = config[key]?.max_width && config[key].max_width < THUMB_SIZE ? config[key].max_width : THUMB_SIZE;
            const src = img && typeof img === 'object' && img.url ? img.url : PLACEHOLDER;
            const alt = img && typeof img === 'object' && img.alternativeText ? img.alternativeText : '';

            return (
              <Box key={key} style={{ textAlign: 'center', minWidth: maxW, }}>
                <Group>
                  <Button
                    size="xs"
                    variant="light"
                    color="fuchsia"
                    className="border-2 border-fuchsia-400 font-bold text-fuchsia-700 hover:bg-fuchsia-100 mr-1 mb-2 mt-2"
                    onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: 'replace' })}
                  >
                    <IconCameraPlus size={18} color={`#db2777`} />
                  </Button>
                  <Text className="text-left">{key.replace('SEO.socialImage', 'Socials')}</Text>
                </Group>
                <Tooltip label={key}>
                  <img
                    src={src}
                    alt={alt}
                    style={{
                      height: maxW,
                      width: maxW,
                      objectFit: 'cover',
                      borderRadius: 16,
                      border: '4px solid #e879f9',
                      boxShadow: '3px 3px 0 #000',
                      background: '#fff',
                      marginBottom: 8,
                      cursor: 'pointer',
                      transition: 'transform 0.1s',
                    }}
                    onClick={() =>
                      setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: (img?.url ? 'preview' : 'replace') })
                    }
                  />
                </Tooltip>
              </Box>
            );
          })}
        </Group>
        {/* Multi-image types */}
        {multiKeys.map((key) => {
          const imgs = Array.isArray(getNested(item, key)) ? getNested(item, key) : [];

          return (
            <Box key={key} style={{ width: '100%' }}>
              <Text className="font-extrabold text-blue-700 mb-1 tracking-wide rounded-lg px-2 py-1">
                {key}
              </Text>
              <ScrollArea type="auto" offsetScrollbars>
                <Group gap="md" align="center" wrap="nowrap">
                  {(imgs.length > 0 ? [...imgs, {}] : [{}]).map((img: any, i: number) => {
                    const src = img && img.url ? img.url : PLACEHOLDER;
                    const alt = img && img.alternativeText ? img.alternativeText : `${key} #${i + 1}`;
                    return (
                      <Box key={key + i} style={{ textAlign: 'center' }}>
                        <Group>
                          {config[key].can_change != false && (<Button
                            size="xs"
                            variant="light"
                            color="blue"
                            className={`mt-1 border-2 border-blue-300 font-bold text-blue-700 hover:bg-blue-100 `}
                            onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: (img?.url ? 'preview' : 'replace'), multiIndex: i })}
                          >
                            <IconCameraPlus size={18} color={`#db2777`} />
                          </Button>)}
                          <Text className="text-left font-extrabold text-blue-700 mt-1 text-xs tracking-wide rounded-lg px-2 py-1 inline-block">
                            #{i + 1}
                          </Text>
                        </Group>
                        <Tooltip label={`${key} #${i + 1}`}>
                          <img
                            src={src}
                            alt={alt}
                            style={{
                              height: THUMB_SIZE,
                              width: THUMB_SIZE,
                              objectFit: 'cover',
                              borderRadius: 16,
                              border: '4px solid #38bdf8',
                              boxShadow: '3px 3px 0 #000',
                              background: '#fff',
                              marginRight: 12,
                              cursor: config[key].can_change == false ? 'not-allowed' : 'pointer',
                              transition: 'transform 0.1s',
                            }}
                            onClick={() => (config[key].can_change != false) && setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: (img?.url ? 'preview' : 'replace'), multiIndex: i })}
                          />
                        </Tooltip>
                      </Box>
                    );
                  })}
                </Group>
              </ScrollArea>
            </Box>
          );
        })}
      </Stack>
      <ImageModal
        imageModalOpen={modalState.open}
        handleCloseModal={() => setModalState({ open: false })}
        imageUrl={modalState.url}
        imageAlt={modalState.alt}
        maxWidth={modalState.maxWidth}
        mode={modalState.mode}
        onReplace={async ({ url, img, alt }: { url?: string, img?: File, alt?: string }) => {
          if (!modalState.key) return setModalState({ open: false });

          if (url) {
            // @TODO: PUT request to replace image in the singular record
          } else {
            await actions[singular](item).upload(modalState.key, img, alt || modalState.key, modalState.multiIndex);
            if (refresh) refresh();
          }

          setTimeout(() => {
            setModalState({ open: false });
          }, 100);
        }}
        onInsert={() => setModalState({ open: false })}
        onToggleMode={() => setModalState((s) => ({ ...s, mode: s.mode === 'preview' ? 'replace' : 'preview' }))}
      />
    </Paper>
  );
}

export default ImageManager;
