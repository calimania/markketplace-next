import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import '@mantine/tiptap/styles.css';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { Remarkable } from 'remarkable';
import {
  Text, Paper, Tabs, Group, ActionIcon, TextInput, Button,
  Modal, Stack, FileButton, Progress, Image as MantineImage,
  Box, SegmentedControl, Center, Loader, SimpleGrid, Badge
} from '@mantine/core';
import {
  IconMarkdown, IconEye, IconCode, IconPhotoPlus,
  IconUpload, IconLink, IconX, IconCheck, IconMaximize, IconMinimize,
  IconBold, IconItalic, IconList, IconArrowBackUp, IconArrowForwardUp, IconKeyboardHide, IconDeviceFloppy
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
  allowFullscreen?: boolean;
}

type LocalDraftPayload = {
  format: 'markdown' | 'blocks' | 'html';
  sourceContent: string;
  updatedAt: number;
};

const getEditorMarkdown = (editor: any): string => {
  return editor?.storage?.markdown?.getMarkdown?.() ?? '';
};

const markdownToHtml = (editor: any, markdown: string): string => {
  const parser = editor?.storage?.markdown?.parser;
  if (parser?.render) {
    return parser.render(markdown);
  }

  // Fallback with real markdown support so headings/lists/images don't render as literal tokens.
  const fallback = new Remarkable({
    html: true,
    breaks: true,
  });

  return fallback.render(markdown);
};

const escapeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const plainTextToPreservedHtml = (text: string): string => {
  const normalized = text.replace(/\r\n?/g, '\n');

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
};

const looksLikeHtml = (value: string): boolean => /<\/?[a-z][\s\S]*>/i.test(value);

