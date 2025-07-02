import { useState, useEffect } from 'react';
import {
  Modal, Stack, SegmentedControl, Paper, Text, Center, Loader, TextInput, Button, Group, FileButton, Progress, ActionIcon, Box, Image as MantineImage
} from '@mantine/core';
import { IconLink, IconUpload, IconFileUpload, IconX, IconCheck, IconPhotoPlus, } from '@tabler/icons-react';

const PLACEHOLDER = 'https://markketplace.nyc3.digitaloceanspaces.com/uploads/079a9ce3daa373036a6bc77c1739d424.png';

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
}: ImageModalProps) => {
  const [imageUploadOption, setImageUploadOption] = useState<'url' | 'upload'>('upload');
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imageAlt, setImageAlt] = useState(initialImageAlt);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Reset state when modal opens/closes
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

        console.log({ height, width, maxWidth });

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

  const resetFileInput = () => {
    setIsUploading(false);
    setPreviewUrl('');
    setImageFile(null);
    setUploadProgress(0);
  };

  const handleReplaceImage = () => {
    setIsUploading(true);
    setUploadProgress(33);

    if (onReplace) {
      if (imageUploadOption == 'url' && initialImageUrl.startsWith('https://') && imageUrl != initialImageUrl) {
          onReplace({ url: imageUrl, alt: imageAlt });
      }
      if (imageUploadOption == 'upload' && imageFile) {
        onReplace({ url: '', alt: imageAlt, img: imageFile as File });
      }
    }

    setTimeout(() => {
      setUploadProgress(66);
    }, 0.5 * 1000);

     return setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(88);
      }, 1.1 * 1000 );
  };

  return (
    <Modal
      opened={imageModalOpen}
      onClose={handleCloseModal}
      title={<>{mode === 'replace' ? 'Replace Image' : 'Image Preview'} <Button
          variant={mode == 'replace' ? 'subtle' : 'light'}
          color={mode == 'replace' ? 'gray' : 'fuchsia'}
          leftSection={mode == 'replace' ? <IconPhotoPlus size={16} /> : <IconUpload size={16} />}
          onClick={onToggleMode}
          className={`font-bold border-2 ml-12 ${mode == 'replace' ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-100'} `}
        >
          {mode == 'preview' ? 'Replace Image' : 'Preview'}
        </Button></>}
      size="96%"
      centered
      radius="xl"
      classNames={{ content: 'border-4 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-sky-50 shadow-xl' }}
    >
      <Stack my="md" gap="md">
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
                    // maxWidth: maxWidth ? maxWidth : '100%',
                    objectFit: 'contain',
                    border: maxWidth ? '2px dashed #e879f9' : 'none',
                    borderRadius: 12,
                    background: '#fff',
                    margin: '0 auto',
                    display: 'block',
                    opacity: (!previewUrl && !imageUrl) ?  0.3 : 1,
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
              <TextInput
                label="Image URL"
                readOnly
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.currentTarget.value)}
                required
                leftSection={<IconLink size={16} />}
                data-autofocus
              />
            )}
            {imageUploadOption === 'upload' && (
              <Stack my="xs">
                <Text size="sm" fw={500}>Upload Image</Text>
                <Paper withBorder p="md" radius="md" bg={previewUrl ? 'transparent' : 'var(--mantine-color-gray-0)'}>
                  {!previewUrl ? (
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
                            <Text size="xs">Uploading...</Text>
                            <Text size="xs" fw={500}>{uploadProgress}%</Text>
                          </Group>
                          <Progress
                            value={uploadProgress}
                            size="sm"
                            color={uploadProgress === 100 ? 'green' : 'blue'}
                            radius="xl"
                          />
                          {uploadProgress === 100 && (
                            <Group m={5}>
                              <IconCheck size={14} color="green" />
                              <Text size="xs" c="green">Upload complete!</Text>
                            </Group>
                          )}
                        </Stack>
                      )}
                      <Text size="sm" truncate fw={500}>{imageFile?.name}</Text>
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
        <Group align="right" mt="md">
          <Button variant="subtle" onClick={handleCloseModal}>
            Dismiss
          </Button>
          {mode == 'replace' && (
            <Button
              onClick={handleReplaceImage}
              disabled={isUploading || !(imageUrl || previewUrl) || (imageUploadOption == 'upload' && !imageFile)}
              leftSection={<IconPhotoPlus size={16} />}
            >
              { imageUploadOption == 'upload' ?  'Upload' : 'Replace'}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
};

export default ImageModal;
