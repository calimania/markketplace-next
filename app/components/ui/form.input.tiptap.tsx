import { useState, useEffect } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { Text, Paper, Tabs, Group, ActionIcon, Tooltip, } from '@mantine/core';
import { IconMarkdown, IconPhoto, IconEye, IconCode } from '@tabler/icons-react';

// https://tiptap.dev/docs/editor/extensions/functionality/filehandler

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

  const insertImage = () => {
    if (!editor) return;

    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
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
                  onClick={insertImage}
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
    </div>
  );
};

export default ContentEditor;