const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
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
  allowFullscreen = true,
}: ContentEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUploadOption, setImageUploadOption] = useState<'url' | 'upload' | 'library'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<Record<string, unknown> | null>(null);
  const [imageLibrary, setImageLibrary] = useState<'unsplash' | 'pexels'>('unsplash');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryResults, setLibraryResults] = useState<string[]>([]);
  const [didCopySource, setDidCopySource] = useState(false);
  const [contentStatus, setContentStatus] = useState<'saved' | 'editing'>('saved');
  const [autosaveKey, setAutosaveKey] = useState<string | null>(null);
  const [draftAvailableAt, setDraftAvailableAt] = useState<number | null>(null);
  const [didCheckDraft, setDidCheckDraft] = useState(false);
  const [isDraftRestoring, setIsDraftRestoring] = useState(false);
  const contentStatusTimerRef = useRef<number | null>(null);
  const draftSaveTimerRef = useRef<number | null>(null);

  const markEditing = () => {
    setContentStatus('editing');
    if (contentStatusTimerRef.current) {
      window.clearTimeout(contentStatusTimerRef.current);
    }
    contentStatusTimerRef.current = window.setTimeout(() => {
      setContentStatus('saved');
    }, 900);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 768px)');
    const coarsePointerMedia = window.matchMedia('(pointer: coarse)');
    const sync = () => setIsCompactViewport(media.matches);
    const syncTouchDevice = () => setIsTouchDevice(coarsePointerMedia.matches || navigator.maxTouchPoints > 0);
    sync();
    syncTouchDevice();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);

      if (typeof coarsePointerMedia.addEventListener === 'function') {
        coarsePointerMedia.addEventListener('change', syncTouchDevice);
        return () => {
          media.removeEventListener('change', sync);
          coarsePointerMedia.removeEventListener('change', syncTouchDevice);
        };
      }

      coarsePointerMedia.addListener(syncTouchDevice);
      return () => {
        media.removeEventListener('change', sync);
        coarsePointerMedia.removeListener(syncTouchDevice);
      };
    }

    media.addListener(sync);
    coarsePointerMedia.addListener(syncTouchDevice);
    return () => {
      media.removeListener(sync);
      coarsePointerMedia.removeListener(syncTouchDevice);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pageKey = window.location.pathname || 'unknown';
    const labelKey = (label || 'content').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setAutosaveKey(`markket:editor-draft:${pageKey}:${format}:${labelKey}`);
  }, [format, label]);

  useEffect(() => {
    if ((isCompactViewport || isTouchDevice) && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [isCompactViewport, isFullscreen, isTouchDevice]);

  useEffect(() => {
    if (!isFullscreen || isCompactViewport || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (contentStatusTimerRef.current) {
        window.clearTimeout(contentStatusTimerRef.current);
      }
      if (draftSaveTimerRef.current) {
        window.clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, []);

  const uploadFile = async (file: File) => {
    try {
      setImageError(null);
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
      setImageError(error instanceof Error ? error.message : 'Image upload failed.');
      setUploadProgress(0);
      setIsUploading(false);
    }
  }

  const importExternalImageToStrapi = async (sourceUrl: string, altText?: string) => {
    const proxyUrl = `/api/markket/img?action=proxy&url=${encodeURIComponent(sourceUrl)}`;
    const imageResponse = await fetch(proxyUrl);

    if (!imageResponse.ok) {
      throw new Error('Could not download the selected image URL.');
    }

    const blob = await imageResponse.blob();
    const mime = blob.type || 'image/jpeg';
    const extension = mime.split('/')[1] || 'jpg';
    const fileNameBase = (altText || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'image';

    const file = new File([blob], `${fileNameBase}.${extension}`, { type: mime });
    const uploaded = await strapiClient.uploadImage(file, {
      alternativeText: altText || fileNameBase,
    });
    const uploadedItem = uploaded?.[0];

    if (!uploadedItem?.url) {
      throw new Error('Could not import image into the media library.');
    }

    return {
      url: uploadedItem.url,
      data: uploadedItem as Record<string, unknown>,
    };
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    uploadFile(file);
  };

  const searchImageLibrary = async () => {
    try {
      setLibraryLoading(true);
      const endpoint = `/api/markket/img?action=${imageLibrary}&query=${encodeURIComponent(libraryQuery || '')}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      const urls = Array.isArray(data?.urls) ? data.urls.filter(Boolean) : [];
      setLibraryResults(urls);
    } catch (error) {
      console.error('library.search.failed', error);
      setLibraryResults([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  const openImageModal = () => {
    if (editor?.isActive('image')) {
      const attrs = editor.getAttributes('image');
      setImageUrl(typeof attrs?.src === 'string' ? attrs.src : '');
      setImageAlt(typeof attrs?.alt === 'string' ? attrs.alt : '');
      setImageUploadOption('url');
    }

    setImageModalOpen(true);
  };

  // Reset the file input when closing the modal
  const resetFileInput = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadedImageData(null);
    setImageError(null);
    setLibraryResults([]);
    setLibraryLoading(false);
  };

  // Compute safe initial content once at mount.
  // Tiptap's schema cannot parse a raw Strapi blocks array; convert to HTML first.
  // Track whether the last change came from inside the editor so the syncing
  // useEffect below doesn't call setContent() and jump the cursor.
  const isInternalUpdateRef = useRef(false);

  const initialContentRef = useRef<string>(
    format === 'blocks' && Array.isArray(value) && value.length > 0
      ? blocksToHtml(value as any[])
      : format === 'markdown' || format === 'html'
        ? ''
        : typeof value === 'string' ? value : '',
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false, // Link added below with custom config (openOnClick, rel, target)
      }),
      Markdown.configure({
        html: true,
        breaks: true,
        transformPastedText: false,
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
    editorProps: {
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const plainText = clipboard.getData('text/plain');
        if (!plainText || !plainText.includes('\n')) return false;

        const richText = clipboard.getData('text/html');
        if (richText && richText.trim()) return false;

        event.preventDefault();
        const html = plainTextToPreservedHtml(plainText);
        editor?.chain().focus().insertContent(html, {
          parseOptions: { preserveWhitespace: 'full' },
        }).run();
        return true;
      },
    },
    content: initialContentRef.current,
    // previously onUpdate would create a bug where the cursor was sent to the end after triggering a mantine/form change
    onBlur: ({ editor }) => {
      markEditing();
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
      markEditing();
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
    onCreate: ({ editor }) => {
      if (format == 'markdown' && typeof value === 'string' && value.trim().length > 0) {
        const parsedMarkdown = markdownToHtml(editor, value);
        editor.commands.setContent(parsedMarkdown, {
          emitUpdate: false,
          parseOptions: { preserveWhitespace: 'full' },
        });
      }

      if (format == 'html' && typeof value === 'string' && value.trim().length > 0) {
        const parsedHtml = looksLikeHtml(value) ? value : markdownToHtml(editor, value);
        editor.commands.setContent(parsedHtml, {
          emitUpdate: false,
          parseOptions: { preserveWhitespace: 'full' },
        });
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
      const htmlValue = typeof value === 'string'
        ? (looksLikeHtml(value) ? value : markdownToHtml(editor, value))
        : '';
      if (currentContent !== htmlValue) {
        editor.commands.setContent(htmlValue, {
          emitUpdate: false,
          parseOptions: { preserveWhitespace: 'full' },
        });
      }
      return;
    }

    if (format == 'blocks') {
      if ((value as TiptapDoc)?.type !== 'doc') {
        const parsed = blocksToHtml(value as any[]);
        const currentContent = editor.getHTML();
        if (currentContent !== parsed) {
          editor.commands.setContent(parsed, {
            emitUpdate: false,
            parseOptions: { preserveWhitespace: 'full' },
          });
        }
        return;
      }

      const currentJson = JSON.stringify(editor.getJSON());
      const nextJson = JSON.stringify(value);
      if (currentJson !== nextJson) {
        editor.commands.setContent(value, {
          emitUpdate: false,
          parseOptions: { preserveWhitespace: 'full' },
        });
      }
      return;
    }

    const currentContent = getEditorMarkdown(editor);

    if (currentContent !== value) {
      const parsedMarkdown = markdownToHtml(editor, value as string);
      editor.commands.setContent(parsedMarkdown, {
        emitUpdate: false,
        parseOptions: { preserveWhitespace: 'full' },
      });
    }
  }, [editor, value, format]);

  const handleInsertImage = async () => {
    if (!editor || !imageUrl.trim()) return;

    setImageError(null);
    let finalUrl = imageUrl.trim();
    let finalImageData = uploadedImageData;

    if (format === 'blocks' && !finalImageData) {
      try {
        setIsUploading(true);
        const imported = await importExternalImageToStrapi(finalUrl, imageAlt);
        finalUrl = imported.url;
        finalImageData = imported.data;
        setImageUrl(finalUrl);
        setUploadedImageData(finalImageData);
      } catch (error) {
        console.error('Image import failed:', error);
        setImageError(
          error instanceof Error
            ? error.message
            : 'Could not import image. Try Upload Image instead.',
        );
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (editor.isActive('image')) {
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          src: finalUrl,
          alt: imageAlt,
          strapiImage: finalImageData ? JSON.stringify(finalImageData) : null,
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setImage({
          src: finalUrl,
          alt: imageAlt,
          strapiImage: finalImageData ? JSON.stringify(finalImageData) : null,
        })
        .run();
    }

    // Reset form and close modal
    setImageUrl('');
    setImageAlt('');
    resetFileInput();
    setImageModalOpen(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setImageModalOpen(false);
    setImageUploadOption('upload');
    setImageUrl('');
    setImageAlt('');
    setImageError(null);
    setLibraryQuery('');
    resetFileInput();
  };

  // Convert markdown to HTML for preview
  const renderPreview = () => {
    if (!editor) return '';

    // Let Tiptap handle the conversion by getting the HTML output
    return editor.getHTML();
  };

  const previewHtml = renderPreview();
  const plainText = htmlToPlainText(previewHtml);
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const sourceLabel = format === 'blocks' ? 'JSON' : format === 'html' ? 'HTML' : 'Markdown';
  const sourceContent = !editor
    ? ''
    : format === 'blocks'
      ? JSON.stringify(getBlocksValue(editor), null, 2)
      : format === 'html'
        ? editor.getHTML()
        : getEditorMarkdown(editor);
  const panelMinHeight = isFullscreen
    ? (isCompactViewport ? 'calc(100dvh - 160px)' : 'calc(100dvh - 200px)')
    : minHeight;
  const editorMinHeight = isCompactViewport ? Math.min(minHeight, 260) : minHeight;
  const canUseFullscreen = allowFullscreen && !isCompactViewport && !isTouchDevice;
  const tabsListStyle: CSSProperties = isCompactViewport
    ? {
      borderRadius: 12,
      padding: 2,
      background: 'var(--mantine-color-gray-0)',
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      maxWidth: '100%',
      WebkitOverflowScrolling: 'touch' as CSSProperties['WebkitOverflowScrolling'],
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }
    : { borderRadius: 999, padding: 2, background: 'var(--mantine-color-gray-0)' };

  const exitEditorFocus = () => {
    if (!editor) return;
    editor.chain().blur().run();

    if (typeof document === 'undefined') return;

    const formActions = document.querySelector('.tienda-form-actions');
    if (formActions instanceof HTMLElement) {
      formActions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const clearSavedDraft = () => {
    if (!autosaveKey || typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(autosaveKey);
    } catch {
      // no-op: localStorage can be blocked in private browsing
    }
    setDraftAvailableAt(null);
  };

  const restoreSavedDraft = () => {
    if (!autosaveKey || !editor || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(autosaveKey);
      if (!raw) return;

      const payload = JSON.parse(raw) as LocalDraftPayload;
      if (!payload?.sourceContent || payload.format !== format) return;

      setIsDraftRestoring(true);

      if (format === 'markdown') {
        const parsedMarkdown = markdownToHtml(editor, payload.sourceContent);
        editor.commands.setContent(parsedMarkdown, {
          parseOptions: { preserveWhitespace: 'full' },
        });
      }

      if (format === 'html') {
        const parsedHtml = looksLikeHtml(payload.sourceContent)
          ? payload.sourceContent
          : markdownToHtml(editor, payload.sourceContent);
        editor.commands.setContent(parsedHtml, {
          parseOptions: { preserveWhitespace: 'full' },
        });
      }

      if (format === 'blocks') {
        try {
          const parsed = JSON.parse(payload.sourceContent) as unknown;
          if ((parsed as TiptapDoc)?.type === 'doc') {
            editor.commands.setContent(parsed as TiptapDoc, {
              parseOptions: { preserveWhitespace: 'full' },
            });
          } else if (Array.isArray(parsed)) {
            editor.commands.setContent(blocksToHtml(parsed as any[]), {
              parseOptions: { preserveWhitespace: 'full' },
            });
          }
        } catch {
          // Ignore malformed JSON drafts.
        }
      }

      setDraftAvailableAt(null);
      markEditing();
    } catch {
      // no-op
    } finally {
      setIsDraftRestoring(false);
    }
  };

  useEffect(() => {
    if (!autosaveKey || !editor || didCheckDraft || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(autosaveKey);
      if (!raw) {
        setDidCheckDraft(true);
        return;
      }

      const payload = JSON.parse(raw) as LocalDraftPayload;
      const validPayload =
        payload
        && typeof payload.sourceContent === 'string'
        && typeof payload.updatedAt === 'number'
        && payload.format === format;

      if (!validPayload) {
        setDidCheckDraft(true);
        return;
      }

      if (payload.sourceContent.trim() && payload.sourceContent !== sourceContent) {
        setDraftAvailableAt(payload.updatedAt);
      }
    } catch {
      // no-op
    } finally {
      setDidCheckDraft(true);
    }
  }, [autosaveKey, didCheckDraft, editor, format, sourceContent]);

  useEffect(() => {
    if (!autosaveKey || !didCheckDraft || !editor || isDraftRestoring || typeof window === 'undefined') return;

    if (draftSaveTimerRef.current) {
      window.clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = window.setTimeout(() => {
      try {
        const payload: LocalDraftPayload = {
          format,
          sourceContent,
          updatedAt: Date.now(),
        };
        window.localStorage.setItem(autosaveKey, JSON.stringify(payload));
      } catch {
        // no-op
      }
    }, 700);

    return () => {
      if (draftSaveTimerRef.current) {
        window.clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [autosaveKey, didCheckDraft, editor, format, isDraftRestoring, sourceContent]);

  const copySourceContent = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(sourceContent);
    setDidCopySource(true);
    setTimeout(() => setDidCopySource(false), 1200);
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
          border: error ? '1px solid var(--mantine-color-red-6)' : undefined,
          position: isFullscreen ? 'fixed' : 'relative',
          inset: isFullscreen ? 0 : undefined,
          width: isFullscreen ? '100vw' : undefined,
          height: isFullscreen ? '100dvh' : undefined,
          zIndex: isFullscreen ? 2000 : undefined,
          background: isFullscreen ? '#fff' : undefined,
          boxShadow: isFullscreen ? '0 28px 60px rgba(15, 23, 42, 0.26)' : undefined,
          borderRadius: isFullscreen ? 0 : undefined,
          overflow: isFullscreen ? 'hidden' : undefined,
          paddingTop: isFullscreen ? 'calc(env(safe-area-inset-top, 0px) + 4px)' : undefined,
        }}
      >
        {canUseFullscreen && isFullscreen && (
          <Button
            size="xs"
            variant="filled"
            color="pink"
            leftSection={<IconMinimize size={14} />}
            onClick={() => setIsFullscreen(false)}
            aria-label="Exit fullscreen editor"
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
              left: 10,
              zIndex: 2200,
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.25)',
            }}
          >
            Exit fullscreen
          </Button>
        )}

        <Tabs value={activeTab} onChange={(a) => setActiveTab(a as string)}>
          <Group justify="space-between" px="md" pt="xs">
            <Tabs.List style={tabsListStyle}>
              <Tabs.Tab value="editor" leftSection={<IconCode size={16} />} style={isCompactViewport ? { flex: '0 0 auto' } : undefined}>
                Editor
              </Tabs.Tab>
              <Tabs.Tab value="preview" leftSection={<IconEye size={16} />} style={isCompactViewport ? { flex: '0 0 auto' } : undefined}>
                Preview
              </Tabs.Tab>
              <Tabs.Tab value="markdown" leftSection={<IconMarkdown size={16} />} style={isCompactViewport ? { flex: '0 0 auto' } : undefined}>
                {sourceLabel}
              </Tabs.Tab>
            </Tabs.List>

            <Group>
              {activeTab === 'markdown' && (
                <ActionIcon
                  onClick={() => {
                    void copySourceContent();
                  }}
                  variant="light"
                  color={didCopySource ? 'green' : 'gray'}
                  aria-label={didCopySource ? 'Copied source' : `Copy ${sourceLabel}`}
                >
                  {didCopySource ? <IconCheck size={16} /> : <IconCode size={16} />}
                </ActionIcon>
              )}
              {canUseFullscreen && !isFullscreen && (
                <ActionIcon
                  onClick={() => setIsFullscreen((prev) => !prev)}
                  variant="light"
                  color={isFullscreen ? 'pink' : 'gray'}
                  aria-label={isFullscreen ? 'Exit fullscreen editor' : 'Open fullscreen editor'}
                >
                  {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
                </ActionIcon>
              )}
            </Group>
          </Group>

          {draftAvailableAt && (
            <Group
              justify="space-between"
              px="md"
              py={6}
              style={{
                borderTop: '1px solid var(--mantine-color-gray-2)',
                borderBottom: '1px solid var(--mantine-color-gray-2)',
                background: 'var(--mantine-color-yellow-0)',
              }}
            >
              <Text size="xs" c="dark.7">
                Local draft from {new Date(draftAvailableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Group gap={6}>
                <Button size="compact-xs" variant="subtle" color="gray" onClick={clearSavedDraft}>
                  Dismiss
                </Button>
                <Button size="compact-xs" onClick={restoreSavedDraft}>
                  Restore
                </Button>
              </Group>
            </Group>
          )}

          <Tabs.Panel value="editor">
            <RichTextEditor
              editor={editor}
              style={{
                minHeight: isFullscreen ? (isCompactViewport ? 'calc(100dvh - 150px)' : 'calc(100dvh - 190px)') : editorMinHeight,
                border: 'none',
                background: '#fff',
              }}
            >

              <RichTextEditor.Toolbar
                sticky
                stickyOffset={isFullscreen ? (isCompactViewport ? 6 : 12) : 60}
                style={{
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.92)',
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
              >
                {isCompactViewport ? (
                  /* Mobile: minimal toolbar */
                  <>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Bold />
                      <RichTextEditor.Italic />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.H2 />
                      <RichTextEditor.H3 />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.BulletList />
                      <RichTextEditor.Link />
                    </RichTextEditor.ControlsGroup>
                    <RichTextEditor.ControlsGroup>
                      <ActionIcon
                        variant="subtle"
                        onClick={openImageModal}
                        aria-label="Insert image"
                      >
                        <IconPhotoPlus size={18} />
                      </ActionIcon>
                    </RichTextEditor.ControlsGroup>
                  </>
                ) : (
                  /* Desktop: full toolbar */
                  <>
                    <RichTextEditor.ControlsGroup>
                      <RichTextEditor.Undo />
                      <RichTextEditor.Redo />
                    </RichTextEditor.ControlsGroup>

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
                        <ActionIcon
                          variant="subtle"
                          onClick={openImageModal}
                          aria-label="Insert image"
                        >
                          <IconPhotoPlus size={18} />
                        </ActionIcon>
                      </RichTextEditor.ControlsGroup>
                  </>
                )}
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content
                style={{
                  paddingBottom: isCompactViewport ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : 12,
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                }}
              />

              {isCompactViewport && (
                <Group
                  justify="space-between"
                  px="sm"
                  py={8}
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 5,
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderTop: '1px solid var(--mantine-color-gray-3)',
                    backdropFilter: 'blur(4px)',
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
                  }}
                >
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant={editor.isActive('bold') ? 'filled' : 'subtle'}
                      color={editor.isActive('bold') ? 'pink' : 'gray'}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      aria-label="Bold"
                    >
                      <IconBold size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant={editor.isActive('italic') ? 'filled' : 'subtle'}
                      color={editor.isActive('italic') ? 'pink' : 'gray'}
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      aria-label="Italic"
                    >
                      <IconItalic size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
                      color={editor.isActive('bulletList') ? 'pink' : 'gray'}
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      aria-label="Bullet list"
                    >
                      <IconList size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant={editor.isActive('link') ? 'filled' : 'subtle'}
                      color={editor.isActive('link') ? 'pink' : 'gray'}
                      onClick={() => {
                        if (editor.isActive('link')) {
                          editor.chain().focus().unsetLink().run();
                          return;
                        }

                        const existingHref = editor.getAttributes('link')?.href as string | undefined;
                        const href = window.prompt('Enter URL', existingHref || 'https://');
                        if (!href) return;

                        editor.chain().focus().setLink({ href }).run();
                      }}
                      title={editor.isActive('link') ? 'Remove link' : 'Add link'}
                    >
                      <IconLink size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={openImageModal}
                      aria-label="Insert image"
                    >
                      <IconPhotoPlus size={16} />
                    </ActionIcon>
                  </Group>

                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().chain().focus().undo().run()}
                      aria-label="Undo"
                    >
                      <IconArrowBackUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().chain().focus().redo().run()}
                      aria-label="Redo"
                    >
                      <IconArrowForwardUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={exitEditorFocus}
                      aria-label="Done editing"
                      title="Done"
                    >
                      <IconKeyboardHide size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="teal"
                      onClick={exitEditorFocus}
                      aria-label="Go to save buttons"
                      title="Go to Save"
                    >
                      <IconDeviceFloppy size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              )}
            </RichTextEditor>
          </Tabs.Panel>

          <Tabs.Panel value="preview">
            <Box
              style={{
                minHeight: panelMinHeight,
                overflow: 'auto',
                animation: 'fade-panel-in 180ms ease',
                background: 'linear-gradient(180deg, rgba(249,250,251,0.65) 0%, rgba(255,255,255,1) 35%)',
              }}
            >
              <div
                className="blocks-content"
                style={{
                  padding: '22px 20px 28px',
                  maxWidth: 920,
                  margin: '0 auto',
                  fontSize: isCompactViewport ? 15 : 16,
                  lineHeight: 1.8,
                  letterSpacing: '0.003em',
                  color: 'var(--mantine-color-dark-8)',
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="markdown" style={{ minHeight: panelMinHeight, overflow: 'auto', animation: 'fade-panel-in 180ms ease' }}>
            <Box px="md" py="sm">
              <pre
                style={{
                  margin: 0,
                  padding: '16px',
                  borderRadius: 12,
                  border: '1px solid var(--mantine-color-gray-2)',
                  background: 'linear-gradient(180deg, #fbfcfd 0%, #f8fafc 100%)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 13,
                  lineHeight: 1.65,
                  letterSpacing: '0.01em',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--mantine-color-dark-7)',
                }}
              >
                {sourceContent}
              </pre>
            </Box>
          </Tabs.Panel>
        </Tabs>

        <Group justify="space-between" px="md" py={8} style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Text size="xs" c="dimmed">
            {wordCount} words · {charCount} chars · {readMinutes} min read
          </Text>
          <Badge
            size="xs"
            variant="light"
            color={contentStatus === 'editing' ? 'orange' : 'teal'}
          >
            {contentStatus === 'editing' ? 'Editing' : 'Saved'}
          </Badge>
        </Group>
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
        fullScreen={isCompactViewport}
      >
        <Stack gap="sm">
          <SegmentedControl
            value={imageUploadOption}
            onChange={(value) => setImageUploadOption(value as 'url' | 'upload' | 'library')}
            data={[
              { label: 'Upload', value: 'upload' },
              { label: 'URL', value: 'url' },
              { label: 'Library', value: 'library' },
            ]}
            size="xs"
            fullWidth
          />

          {imageUploadOption === 'upload' ? (
            <Stack gap="xs">
              {/* Entire zone is the file picker */}
              <FileButton onChange={handleFileUpload} accept="image/png,image/jpeg,image/gif,image/webp">
                {(props) => (
                  <Box
                    component="button"
                    type="button"
                    {...props}
                    style={{
                      width: '100%',
                      minHeight: 140,
                      border: '2px dashed var(--mantine-color-default-border)',
                      borderRadius: 10,
                      background: 'var(--mantine-color-gray-0)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: 0,
                    }}
                  >
                    {isUploading ? (
                      <Loader size="sm" />
                    ) : previewUrl ? (
                      <img
                          src={previewUrl}
                          alt="Upload preview"
                          style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                        />
                      ) : (
                        <Stack align="center" gap={6}>
                          <IconUpload size={28} opacity={0.4} />
                          <Text size="xs" c="dimmed">Tap to select image</Text>
                          <Text size="xs" c="dimmed">JPEG · PNG · GIF · WEBP · 5 MB</Text>
                        </Stack>
                    )}
                  </Box>
                )}
              </FileButton>

              {imageFile && (
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>{imageFile.name}</Text>
                  <Button variant="subtle" color="red" size="xs" leftSection={<IconX size={12} />} onClick={resetFileInput}>
                    Clear
                  </Button>
                </Group>
              )}

              {uploadProgress > 0 && (
                <Stack gap={4}>
                  <Group justify="space-between">
                    <Text size="xs">Uploading…</Text>
                    <Text size="xs" fw={500}>{uploadProgress}%</Text>
                  </Group>
                  <Progress value={uploadProgress} size="sm" color={uploadProgress === 100 ? 'green' : 'blue'} radius="xl" />
                  {uploadProgress === 100 && (
                    <Group gap={4}>
                      <IconCheck size={14} color="green" />
                      <Text size="xs" c="green">Upload complete!</Text>
                    </Group>
                  )}
                </Stack>
              )}
            </Stack>

          ) : imageUploadOption === 'url' ? (
            <Stack gap="xs">
              <TextInput
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.currentTarget.value)}
                leftSection={<IconLink size={16} />}
                data-autofocus
              />
              {imageUrl && (
                <Center style={{ height: 120 }} bg="var(--mantine-color-gray-0)">
                  <img
                    src={imageUrl}
                    alt={imageAlt || 'Preview'}
                    style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Center>
              )}
            </Stack>

            ) : (
                <Stack gap="sm">
                  <SegmentedControl
                    value={imageLibrary}
                    onChange={(value) => setImageLibrary(value as 'unsplash' | 'pexels')}
                    data={[
                      { label: 'Unsplash', value: 'unsplash' },
                      { label: 'Pexels', value: 'pexels' },
                    ]}
                    fullWidth
                    size="xs"
                  />
                  <Group align="flex-end" gap="xs" wrap="nowrap">
                    <TextInput
                      placeholder="artisan market, pottery…"
                      value={libraryQuery}
                      onChange={(e) => setLibraryQuery(e.currentTarget.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchImageLibrary()}
                      size="sm"
                      style={{ flex: 1 }}
                    />
                    <Button size="sm" onClick={searchImageLibrary} loading={libraryLoading}>
                      Search
                    </Button>
                  </Group>

                  {libraryResults.length > 0 ? (
                    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
                      {libraryResults.slice(0, 18).map((url, index) => (
                        <Box
                          key={`${url}-${index}`}
                          component="button"
                          type="button"
                          onClick={() => {
                            setImageUrl(url);
                            setPreviewUrl(null);
                            setUploadedImageData(null);
                          }}
                          style={{
                            border: url === imageUrl ? '2px solid var(--mantine-color-pink-5)' : '2px solid transparent',
                            padding: 0, background: 'transparent',
                            cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                            transition: 'border-color 0.15s',
                          }}
                          title="Use this image"
                        >
                          <MantineImage src={url} alt={`result-${index}`} h={80} fit="cover" radius="sm" />
                        </Box>
                      ))}
                    </SimpleGrid>
                  ) : (
                      <Text size="xs" c="dimmed">Search Unsplash or Pexels and tap an image to use it.</Text>
                  )}
                </Stack>
          )}

          <TextInput
            label="Alt text"
            placeholder="Describe the image"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.currentTarget.value)}
            size="sm"
          />
          {imageError && <Text size="xs" c="red">{imageError}</Text>}

          <Group justify="flex-end" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
            <Button variant="subtle" size="sm" onClick={handleCloseModal}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleInsertImage}
              disabled={!imageUrl?.trim() || isUploading}
              leftSection={<IconPhotoPlus size={16} />}
            >
              {editor?.isActive('image') ? 'Replace' : 'Insert Image'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <style>{`
        @keyframes fade-panel-in {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ContentEditor;
