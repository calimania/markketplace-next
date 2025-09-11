import { useState, useEffect } from 'react';
import {
  Modal, Stack, SegmentedControl, Paper, Text, Center, Loader, TextInput, Button, Group, FileButton, Progress, ActionIcon, Box, Image as MantineImage
} from '@mantine/core';
import { IconLink, IconUpload, IconFileUpload, IconX, IconPhotoPlus, IconDownload, IconSparkles } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import { useMediaQuery } from '@mantine/hooks';
import { markketplace } from '@/markket/config';

const PLACEHOLDER = markketplace.blank_image_url;

type ImageModalProps = {
  imageModalOpen: boolean;
  handleCloseModal: () => void;
  imageUrl?: string;
  imageAlt?: string;
  maxWidth?: number;
  onReplace?: (img: { url: string; alt: string , img?: File }) => void;
  onInsert?: (img: { url: string; alt: string }) => void;
  mode?: 'preview' | 'replace';
  onToggleMode?: () => void;
  disableReplace?: boolean;
};

const ImageModal = ({
  imageModalOpen,
  handleCloseModal,
  imageUrl: initialImageUrl = '',
  imageAlt: initialImageAlt = '',
  maxWidth,
  onReplace,
  mode = 'preview',
  onToggleMode,
  disableReplace = false, // NEW PROP
}: ImageModalProps) => {
  const [imageUploadOption, setImageUploadOption] = useState<'url' | 'upload'>('upload');
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imageAlt, setImageAlt] = useState(initialImageAlt);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    if (imageModalOpen) {
      setImageUrl(initialImageUrl);
      setImageAlt(initialImageAlt);
      setPreviewUrl('');
      setUploadProgress(0);
      setImageFile(null);
    }
  }, [imageModalOpen, initialImageUrl, initialImageAlt]);

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function (e) {

      const image = new Image();

      image.src = e.target?.result as string;

      image.onload = async function () {
        const height = (this as HTMLImageElement).height;
        const width = (this as HTMLImageElement).width as number;

        if (maxWidth && width > maxWidth) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')
          const ratio = maxWidth / (width < 1 ? 1 : width);
          canvas.width = width * ratio + .5 | 0
          canvas.height = height * ratio + .5 | 0
          canvas.style.display = 'none';
          ctx?.drawImage(image, 0, 0, canvas.width, canvas.height)
          document.body.appendChild(canvas)
          const blob: Blob = await new Promise(rs => canvas.toBlob(rs as any, '1'));
          const resizedFile = new File([blob], file.name, file)
          setImageFile(resizedFile);
          setPreviewUrl(URL.createObjectURL(resizedFile));
        } else {
          setImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      };
    };
  };

  // Helper to load/process image from URL
  const handleLoadFromUrlProxy = async (proxyUrl: string) => {
    setUrlError(null);

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = proxyUrl;
      img.onload = async function () {
        const width = img.width;
        const height = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (maxWidth && width > maxWidth) {
          const ratio = maxWidth / (width < 1 ? 1 : width);
          canvas.width = width * ratio + .5 | 0;
          canvas.height = height * ratio + .5 | 0;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob>(rs => canvas.toBlob(rs as any, 'image/png'));
          const file = new File([blob], 'unsplash-image.png', { type: 'image/png' });
          setImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        } else {
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0);
          const blob = await new Promise<Blob>(rs => canvas.toBlob(rs as any, 'image/png'));
          const file = new File([blob], 'unsplash-image.png', { type: 'image/png' });
          setImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
        setImageUploadOption('upload');
      };
      img.onerror = () => {
        setUrlError('Could not load Unsplash image.');
      };
    } catch {
      setUrlError('Could not load Unsplash image.');
    }
  };

  /** When the input has keywords, pull from the unsplash endpoint */
  const handleRandomUnsplash = async () => {
    setUnsplashLoading(true);
    setUrlError(null);

    try {
      const query = imageUrl && !/^https?:\/\//.test(imageUrl) ? imageUrl : '';

      const endpoint = query
        ? `/api/markket/img?action=unsplash&query=${encodeURIComponent(query)}`
        : '/api/markket/img?action=unsplash';
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.urls && data.urls.length > 0) {
        // Use Unsplash image URL directly (no proxy needed)
        const url = data.urls[Math.floor(Math.random() * data.urls.length)];
        setImageUrl(url);
        // Load as preview (simulate upload)
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = async function () {
          const width = img.width;
          const height = img.height;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (maxWidth && width > maxWidth) {
            const ratio = maxWidth / (width < 1 ? 1 : width);
            canvas.width = width * ratio + .5 | 0;
            canvas.height = height * ratio + .5 | 0;
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob>(rs => canvas.toBlob(rs as any, 'image/png'));
            const file = new File([blob], 'unsplash-image.png', { type: 'image/png' });
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          } else {
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0);
            const blob = await new Promise<Blob>(rs => canvas.toBlob(rs as any, 'image/png'));
            const file = new File([blob], 'unsplash-image.png', { type: 'image/png' });
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }
          setImageUploadOption('upload');
        };
        img.onerror = () => {
          setUrlError('Could not load Unsplash image.');
        };
      } else {
        setUrlError('No Unsplash images found.');
      }
    } catch {
      setUrlError('Could not fetch Unsplash image.');
    } finally {
      setUnsplashLoading(false);
    }
  };

  const resetFileInput = () => {
    setIsUploading(false);
    setPreviewUrl('');
    setImageFile(null);
    setUploadProgress(0);
  };

  const handleReplaceImage = () => {
    setIsUploading(true);
    setFinishing(false);
    setUploadProgress(10 + Math.floor(Math.random() * 20)); // Start at 10-30%

    let uploadDone = false;
    const finish = () => {
      uploadDone = true;
      setFinishing(false);
      setIsUploading(false);
      setUploadProgress(100);
    };

    if (onReplace) {
      if (imageUploadOption == 'url' && initialImageUrl.startsWith('https://') && imageUrl != initialImageUrl) {
        onReplace({ url: imageUrl, alt: imageAlt });
        finish();
        return;
      }
      if (imageUploadOption == 'upload' && imageFile) {
        onReplace({ url: '', alt: imageAlt, img: imageFile as File });
        // Simulate async upload: finish() will be called after animation
      }
    }

    const steps = [
      33 + Math.floor(Math.random() * 12), // 33-45
      49 + Math.floor(Math.random() * 18), // 49-69
      69 + Math.floor(Math.random() * 20), // 69-89
      98
    ];

    let i = 0;
    function nextStep() {
      if (i < steps.length) {
        setTimeout(() => {
          setUploadProgress(steps[i]);
          i++;
          nextStep();
        }, 200 + Math.random() * 500); // 200-700ms between steps
      } else {
        // If upload not done, show finishing spinner at 98%
        setFinishing(true);
        // Poll every 400ms for up to 10s (simulate async upload completion)
        let waited = 0;
        const poll = () => {
          if (uploadDone || waited > 10000) {
            finish();
          } else {
            setTimeout(() => {
              waited += 400;
              poll();
            }, 400);
          }
        };
        poll();
      }
    }
    nextStep();
  };

  return (
    <Modal
      opened={imageModalOpen}
      onClose={handleCloseModal}
      title={
        <>
          {mode === 'replace' ? 'Replace Image' : 'Preview Image'}
          {!disableReplace && <Button
            variant={mode == 'replace' ? 'subtle' : 'light'}
            color={mode == 'replace' ? 'gray' : 'fuchsia'}
            leftSection={mode == 'replace' ? <IconPhotoPlus size={16} /> : <IconUpload size={16} />}
            onClick={onToggleMode}
            className={`font-bold border-2 ml-12 ${mode == 'replace' ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-100'} `}
            size={isMobile ? 'xs' : 'sm'}
          >
            {mode == 'preview' ? 'Replace Image' : 'Preview'}
          </Button>}
        </>
      }
      size={isMobile ? '100%' : '96%'}
      centered
      radius="xl"
      classNames={{ content: 'pb-[0px] border-4 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-sky-50 shadow-xl p-0' }}
      styles={{
        content: {
          padding: isMobile ? 0 : undefined,
          minHeight: isMobile ? '100dvh' : undefined,
          maxHeight: isMobile ? '100dvh' : undefined,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack my={isMobile ? 0 : 'md'} gap={isMobile ? 4 : 'md'} style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '8px 8px 72px 8px' : '20px 24px 90px 24px' }}>
          {mode == 'preview' && (
            <Paper withBorder p="xs" radius="md">
              {/* {Future: Edit Canvas/Gen AI /Clipper Controls, enable a toolbar in preview mode' - insert text )} */}
              <Center style={{ background: 'var(--mantine-color-gray-0)' }} p="xs">
                {isUploading ? (
                  <Loader size="sm" />
                ) : (
                  <img
                    src={previewUrl || imageUrl || PLACEHOLDER}
                    alt={imageAlt || 'Preview'}
                    style={{
                    objectFit: 'contain',
                    border: maxWidth ? '2px dashed #e879f9' : 'none',
                    borderRadius: 12,
                    background: '#fff',
                    margin: '0 auto',
                    display: 'block',
                      opacity: (!previewUrl && !imageUrl) ? 0.3 : 1,
                  }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER;
                  }}
                />
                )}
              </Center>
              {maxWidth && (
                <Text size="xs" c="dimmed" ta="center">Crop width: <strong>{maxWidth}</strong>px</Text>
              )}
            </Paper>
          )}
          {mode === 'replace' && (
            <>
              <SegmentedControl
                value={imageUploadOption}
                onChange={value => setImageUploadOption(value as 'url' | 'upload')}
                data={[
                  { label: 'Image URL', value: 'url' },
                  { label: 'Upload Image', value: 'upload' },
                ]}
                fullWidth
              />
              {imageUploadOption === 'url' && (
                <>
                  <TextInput
                    label="Image URL or search keywords"
                    placeholder="Paste an image URL or type something like 'cat' or 'mountain'"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.currentTarget.value)}
                    required
                    leftSection={<IconLink size={16} />}
                    data-autofocus
                    style={{ flex: 1 }}
                    error={urlError}
                  />
                  <Group gap={4} align="center" justify="flex-start" style={{ marginTop: 8, flexDirection: isMobile ? 'column' : 'row', width: '100%' }}>
                    <Button
                      variant="light"
                      color="blue"
                      size={isMobile ? 'xs' : 'sm'}
                      radius={isMobile ? 'md' : 'xl'}
                      leftSection={<IconDownload size={16} />}
                      onClick={async () => {
                        setUrlError(null);
                        if (!imageUrl) return;
                        // Always use proxy for user-supplied URLs
                        const proxyUrl = `/api/markket/img?action=proxy&url=${encodeURIComponent(imageUrl)}`;
                        await handleLoadFromUrlProxy(proxyUrl);
                      }}
                      style={{ fontWeight: 600, width: isMobile ? '100%' : undefined }}
                    >
                      Load from URL
                    </Button>
                    <Button
                      variant="light"
                      color="pink"
                      size={isMobile ? 'xs' : 'sm'}
                      radius={isMobile ? 'md' : 'xl'}
                      leftSection={<IconSparkles size={16} />}
                      loading={unsplashLoading}
                      onClick={handleRandomUnsplash}
                      style={{ fontWeight: 600, width: isMobile ? '100%' : undefined }}
                    >
                      Unsplash
                    </Button>
                  </Group>
                </>
              )}
              {imageUploadOption === 'upload' && (
                <Stack my="xs">
                  <Text size="sm" fw={500}>Upload Image</Text>
                  <Paper withBorder p="md" radius="md" bg={previewUrl ? 'transparent' : 'var(--mantine-color-gray-0)'}>
                    {!previewUrl ? (
                      <Dropzone
                        onDrop={(files) => handleFileUpload(files[0])}
                        onReject={() => { }}
                        maxSize={5 * 1024 * 1024}
                        accept={["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"]}
                        multiple={false}
                      >
                        <Stack my="md" align="center" py={20}>
                          <IconFileUpload size={32} opacity={0.5} />
                          <div>
                            <Text size="sm">Drag images here or click to select files</Text>
                            <Text size="xs" c="dimmed">JPEG, PNG, GIF up to 5MB</Text>
                          </div>
                          <FileButton
                            onChange={handleFileUpload}
                            accept="image/png,image/jpeg,image/gif"
                          >
                            {(props) => (
                              <Button
                                variant="light"
                                radius="md"
                                leftSection={<IconUpload size={14} />}
                                {...props}
                              >
                                Select file
                              </Button>
                            )}
                          </FileButton>
                        </Stack>
                      </Dropzone>
                    ) : (
                      <Stack my="md">
                        <Box pos="relative" className='max-h-[200px] overflow-scroll max-w-[96%] mx-auto'>
                            <MantineImage
                              src={previewUrl}
                              alt="Preview"
                            height={'200px'}
                              fit="contain"
                              radius="md"
                            />
                            <ActionIcon
                              color="red"
                              variant="filled"
                              radius="xl"
                              size="sm"
                              style={{ position: 'absolute', top: 5, right: 5 }}
                              onClick={resetFileInput}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Box>
                        {uploadProgress > 0 && (
                          <Stack mt="md">
                            <Group justify="apart" m="md">
                                <Text size="xs">
                                  {finishing ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <Loader size="xs" color="pink" /> Finishing up...
                                    </span>
                                  ) : 'Uploading...'}
                                </Text>
                              <Text size="xs" fw={500}>{uploadProgress}%</Text>
                            </Group>
                            <Progress
                              value={uploadProgress}
                              size="md"
                              color={uploadProgress > 80 ? 'green' : 'blue'}
                              radius="xl"
                            />
                          </Stack>
                        )}
                        <Text size="sm" truncate fw={500}>
                          {imageFile?.name}
                        </Text>
                      </Stack>
                    )}
                  </Paper>
                </Stack>
              )}
            </>
          )}
          <TextInput
            label="Alt Text"
            placeholder="Descriptive text for the image"
            value={imageAlt}
            onChange={e => setImageAlt(e.currentTarget.value)}
            description="Add accessible description of the image content"
          />
        </div>
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'linear-gradient(to top, #fdf4ff 90%, transparent)',
            zIndex: 10,
            padding: isMobile ? '10px 8px' : '18px 32px',
            borderTop: '2px solid #f0abfc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 -2px 16px 0 rgba(236, 72, 153, 0.07)',
          }}
        >
          <Text size={isMobile ? 'xs' : 'sm'} c="dimmed" fw={500}>
            {mode === 'replace' ? 'Ready to update your image?' : 'Preview your image'}
          </Text>
          <Group gap={isMobile ? 6 : 12}>
            <Button
              variant="outline"
              color="gray"
              onClick={handleCloseModal}
              size={isMobile ? 'sm' : 'md'}
              radius={isMobile ? 'md' : 'xl'}
              style={{ fontWeight: 600 }}
            >
              Cancel
            </Button>
            {mode == 'replace' && (
              <Button
                onClick={handleReplaceImage}
                disabled={disableReplace || (uploadProgress > 0 && uploadProgress < 100) || !(imageUrl || previewUrl) || (imageUploadOption == 'upload' && !imageFile)}
                leftSection={<IconPhotoPlus size={18} />}
                size={isMobile ? 'sm' : 'md'}
                radius={isMobile ? 'md' : 'xl'}
                style={{ fontWeight: 700, background: 'linear-gradient(90deg, #f472b6 0%, #818cf8 100%)', color: '#fff', boxShadow: '0 2px 8px 0 #fbbf24a0' }}
              >
                {imageUploadOption == 'upload' ? 'Upload & Save' : 'Replace & Save'}
              </Button>
            )}
          </Group>
        </div>
      </Stack>
    </Modal>
  );
};

export default ImageModal;
