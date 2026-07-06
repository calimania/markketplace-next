'use client';

import { useEffect, useState } from 'react';
import {
  Group,
  Text,
  FileButton,
  Button,
  Stack,
  Paper,
  Title,
  Box,
  Loader,
  Badge,
  Divider,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconPhoto, IconArrowLeft, IconArrowRight, IconTrash, IconDeviceFloppy, IconSparkles } from '@tabler/icons-react';
import { Store, Media } from '@/markket/store';
import { tiendaClient } from '@/markket/api';
import ImageModal from '../../../markket/components/image.modal';

interface StoreMediaProps {
  store: Store;
  onUpdate: (file: Media, field: string, id: number | string) => void;
  onRefresh?: () => Promise<void> | void;
  onSaveSlides?: (slides: Store['Slides']) => Promise<void> | void;
}

type UploadField = 'Logo' | 'Favicon' | 'SEO.socialImage' | 'Cover' | 'Slides';
type LoadingField = 'logo' | 'favicon' | 'social' | 'slides' | null;
type SlideMedia = Store['Slides'][number];

type UploadRule = {
  maxWidth: number;
  maxHeight: number;
  targetBytes: number;
  maxBytes: number;
  helper: string;
};

const uploadRules: Record<UploadField, UploadRule> = {
  Favicon: {
    maxWidth: 96,
    maxHeight: 96,
    targetBytes: 48 * 1024,
    maxBytes: 160 * 1024,
    helper: 'Favicon is optimized to around 64-96 px and kept very small.',
  },
  Logo: {
    maxWidth: 600,
    maxHeight: 600,
    targetBytes: 260 * 1024,
    maxBytes: 900 * 1024,
    helper: 'Logo is optimized up to 600x600 for crisp UI with lighter payload.',
  },
  Cover: {
    maxWidth: 1600,
    maxHeight: 900,
    targetBytes: 650 * 1024,
    maxBytes: 2 * 1024 * 1024,
    helper: 'Cover is optimized for wide layouts and social cards.',
  },
  'SEO.socialImage': {
    maxWidth: 1200,
    maxHeight: 630,
    targetBytes: 550 * 1024,
    maxBytes: 1800 * 1024,
    helper: 'Social image targets the standard 1200x630 preview size.',
  },
  Slides: {
    maxWidth: 1600,
    maxHeight: 1200,
    targetBytes: 700 * 1024,
    maxBytes: 2 * 1024 * 1024,
    helper: 'Slides are auto-optimized to keep gallery loading snappy.',
  },
};

const rasterMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read image'));
    };
    img.src = url;
  });
}

function withExtension(fileName: string, extension: string) {
  const base = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
  return `${base}.${extension}`;
}

type MediaSlot = {
  id: string;
  label: string;
  field: UploadField;
  src?: string;
  alt: string;
  isSlide?: boolean;
  mediaId?: number | string;
};

