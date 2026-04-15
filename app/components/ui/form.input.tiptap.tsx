import { useState, useEffect, useRef } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import {
  Text, Paper, Tabs, Group, ActionIcon, Tooltip, TextInput, Button,
  Modal, Stack, FileButton, Progress, Image as MantineImage,
  Box, SegmentedControl, Center, Loader
} from '@mantine/core';
import {
  IconMarkdown, IconPhoto, IconEye, IconCode, IconPhotoPlus,
  IconUpload, IconLink, IconX, IconCheck, IconFileUpload
} from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import { blocksToHtml, JSONDocToBlocks } from '@/markket/helpers.blocks';
import { RichTextValue, TiptapDoc } from '@/markket/richtext';

declare module '@tiptap/extension-image' {
  interface SetImageOptions {
    strapiImage?: string | null;
  }
}

const StrapiImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      strapiImage: {
        default: null,
        parseHTML: element => element.getAttribute('data-strapi-image'),
        renderHTML: attributes => {
          return attributes.strapiImage
            ? { 'data-strapi-image': attributes.strapiImage }
            : {};
        },
      },
    };
  },
});

interface ContentEditorProps {
  value?: RichTextValue;
  onChange: (value: RichTextValue) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  minHeight?: number;
  error?: string;
  format?: 'markdown' | 'blocks' | 'html';
  onUploadImage?: (file: File, altText?: string) => Promise<string | undefined>;
}

const getEditorMarkdown = (editor: any): string => {
  return editor?.storage?.markdown?.getMarkdown?.() ?? '';
};

const getBlocksValue = (editor: any) => {
  return JSONDocToBlocks(editor.getJSON());
};

/**
 * Tiptap editor compatible with Mantine, Strapi and Markkët
 *
 * used by the ui.form to create blocks & markdown fields
 *
 * @param props
 * @returns
 */
