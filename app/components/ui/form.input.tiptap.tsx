import { useState, useEffect } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { Text, Paper, Tabs, Group, ActionIcon, Tooltip, TextInput, Button, Modal, Stack } from '@mantine/core';
import { IconMarkdown, IconPhoto, IconEye, IconCode, IconPhotoPlus } from '@tabler/icons-react';

interface ContentEditorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  minHeight?: number;
  error?: string;
  format?: 'markdown' | 'blocks';
}

const ContentEditor = ({
  value = '',
  onChange,
  label = 'Content',
  description,
  placeholder = 'Type your content here...',
  minHeight = 300,
  error,
  format = 'markdown',
}: ContentEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        transformPastedText: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (format == 'markdown') {
        const markdown = editor.storage.markdown.getMarkdown();
        onChange(markdown);
      }
    },
  });

  useEffect(() => {
    if (!editor || !value) return;

    // Only update if the value is different to avoid cursor jumps
    const currentContent = editor.storage.markdown.getMarkdown();

    if (currentContent !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleInsertImage = () => {
    if (!editor || !imageUrl.trim()) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl,
        alt: imageAlt,
      })
      .run();

    // Reset form and close modal
    setImageUrl('');
    setImageAlt('');
    setImageModalOpen(false);
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
              <Tooltip label="Insert image">
                <ActionIcon
                  onClick={() => setImageModalOpen(true)}
                  variant="light"
                  color="blue"
                >
                  <IconPhoto size={16} />
                </ActionIcon>
              </Tooltip>
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
                  <RichTextEditor.H5 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setImageModalOpen(true)}
                    title="Insert image"
                  >
                    <IconPhotoPlus size={18} />
                  </ActionIcon>
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
              {editor.storage.markdown.getMarkdown()}
            </pre>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {error && (
        <Text c="red" size="xs" mt={4}>
          {error}
        </Text>
      )}

      {/* Image Insert Modal */}
      <Modal
        opened={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Insert Image"
        size="md"
        centered
      >
        <Stack spacing="md">
          <TextInput
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.currentTarget.value)}
            required
            data-autofocus
          />
          <TextInput
            label="Alt Text"
            placeholder="Descriptive text for the image"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.currentTarget.value)}
            description="Add accessible description of the image content"
          />

          {imageUrl && (
            <Paper withBorder p="xs" radius="md">
              <Text size="xs" c="dimmed" mb={8}>Preview:</Text>
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhYWFhIj5JbWFnZSBsb2FkaW5nIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            </Paper>
          )}

          <Group position="right" mt="md">
            <Button variant="subtle" onClick={() => setImageModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInsertImage}
              disabled={!imageUrl.trim()}
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
