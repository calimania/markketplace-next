import { ContentTypes, Store } from "@/markket"
import { Group, Tooltip, ScrollArea, Text, Title, Button, Stack, Box } from '@mantine/core';
import { useState } from 'react';
import ImageModal from './image.modal';
import { markketClient } from "@/markket/api.markket";

export type ImageManagerProps = {
  item?: ContentTypes,
  store: Store,
  singular: string;
  refresh?: () => null;
}

const PLACEHOLDER = 'https://markketplace.nyc3.digitaloceanspaces.com/uploads/4dd22c1b57887fe28307fb4784c974bb.png';

// Allow any string key for image config, and each property can have a 'multi' boolean
const map: Record<string, Record<string, { multi?: boolean, max_width?: number }>> = {
  'store': {
    Logo: {
      max_width: 1200,
    },
    Slides: { multi: true , max_width: 1600, },
    Favicon: { max_width: 64 },
    'SEO.socialImage': {
      max_width: 1200,
    },
    Cover: {
      max_width: 1280,
    },
    // Thumbnail: {},
  }
};


const upload = (documentid: string, kind?: string) => {

  return async (path: string, img: File, multiIndex?: number) => {
    console.log(`uploading:${kind}`, { path, img, multiIndex });

    await markket.uploadImage(img, path, documentid);
  }
}

const markket = new markketClient();

// Fix actions type and add onToggleMode prop to ImageModal
const actions: Record<string, (documentId: string) => { upload: (path: string, img: any, multiIndex?: number) => Promise<void> } > = {
  store: (documentId) => {
    return ({
      upload: upload(documentId, 'store'),
    })
  },
};

const THUMB_SIZE = 96;

// Helper to get nested value by path (e.g., 'SEO.socialImage')
function getNested(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const ImageManager = ({ singular, item, refresh  }: ImageManagerProps) => {
  const config = map[singular] || {};

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
    <div style={{ width: '100%' }}>
      <Title order={3} className="font-black text-fuchsia-700 mb-4">{singular.charAt(0).toUpperCase() + singular.slice(1)} Images</Title>
      <Stack gap="xl">
        {/* Single image types */}
        <Group gap="xl" align="flex-start">
          {singleKeys.map((key) => {
            const img = getNested(item, key);
            const maxW = config[key]?.max_width && config[key].max_width < THUMB_SIZE ? config[key].max_width : THUMB_SIZE;
            const src = img && typeof img === 'object' && img.url ? img.url : PLACEHOLDER;
            const alt = img && typeof img === 'object' && img.alt ? img.alt : '';

            return (
              <Box key={key} style={{ textAlign: 'center', minWidth: maxW }}>
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
                    onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: 'preview' })}
                  />
                </Tooltip>
                <Text className="font-extrabold text-fuchsia-600 mt-1 text-center text-xs tracking-wide rounded-lg px-2 py-1 bg-fuchsia-50 border-2 border-fuchsia-200 shadow-sm inline-block">
                  {key.replace('SEO.socialImage', 'Social Share Image')}
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  color="fuchsia"
                  className="mt-1 border-2 border-fuchsia-300 font-bold text-fuchsia-700 hover:bg-fuchsia-100"
                  onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: 'replace' })}
                >
                  Edit Image
                </Button>
              </Box>
            );
          })}
        </Group>
        {/* Multi-image types */}
        {multiKeys.map((key) => {
          const imgs = Array.isArray(getNested(item, key)) ? getNested(item, key) : [];
          return (
            <Box key={key} style={{ textAlign: 'center', width: '100%' }}>
              <Text className="font-extrabold text-blue-700 mb-1 text-center text-xs tracking-wide rounded-lg px-2 py-1 bg-blue-50 border-2 border-blue-200 shadow-sm inline-block">{key}</Text>
              <ScrollArea type="auto" offsetScrollbars>
                <Group gap="md" align="center" wrap="nowrap">
                  {(imgs.length > 0 ? imgs : [null]).map((img: any, i: number) => {
                    const src = img && img.url ? img.url : PLACEHOLDER;
                    const alt = img && img.alt ? img.alt : `${key} #${i + 1}`;
                    return (
                      <Box key={key + i} style={{ textAlign: 'center' }}>
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
                              cursor: 'pointer',
                              transition: 'transform 0.1s',
                            }}
                            onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: 'preview', multiIndex: i })}
                          />
                        </Tooltip>
                        <Text className="font-extrabold text-blue-700 mt-1 text-center text-xs tracking-wide rounded-lg px-2 py-1 bg-blue-50 border-2 border-blue-200 shadow-sm inline-block">
                          {key} #{i + 1}
                        </Text>
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          className="mt-1 border-2 border-blue-300 font-bold text-blue-700 hover:bg-blue-100"
                          onClick={() => setModalState({ open: true, key, url: src, alt, maxWidth: config[key]?.max_width, mode: 'replace', multiIndex: i })}
                        >
                          Edit Image
                        </Button>
                      </Box>
                    );
                  })}
                </Group>
              </ScrollArea>
            </Box>
          );
        })}
      </Stack>
      {console.log({modalState})}
      <ImageModal
        imageModalOpen={modalState.open}
        handleCloseModal={() => setModalState({ open: false })}
        imageUrl={modalState.url}
        imageAlt={modalState.alt}
        maxWidth={modalState.maxWidth}
        mode={modalState.mode}
        onReplace={async ({url, img, alt}: { url?: string, img?: File, alt?: string}) => {

          console.log('replacing', { url, img, alt, })
          if (!modalState.key) return setModalState({ open: false });

          if (url) {
            // PUT request to replace image in the singular record
          } else {
            await actions[singular](item.id).upload(modalState.key, img, modalState.multiIndex);
          }
          setTimeout(()=> {
            console.log(`timeout:refresh:${!!refresh}`);

            if (refresh) refresh();
            setModalState({ open: false });
          }, 1 * 1000);
        }}
        onInsert={() => setModalState({ open: false })}
        onToggleMode={() => setModalState((s) => ({ ...s, mode: s.mode === 'preview' ? 'replace' : 'preview' }))}
      />
    </div>
  );
}

export default ImageManager;