export default function StoreMedia({ store, onUpdate, onRefresh, onSaveSlides }: StoreMediaProps) {
  const [loading, setLoading] = useState<'logo' | 'favicon' | 'social' | 'slides' | null>(null);
  const [savingSlides, setSavingSlides] = useState(false);
  const [savingAlt, setSavingAlt] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('Logo');
  const [altText, setAltText] = useState('');
  const [draftSlides, setDraftSlides] = useState<SlideMedia[]>(Array.isArray(store.Slides) ? store.Slides : []);
  const [isDropActive, setIsDropActive] = useState(false);

  const readAuthToken = () => {
    if (typeof window === 'undefined') return '';

    try {
      const raw = localStorage.getItem('markket.auth');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.jwt || '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    setDraftSlides(Array.isArray(store.Slides) ? store.Slides : []);
  }, [store.documentId, store.Slides]);

  const getSlideSlotId = (slide: SlideMedia, index: number) => `slide-${slide.documentId || slide.id || index}`;
  const storeName = (store.title || store.slug || 'store').trim();

  const fieldAltLabel = (field: UploadField) => {
    if (field === 'Logo') return 'logo';
    if (field === 'Favicon') return 'favicon';
    if (field === 'Cover') return 'cover image';
    if (field === 'SEO.socialImage') return 'social image';
    return 'slide image';
  };

  const slots: MediaSlot[] = [
    {
      id: 'Logo',
      label: 'Logo',
      field: 'Logo',
      src: store.Logo?.url,
      alt: store.Logo?.alternativeText || `${storeName} logo`,
      mediaId: store.Logo?.id,
    },
    {
      id: 'Favicon',
      label: 'Favicon',
      field: 'Favicon',
      src: store.Favicon?.url,
      alt: store.Favicon?.alternativeText || `${storeName} favicon`,
      mediaId: store.Favicon?.id,
    },
    {
      id: 'Cover',
      label: 'Cover',
      field: 'Cover',
      src: store.Cover?.url,
      alt: store.Cover?.alternativeText || `${storeName} cover image`,
      mediaId: store.Cover?.id,
    },
    {
      id: 'SEO.socialImage',
      label: 'Social',
      field: 'SEO.socialImage',
      src: store.SEO?.socialImage?.url,
      alt: store.SEO?.socialImage?.alternativeText || `${storeName} social image`,
      mediaId: store.SEO?.socialImage?.id,
    },
    ...draftSlides.slice(0, 8).map((slide, index) => ({
      id: getSlideSlotId(slide, index),
      label: `Slide ${index + 1}`,
      field: 'Slides' as UploadField,
      src: slide.formats?.small?.url || slide.url,
      alt: slide.alternativeText || `${storeName} slide ${index + 1}`,
      isSlide: true,
      mediaId: slide.id,
    })),
    {
      id: 'slide-add',
      label: 'Add Slide',
      field: 'Slides',
      alt: 'Add a new slide',
      isSlide: true,
    },
  ];

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) || slots[0];
  const selectedRule = uploadRules[selectedSlot.field];
  const selectedSlideIndex = selectedSlot?.isSlide && selectedSlot.id !== 'slide-add'
    ? draftSlides.findIndex((slide, index) => getSlideSlotId(slide, index) === selectedSlot.id)
    : -1;
  const hasSlideDraftChanges = JSON.stringify((store.Slides || []).map((slide) => slide.documentId || slide.id))
    !== JSON.stringify((draftSlides || []).map((slide) => slide.documentId || slide.id));
  const hasAltDraftChanges = (altText || '').trim() !== (selectedSlot?.alt || '').trim();

  const toLoadingField = (field: UploadField): LoadingField => {
    if (field === 'Logo') return 'logo';
    if (field === 'Favicon') return 'favicon';
    if (field === 'Slides') return 'slides';
    return 'social';
  };

  useEffect(() => {
    setAltText(selectedSlot?.alt || '');
  }, [selectedSlot?.id, selectedSlot?.alt]);

  const optimizeForField = async (file: File, field: UploadField) => {
    const rule = uploadRules[field];

    if (!rasterMimeTypes.has(file.type)) {
      if (file.size > rule.maxBytes) {
        throw new Error(`${field} file is too large (${formatBytes(file.size)}). Max is ${formatBytes(rule.maxBytes)}.`);
      }
      return file;
    }

    const image = await loadImage(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    // Validate dimensions before processing
    if (width > rule.maxWidth || height > rule.maxHeight) {
      console.warn(`[Media] ${field} exceeds max dimensions: ${width}x${height} (max ${rule.maxWidth}x${rule.maxHeight}). Will resize.`);
    }

    const scale = Math.min(1, rule.maxWidth / width, rule.maxHeight / height);
    const nextWidth = Math.max(1, Math.round(width * scale));
    const nextHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Image processing is not available in this browser');
    }

    ctx.drawImage(image, 0, 0, nextWidth, nextHeight);

    const preferredType = field === 'Favicon'
      ? 'image/png'
      : (file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp');
    let quality = preferredType === 'image/png' ? undefined : 0.9;

    let blob = await toBlob(canvas, preferredType, quality);

    if (!blob) {
      throw new Error('Could not prepare image for upload');
    }

    if (preferredType !== 'image/png') {
      while (blob.size > rule.targetBytes && quality && quality > 0.45) {
        quality = Number((quality - 0.08).toFixed(2));
        blob = (await toBlob(canvas, preferredType, quality)) || blob;
      }
    }

    if (blob.size > rule.maxBytes && preferredType === 'image/png' && field !== 'Favicon') {
      let webpQuality = 0.88;
      let webpBlob = await toBlob(canvas, 'image/webp', webpQuality);

      while (webpBlob && webpBlob.size > rule.targetBytes && webpQuality > 0.45) {
        webpQuality = Number((webpQuality - 0.08).toFixed(2));
        webpBlob = (await toBlob(canvas, 'image/webp', webpQuality)) || webpBlob;
      }

      if (webpBlob) {
        blob = webpBlob;
      }
    }

    if (blob.size > rule.maxBytes) {
      throw new Error(`${field} is still too large after optimization (${formatBytes(blob.size)}). Max is ${formatBytes(rule.maxBytes)}.`);
    }

    const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/png' ? 'png' : 'webp';
    const optimized = new File([blob], withExtension(file.name, extension), {
      type: blob.type,
      lastModified: Date.now(),
    });

    console.log(`[Media] ${field} optimized: ${formatBytes(file.size)} → ${formatBytes(optimized.size)} | ${width}x${height} → ${nextWidth}x${nextHeight} | ${optimized.type}`);

    return optimized;
  };

  const handleUpload = async (file: File, field: UploadField, altOverride?: string) => {
    if (!store?.id) return;

    try {
      setLoading(toLoadingField(field));

      const token = readAuthToken();

      if (!token) {
        throw new Error('Missing session token');
      }

      const optimizedFile = await optimizeForField(file, field);

      const storeRef = store.documentId || store.slug || store.id;
      const effectiveAlt = altOverride?.trim() || altText.trim() || `${storeName} ${fieldAltLabel(field)}`;

      const uploadResult = await tiendaClient.uploadStoreMedia(storeRef, {
        token,
        files: [optimizedFile],
        caption: effectiveAlt,
        alternativeText: effectiveAlt,
        attach: {
          contentType: 'store',
          field,
          mode: field === 'Slides' ? 'append' : 'replace',
        },
      });

      if (!uploadResult?.ok) {
        throw new Error(uploadResult?.message || uploadResult?.text || 'Upload failed');
      }

      notifications.show({
        title: 'Success',
        message: `${field} uploaded (${formatBytes(file.size)} → ${formatBytes(optimizedFile.size)}, ${optimizedFile.type})`,
        color: 'green',
      });

      const uploaded = uploadResult?.data?.[0] as Media | undefined;
      if (uploaded) {
        onUpdate(uploaded, field, store.id);
        if (field === 'Slides') {
          setDraftSlides((current) => {
            const exists = current.some((slide) => `${slide.id}` === `${uploaded.id}` || `${slide.documentId}` === `${uploaded.documentId}`);
            return exists ? current : [...current, uploaded as SlideMedia];
          });
          setSelectedSlotId(`slide-${uploaded.documentId || uploaded.id}`);
        }
        await onRefresh?.();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : `Failed to upload ${field?.toLowerCase()}`,
        color: 'red',
      });
    } finally {
      setLoading(null);
    }
  };

  const openImageWorkModal = () => {
    setImageModalOpen(true);
  };

  const uploadFromModal = async ({ url, img, alt }: { url?: string; img?: File; alt?: string }) => {
    try {
      const nextAlt = (alt || '').trim();
      let nextFile: File | null = img || null;

      if (!nextFile && url) {
        const proxyUrl = `/api/markket/img?action=proxy&url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error('Could not load image URL for upload');
        }

        const blob = await response.blob();
        const mime = blob.type || 'image/webp';
        const extension = mime.includes('png') ? 'png' : mime.includes('jpeg') ? 'jpg' : 'webp';
        nextFile = new File([blob], `modal-image.${extension}`, {
          type: mime,
          lastModified: Date.now(),
        });
      }

      if (!nextFile) {
        throw new Error('No image to upload');
      }

      await handleUpload(nextFile, selectedSlot.field, nextAlt || undefined);

      if (nextAlt) {
        setAltText(nextAlt);
      }

      setImageModalOpen(false);
    } catch (error) {
      console.error('modal.upload.failed', error);
      notifications.show({
        title: 'Could not apply image work',
        message: error instanceof Error ? error.message : 'Try again in a moment.',
        color: 'red',
      });
    }
  };

  const moveSlide = (direction: -1 | 1) => {
    if (selectedSlideIndex < 0) return;

    const nextIndex = selectedSlideIndex + direction;
    if (nextIndex < 0 || nextIndex >= draftSlides.length) return;

    setDraftSlides((current) => {
      const clone = [...current];
      const [picked] = clone.splice(selectedSlideIndex, 1);
      clone.splice(nextIndex, 0, picked);
      return clone;
    });

    notifications.show({
      title: 'Slide moved',
      message: direction < 0 ? 'Moved one step left.' : 'Moved one step right.',
      color: 'grape',
      autoClose: 1200,
    });
  };

  const deleteSlide = () => {
    if (selectedSlideIndex < 0) return;

    setDraftSlides((current) => current.filter((_, index) => index !== selectedSlideIndex));
    setSelectedSlotId('slide-add');

    notifications.show({
      title: 'Slide removed',
      message: 'Remember to save slides to persist this change.',
      color: 'orange',
      autoClose: 1800,
    });
  };

  const saveSlides = async () => {
    if (!onSaveSlides) return;

    try {
      setSavingSlides(true);

      // Update the selected slide's alt text before saving
      if (selectedSlot?.isSlide && selectedSlideIndex >= 0) {
        const updatedSlides = [...draftSlides];
        updatedSlides[selectedSlideIndex] = {
          ...updatedSlides[selectedSlideIndex],
          alternativeText: altText.trim(),
        };
        await onSaveSlides(updatedSlides);
      } else {
        await onSaveSlides(draftSlides);
      }

      notifications.show({
        title: 'Slides saved',
        message: 'Slides order, alt text, and removals were saved.',
        color: 'green',
      });
      await onRefresh?.();
    } catch (error) {
      console.error('save.slides.failed', error);
      notifications.show({
        title: 'Could not save slides',
        message: 'Please try again.',
        color: 'red',
      });
    } finally {
      setSavingSlides(false);
    }
  };

  const saveAltText = async () => {
    if (selectedSlot?.isSlide || selectedSlot?.id === 'slide-add') return;

    const storeRef = store.documentId || store.slug || store.id;
    const sourceUrl = selectedSlot?.src;

    if (!storeRef || !sourceUrl) return;

    try {
      setSavingAlt(true);

      const token = readAuthToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const nextAlt = altText.trim() || `${storeName} ${fieldAltLabel(selectedSlot.field)}`;
      const proxyUrl = `/api/markket/img?action=proxy&url=${encodeURIComponent(sourceUrl)}`;
      const sourceResponse = await fetch(proxyUrl);

      if (!sourceResponse.ok) {
        throw new Error('Could not load current image for alt text update');
      }

      const sourceBlob = await sourceResponse.blob();
      const mime = sourceBlob.type || 'image/webp';
      const extension = mime.includes('png') ? 'png' : mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'img';
      const file = new File([sourceBlob], `alt-refresh-${selectedSlot.field.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${extension}`, {
        type: mime,
        lastModified: Date.now(),
      });

      const uploadResult = await tiendaClient.uploadStoreMedia(storeRef, {
        token,
        files: [file],
        caption: nextAlt,
        alternativeText: nextAlt,
        attach: {
          contentType: 'store',
          field: selectedSlot.field,
          mode: 'replace',
        },
      });

      if (!uploadResult?.ok) {
        throw new Error(uploadResult?.message || uploadResult?.text || 'Unable to save alt text');
      }

      const uploaded = uploadResult?.data?.[0] as Media | undefined;
      if (uploaded) {
        onUpdate(uploaded, selectedSlot.field, store.id);
      }

      notifications.show({
        title: 'Alt text saved',
        message: `${selectedSlot.label} description updated.`,
        color: 'green',
      });

      await onRefresh?.();
    } catch (error) {
      console.error('save.alt.failed', error);
      notifications.show({
        title: 'Could not save alt text',
        message: 'Try again in a moment.',
        color: 'red',
      });
    } finally {
      setSavingAlt(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack>
        <Group justify="space-between" align="center">
          <Title order={4}>Store Media</Title>
          <Group gap="xs">
            {hasSlideDraftChanges && <Badge variant="light" color="orange">Slides not saved</Badge>}
            {hasSlideDraftChanges && onSaveSlides && (
              <Button
                variant="light"
                color="grape"
                size="xs"
                leftSection={<IconDeviceFloppy size={14} />}
                onClick={saveSlides}
                loading={savingSlides}
                disabled={savingSlides}
              >
                Save Slides
              </Button>
            )}
            {loading && (
              <Badge variant="light" color="grape">Uploading...</Badge>
            )}
          </Group>
        </Group>

        <Group gap="xs" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {slots.map((slot) => {
            const active = selectedSlot?.id === slot.id;
            return (
              <Box
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                title={slot.label}
                style={{
                  width: 90,
                  minWidth: 90,
                  height: 74,
                  borderRadius: 10,
                  border: active ? '2px solid #e4007c' : '1px solid rgba(15,23,42,0.14)',
                  background: slot.src
                    ? `url(${slot.src}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
                  transform: active ? 'translateY(-1px)' : 'translateY(0px)',
                  boxShadow: active ? '0 4px 12px rgba(228, 0, 124, 0.2)' : 'none',
                }}
              >
                {!slot.src && <IconPhoto size={18} opacity={0.45} />}
                <Text
                  size="10px"
                  fw={700}
                  c={slot.src ? 'white' : 'dimmed'}
                  style={{
                    position: 'absolute',
                    left: 6,
                    bottom: 5,
                    textShadow: slot.src ? '0 1px 2px rgba(0,0,0,0.7)' : 'none',
                  }}
                >
                  {slot.label}
                </Text>
              </Box>
            );
          })}
        </Group>

        <Paper withBorder p="xs" radius="md" style={{ position: 'relative' }}>
          <FileButton
            onChange={(file) => file && handleUpload(file, selectedSlot.field)}
            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
          >
            {(props) => (
              <Stack gap="sm">
                <Box
                  {...props}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (loading) return;
                    setIsDropActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDropActive(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDropActive(false);

                    if (loading) return;

                    const droppedFile = event.dataTransfer.files?.[0];
                    if (!droppedFile) return;

                    void handleUpload(droppedFile, selectedSlot.field);
                  }}
                  style={{
                    height: 340,
                    borderRadius: 10,
                    border: isDropActive ? '2px dashed #8b5cf6' : '1px solid rgba(15,23,42,0.12)',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 180ms ease, transform 120ms ease, box-shadow 120ms ease',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                  }}
                >
                  {isDropActive && !loading && (
                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 3,
                        background: 'rgba(139, 92, 246, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text size="sm" fw={700} c="grape.8">Drop image to upload {selectedSlot.label}</Text>
                    </Box>
                  )}
                  {loading && (
                    <Box
                      key="uploading-overlay"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.62)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                    >
                      <Group gap="xs" align="center">
                        <Loader size="sm" color="grape" />
                        <Text size="sm" fw={600}>Uploading {selectedSlot.label}...</Text>
                      </Group>
                    </Box>
                  )}
                  {!selectedSlot?.src && (
                    <Stack key="empty-state" align="center" gap={4}>
                      <IconPhoto size={30} opacity={0.45} />
                      <Text size="sm" c="dimmed">Tap or click to upload {selectedSlot.label}</Text>
                    </Stack>
                  )}
                  {selectedSlot?.src && (
                    <img
                      key="selected-image"
                      src={selectedSlot.src}
                      alt={selectedSlot.alt || selectedSlot.label}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                  )}
                </Box>

                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>{selectedSlot.label}</Text>
                  <Group gap="xs">
                    {!selectedSlot?.isSlide && (
                      <Button
                        size="xs"
                        variant="light"
                        color="grape"
                        leftSection={<IconDeviceFloppy size={14} />}
                        onClick={saveAltText}
                        loading={savingAlt}
                        disabled={!selectedSlot?.mediaId || !hasAltDraftChanges || savingAlt || loading !== null}
                      >
                        Save Alt
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="xs"
                      leftSection={<IconSparkles size={14} />}
                      onClick={openImageWorkModal}
                      disabled={loading !== null || savingSlides || savingAlt}
                    >
                      Image Editor
                    </Button>
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconUpload size={14} />}
                      loading={loading === toLoadingField(selectedSlot.field)}
                      {...props}
                    >
                      {selectedSlot?.src ? 'Replace' : 'Upload'}
                    </Button>
                  </Group>
                </Group>

                <TextInput
                  label="Alt text"
                  description={`This description is saved when you upload or replace the image${selectedSlot?.isSlide ? ' and when you save slides' : ' and can also be saved directly'}. ${selectedRule.helper}`}
                  placeholder={`Describe ${selectedSlot.label.toLowerCase()} image`}
                  value={altText}
                  onChange={(event) => setAltText(event.currentTarget.value)}
                  size="xs"
                />

                <Text size="xs" c="dimmed">
                  Max upload budget for {selectedSlot.label}: {selectedRule.maxWidth}x{selectedRule.maxHeight} and about {formatBytes(selectedRule.maxBytes)}.
                </Text>

                {selectedSlot?.isSlide && selectedSlot.id !== 'slide-add' && (
                  <>
                    <Divider />
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs">
                        <Button
                          variant="default"
                          size="xs"
                          leftSection={<IconArrowLeft size={14} />}
                          onClick={() => moveSlide(-1)}
                          disabled={selectedSlideIndex <= 0 || savingSlides}
                        >
                          Move Left
                        </Button>
                        <Button
                          variant="default"
                          size="xs"
                          leftSection={<IconArrowRight size={14} />}
                          onClick={() => moveSlide(1)}
                          disabled={selectedSlideIndex < 0 || selectedSlideIndex >= draftSlides.length - 1 || savingSlides}
                        >
                          Move Right
                        </Button>
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          leftSection={<IconTrash size={14} />}
                          onClick={deleteSlide}
                          disabled={selectedSlideIndex < 0 || savingSlides}
                        >
                          Delete
                        </Button>
                      </Group>

                      <Button
                        variant="light"
                        color="grape"
                        size="xs"
                        leftSection={<IconDeviceFloppy size={14} />}
                        onClick={saveSlides}
                        disabled={(!hasSlideDraftChanges && !hasAltDraftChanges) || savingSlides}
                        loading={savingSlides}
                      >
                        Save Slides
                      </Button>
                    </Group>
                  </>
                )}
              </Stack>
            )}
          </FileButton>
        </Paper>

        <ImageModal
          imageModalOpen={imageModalOpen}
          handleCloseModal={() => setImageModalOpen(false)}
          imageUrl={selectedSlot?.src || ''}
          imageAlt={altText || selectedSlot?.alt || ''}
          maxWidth={selectedRule.maxWidth}
          onReplace={uploadFromModal}
        />
      </Stack>
    </Paper>
  );
};
