import { ContentTypes, Store } from "@/markket"
import { Group, Tooltip, Paper, Text, Title, Button, Stack, Box, Modal } from '@mantine/core';
import { useState } from 'react';
import ImageModal from './image.modal';
import { IconCactus, IconCameraPlus, IconTrash } from "@tabler/icons-react";

import { ImageConfig, ImageActions } from './item.image.config';

import { updateContentAction, } from '@/markket/action.helpers';
import { markketConfig } from "@/markket/config";

export type ImageManagerProps = {
  item?: ContentTypes,
  store: Store,
  singular: string;
  refresh?: () => null;
}

const PLACEHOLDER = markketConfig.blank_image_url;

const map = ImageConfig;
const actions = ImageActions;

const THUMB_SIZE = 96;

// Helper to get nested value by path (e.g., 'SEO.socialImage')
function getNested(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const ImageManager = ({ store, singular, item, refresh }: ImageManagerProps) => {
  const config = map[singular as 'store'] || {};
  const [modalState, setModalState] = useState<{
    open: boolean;
    key?: string;
    url?: string;
    alt?: string;
    maxWidth?: number;
    mode?: 'preview' | 'replace';
    multiIndex?: number;
    disableReplace?: boolean;
  }>({ open: false });
  const [confirmState, setConfirmState] = useState<{ open: boolean, key?: string, imgId?: string | number, index?: number }>({ open: false });

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
        {multiKeys.map((key) => {
          const imgs = Array.isArray(getNested(item, key)) ? getNested(item, key) : [];

          return (
            <Box key={key}>
              <Text className="font-extrabold text-blue-700 mb-1 tracking-wide rounded-lg px-2 py-1">
                {key}
              </Text>
              <Group gap="md" align="center" wrap="wrap" style={{ width: '100%', flexWrap: 'wrap' }}>
                {(imgs.length > 0 ? [...imgs, {}] : [{}]).map((img: any, i: number) => {
                  if (i >= 5) { return <span key={key + i} /> }

                  const src = img && img.url ? img.url : PLACEHOLDER;
                  const alt = img && img.alternativeText ? img.alternativeText : `${key} #${i + 1}`;

                  return (
                    <Box key={key + i} style={{ textAlign: 'center', minWidth: THUMB_SIZE + 8, maxWidth: 140, boxSizing: 'border-box', overflow: 'hidden', marginBottom: 8 }}>
                      <Group>
                        {img?.url ? (
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            className="mt-1 border-2 border-red-300 font-bold text-red-700 hover:bg-red-100"
                            onClick={() => setConfirmState({ open: true, key, imgId: img.id, index: i })}
                            title="Remove image"
                          >
                            <IconTrash size={18} />
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="light"
                            color="blue"
                            className={`mt-1 border-2 border-blue-300 font-bold text-blue-700 hover:bg-blue-100 `}
                            onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: (img?.url ? 'preview' : 'replace'), multiIndex: i })}
                          >
                            <IconCameraPlus size={18} color={`#db2777`} />
                          </Button>
                        )}
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
                            width: THUMB_SIZE * 1.1,
                            objectFit: 'cover',
                            borderRadius: 16,
                            border: '4px solid #38bdf8',
                            boxShadow: '3px 3px 0 #000',
                            background: '#fff',
                            marginRight: 8,
                            cursor: config[key].can_change == false ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.1s',
                            maxWidth: 120,
                          }}
                          onClick={() => (config[key].can_change != false) && setModalState({ disableReplace: img.url, open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: (img?.url ? 'preview' : 'replace'), multiIndex: i })}
                        />
                      </Tooltip>
                    </Box>
                  );
                })}
              </Group>
            </Box>
          );
        })}
      </Stack>

      <Modal opened={confirmState.open} onClose={() => setConfirmState({ open: false })} title="Remove Image?" centered>
        <Text mb="md">Are you sure you want to remove this image? This cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmState({ open: false })}>Cancel</Button>
          <Button color="red" onClick={async () => {
            if (!confirmState.key || confirmState.index === undefined) return setConfirmState({ open: false });
            const imgs = Array.isArray(getNested(item, confirmState.key)) ? getNested(item, confirmState.key) : [];
            const newImgs = imgs.filter((img: any, idx: number) => idx !== confirmState.index);

            await updateContentAction(singular as ContentTypes)({
              ...item,
              [confirmState.key]: newImgs
            }, item?.documentId, store?.documentId);
            setConfirmState({ open: false });
            if (refresh) refresh();
          }}>Remove</Button>
        </Group>
      </Modal>

      <ImageModal
        imageModalOpen={modalState.open}
        handleCloseModal={() => setModalState({ open: false })}
        imageUrl={modalState.url}
        imageAlt={modalState.alt}
        maxWidth={modalState.maxWidth}
        mode={modalState.mode}
        disableReplace={modalState.disableReplace}
        onReplace={async ({ url, img, alt }: { url?: string, img?: File, alt?: string }) => {
          if (!modalState.key) return setModalState({ open: false });
          if (url) {
            // Image Modal loads URL into Canvas and uploads as file
          } else {
            await actions[singular](item).upload(modalState.key, img, alt || modalState.key, modalState.multiIndex);
            if (refresh) refresh();
          }

          setTimeout(() => {
            setModalState({ open: false });
          }, 300);
        }}
        onInsert={() => setModalState({ open: false })}
        onToggleMode={() => setModalState((s) => ({ ...s, mode: s.mode === 'preview' ? 'replace' : 'preview' }))}
      />
    </Paper>
  );
}

export default ImageManager;