const ContentEditor = ({
  value = '',
  onChange,
  label = 'Content',
  description,
  placeholder = 'The Music of the Ainur There was Eru, the One, who in Arda is called Iluvatar; and he made first the Ainur, the Holy Ones, that were the offspring of his thought, and they were with him before aught else was made.',
  minHeight = 300,
  error,
  format = 'markdown',
  onUploadImage,
}: ContentEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUploadOption, setImageUploadOption] = useState<'url' | 'upload'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<Record<string, unknown> | null>(null);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Simulate progress bar, Responses are too fast currently
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 160);

      let uploadUrl: string | undefined;

      // Use custom upload handler if provided (e.g., Tienda), otherwise fall back to Strapi
      if (onUploadImage) {
        uploadUrl = await onUploadImage(file, imageAlt || file.name);
      } else {
        const response = await strapiClient.uploadImage(file, {
          alternativeText: imageAlt || file.name
        });
        uploadUrl = response?.[0]?.url;
        if (response?.[0]) {
          setUploadedImageData(response[0] as Record<string, unknown>);
        }
      }

      clearInterval(interval);
      setUploadProgress(100);

      if (uploadUrl) {
        setImageUrl(uploadUrl);
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 500);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    uploadFile(file);
  };

  // Reset the file input when closing the modal
  const resetFileInput = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadedImageData(null);
  };

  // Compute safe initial content once at mount.
  // Tiptap's schema cannot parse a raw Strapi blocks array; convert to HTML first.
  // Track whether the last change came from inside the editor so the syncing
  // useEffect below doesn't call setContent() and jump the cursor.
  const isInternalUpdateRef = useRef(false);

  const initialContentRef = useRef<string>(
    format === 'blocks' && Array.isArray(value) && value.length > 0
      ? blocksToHtml(value as any[])
      : typeof value === 'string' ? value : '',
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        transformPastedText: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      StrapiImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
    ],
    content: initialContentRef.current,
    // previously onUpdate would create a bug where the cursor was sent to the end after triggering a mantine/form change
    onBlur: ({ editor }) => {
      if (format == 'markdown') {
        isInternalUpdateRef.current = true;
        const markdown = getEditorMarkdown(editor);
        onChange(markdown);
      }

      if (format == 'html') {
        isInternalUpdateRef.current = true;
        onChange(editor.getHTML());
      }

      if (format == 'blocks') {
        isInternalUpdateRef.current = true;
        onChange(getBlocksValue(editor));
      }
    },
    onUpdate: ({ editor }) => {
      if (format == 'html') {
        isInternalUpdateRef.current = true;
        onChange(editor.getHTML());
      }

      if (format == 'blocks') {
        isInternalUpdateRef.current = true;
        onChange(getBlocksValue(editor));
      }
    },
    onCreate: ({ editor }) => {
      if (format == 'markdown') {
        const markdown = getEditorMarkdown(editor);
        onChange(markdown);
      }

      if (format == 'html') {
        onChange(editor.getHTML());
      }

      if (format == 'blocks') {
        onChange(getBlocksValue(editor));
      }
    }
  });

  useEffect(() => {
    if (!editor) return;

    // Skip when the change originated from within the editor (onUpdate / onBlur).
    // This prevents setContent() from resetting cursor position on every keystroke.
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    if (!value || (Array.isArray(value) && value.length === 0)) {
      editor.commands.clearContent();
      return;
    }

    if (format == 'html') {
      const currentContent = editor.getHTML();
      if (currentContent !== value) {
        editor.commands.setContent(value as string);
      }
      return;
    }

    if (format == 'blocks') {
      if ((value as TiptapDoc)?.type !== 'doc') {
        const parsed = blocksToHtml(value as any[]);
        editor.commands.setContent(parsed);
        return;
      }

      editor.commands.setContent(value);
      return;
    }

    const currentContent = getEditorMarkdown(editor);

    if (currentContent !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value, format]);

  const handleInsertImage = () => {
    if (!editor || !imageUrl.trim()) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl,
        alt: imageAlt,
        strapiImage: uploadedImageData ? JSON.stringify(uploadedImageData) : null,
      })
      .run();

    // Reset form and close modal
    setImageUrl('');
    setImageAlt('');
    resetFileInput();
    setImageModalOpen(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setImageModalOpen(false);
    setImageUploadOption('url');
    setImageUrl('');
    setImageAlt('');
    resetFileInput();
  };

  // Convert markdown to HTML for preview
  const renderPreview = () => {
    if (!editor) return '';

    // Let Tiptap handle the conversion by getting the HTML output
    return editor.getHTML();
  };

  if (!editor) {
    return null;
  }

  return (
    <div>
      {label && (
        <Text component="label" size="sm" fw={500} mb={6} display="block">
          {label}
        </Text>
      )}

      {description && (
        <Text size="xs" c="dimmed" mb={6}>
          {description}
        </Text>
      )}

      <Paper
        withBorder={!error}
        p={0}
        style={{
          border: error ? '1px solid var(--mantine-color-red-6)' : undefined
        }}
      >
        <Tabs value={activeTab} onChange={(a) => setActiveTab(a as string)}>
          <Group justify="space-between" px="md" pt="xs">
            <Tabs.List>
              <Tabs.Tab value="editor" leftSection={<IconCode size={16} />}>
                Editor
              </Tabs.Tab>
              <Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
                Preview
              </Tabs.Tab>
              <Tabs.Tab value="markdown" leftSection={<IconMarkdown size={16} />}>
                Markdown
              </Tabs.Tab>
            </Tabs.List>

            <Group>
              {(format === 'markdown' || format === 'blocks') && (
                <Tooltip label="Insert image">
                  <ActionIcon
                    onClick={() => setImageModalOpen(true)}
                    variant="light"
                    color="blue"
                  >
                    <IconPhoto size={16} />
                  </ActionIcon>
                </Tooltip>)}
            </Group>
          </Group>

          <Tabs.Panel value="editor">
            <RichTextEditor
              editor={editor}
              style={{ minHeight, border: 'none' }}
            >
              {editor && (
                <BubbleMenu editor={editor}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Link />
                  </RichTextEditor.ControlsGroup>
                </BubbleMenu>
              )}
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  {(format === 'markdown' || format === 'blocks') && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => setImageModalOpen(true)}
                      title="Insert image"
                    >
                      <IconPhotoPlus size={18} />
                    </ActionIcon>
                  )}
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
          </Tabs.Panel>

          <Tabs.Panel value="preview">
            <div
              className="blocks-content px-4 py-6"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="markdown" style={{ minHeight }}>
            <pre className="px-4 py-6 font-mono text-sm whitespace-pre-wrap">
              {getEditorMarkdown(editor)}
            </pre>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {error && (
        <Text c="red" size="xs" mt={4}>
          {error}
        </Text>
      )}

      {/* Enhanced Image Upload Modal */}
      <Modal
        opened={imageModalOpen}
        onClose={handleCloseModal}
        title="Insert Image"
        size="md"
        centered
      >
        <Stack my="md">
          <SegmentedControl
            value={imageUploadOption}
            onChange={(value) => setImageUploadOption(value as 'url' | 'upload')}
            data={[
              { label: 'Image URL', value: 'url' },
              { label: 'Upload Image', value: 'upload' },
            ]}
            fullWidth
          />

          {(
            <Paper withBorder p="xs" radius="md">
              <Text size="xs" c="dimmed" mb={8}>Preview:</Text>
              <Center style={{ height: 150 }} bg="var(--mantine-color-gray-0)" p="xs" >
                {isUploading ? (
                  <Loader size="sm" />
                ) : (
                  <img
                    src={imageUrl || 'https://markketplace.nyc3.digitaloceanspaces.com/uploads/079a9ce3daa373036a6bc77c1739d424.png'}
                    alt={imageAlt || "Preview"}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhYWFhIj5JbWFnZSBsb2FkaW5nIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                )}
              </Center>
            </Paper>
          )}

          {imageUploadOption === 'url' ? (
            <TextInput
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.currentTarget.value)}
              required
              leftSection={<IconLink size={16} />}
              data-autofocus
            />
          ) : (
            <Stack my="xs">
              <Text size="sm" fw={500}>Upload Image</Text>
              <Paper
                withBorder
                p="md"
                radius="md"
                bg={previewUrl ? 'transparent' : 'var(--mantine-color-gray-0)'}
              >
                  {!previewUrl ? (
                    <Stack my="md" align="center" py={20}>
                      <IconFileUpload size={32} opacity={0.5} />
                      <div>
                        <Text size="sm">
                          Drag images here or click to select files
                        </Text>
                        <Text size="xs" c="dimmed">
                          JPEG, PNG, GIF up to 5MB
                        </Text>
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
                    <Box pos="relative">
                      <MantineImage
                        src={previewUrl}
                        alt="Preview"
                        height={200}
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
                    <Text size="sm" truncate fw={500}>
                      {imageFile?.name}
                    </Text>
                  </Stack>
                )}
              </Paper>
            </Stack>
          )}

          <TextInput
            label="Alt Text"
            placeholder="Descriptive text for the image"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.currentTarget.value)}
            description="Add accessible description of the image content"
          />
          <Group align="right" mt="md">
            <Button variant="subtle" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleInsertImage}
              disabled={!imageUrl?.trim() || isUploading}
              leftSection={<IconPhotoPlus size={16} />}
            >
              Insert Image
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default ContentEditor;
