'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge, Box, Group, Stack, Text, Tooltip, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhoto } from '@tabler/icons-react';
import { tiendaClient } from '@/markket/api.tienda';
import { markketColors } from '@/markket/colors.config';
import { readTiendaAuthToken } from '@/markket/helpers.tienda';
import ImageModal from '@/markket/components/image.modal';

const MAX_UPLOAD_EDGE = 1920;
const MAX_UPLOAD_BYTES = 1_500_000;

function sanitizeMediaToken(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function withSearchableUploadName({
  file,
  storeRef,
  contentType,
  itemDocumentId,
  field,
}: {
  file: File;
  storeRef: string;
  contentType: string;
  itemDocumentId: string;
  field: string;
}) {
  const extension = (file.name.split('.').pop() || (file.type.includes('png') ? 'png' : file.type.includes('jpeg') ? 'jpg' : 'webp')).toLowerCase();
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const parts = [
    sanitizeMediaToken(String(storeRef || 'store')),
    sanitizeMediaToken(contentType || 'content'),
    sanitizeMediaToken(itemDocumentId || 'item'),
    sanitizeMediaToken(field || 'media'),
    Date.now().toString(),
    sanitizeMediaToken(baseName || 'image'),
  ].filter(Boolean);

  const nextName = `${parts.join('__')}.${extension}`;

  return new File([file], nextName, {
    type: file.type,
    lastModified: Date.now(),
  });
}

export type ContentMediaSlot = {
  /** Display label shown below the thumbnail */
  label: string;
  /** Strapi field path, e.g. 'SEO.socialImage' */
  field: string;
  /** Existing image URL (if any) */
  src?: string;
  /** Alt text */
  alt?: string;
  /** Disable uploads for this slot while still showing the preview */
  disabled?: boolean;
  /** Optional reason shown when a disabled slot is clicked */
  disabledMessage?: string;
};

type ContentMediaPreviewProps = {
  storeRef: string;
  contentType: string;
  itemDocumentId: string;
  slots: ContentMediaSlot[];
  /** Called after a successful upload so the parent can refresh */
  onUpload?: (field: string, url: string) => void;
  /** href for the "Open Media Studio" link */
  studioHref?: string;
};

function resolveContentTypeCandidates(contentType: string) {
  const normalized = (contentType || '').trim().toLowerCase();
  if (normalized === 'event') return ['event', 'events'];
  if (normalized === 'article') return ['article', 'articles'];
  if (normalized === 'page') return ['page', 'pages'];
  if (!normalized) return ['event'];
  return [normalized];
}

function buildAttachCandidates(field: string, contentType: string) {
  const normalizedField = (field || '').trim().toLowerCase();
  const contentTypes = resolveContentTypeCandidates(contentType);
  const normalizedType = (contentType || '').trim().toLowerCase();

  if (normalizedField === 'slides') {
    return contentTypes.map((candidateType) => ({
      contentType: candidateType,
      field: 'Slides',
      mode: 'append' as const,
    }));
  }

  if (normalizedField === 'seo.socialimage') {
    return contentTypes.map((candidateType) => ({
      contentType: candidateType,
      field: 'SEO.socialImage',
      mode: 'replace' as const,
    }));
  }

  if (normalizedField === 'cover' && normalizedType === 'article') {
    return contentTypes.flatMap((candidateType) => [
      { contentType: candidateType, field: 'cover', mode: 'replace' as const },
      { contentType: candidateType, field: 'Cover', mode: 'replace' as const },
    ]);
  }

  return contentTypes.map((candidateType) => ({
    contentType: candidateType,
    field,
    mode: 'replace' as const,
  }));
}

async function optimizeImageBeforeUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const imageBitmap = await createImageBitmap(file);
  const maxEdge = Math.max(imageBitmap.width, imageBitmap.height);
  const scale = maxEdge > MAX_UPLOAD_EDGE ? MAX_UPLOAD_EDGE / maxEdge : 1;
  const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) return file;

  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  const toBlob = (quality?: number) => new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), outputType, quality);
  });

  let blob = await toBlob(outputType === 'image/jpeg' ? 0.88 : undefined);
  if (!blob) return file;

  if (outputType === 'image/jpeg' && blob.size > MAX_UPLOAD_BYTES) {
    const qualitySteps = [0.8, 0.72, 0.64, 0.56, 0.5];
    for (const quality of qualitySteps) {
      const next = await toBlob(quality);
      if (!next) continue;
      blob = next;
      if (blob.size <= MAX_UPLOAD_BYTES) break;
    }
  }

  const ext = outputType === 'image/png' ? 'png' : 'jpg';
  const nextName = file.name.replace(/\.[^.]+$/, '') + `.${ext}`;

  return new File([blob], nextName, {
    type: outputType,
    lastModified: Date.now(),
  });
}

async function uploadContentMediaSlotImage({
  storeRef,
  contentType,
  itemDocumentId,
  slot,
  file,
}: {
  storeRef: string;
  contentType: string;
  itemDocumentId: string;
  slot: ContentMediaSlot;
  file: File;
}) {
  const token = readTiendaAuthToken();
  if (!token) {
    throw new Error('Please sign in again.');
  }

  const optimizedFile = await optimizeImageBeforeUpload(file);
  const namedFile = withSearchableUploadName({
    file: optimizedFile,
    storeRef,
    contentType,
    itemDocumentId,
    field: slot.field,
  });

  const attachCandidates = buildAttachCandidates(slot.field, contentType).map((attach) => ({
    ...attach,
    ...(itemDocumentId ? { itemId: itemDocumentId } : {}),
  }));

  if (attachCandidates.length === 0) {
    throw new Error(slot.disabledMessage || `${slot.label} uploads are not supported for ${contentType} yet.`);
  }

  let result: any = null;
  let lastErrorMessage = 'Upload failed';

  for (const attach of attachCandidates) {
    const candidateResult = await tiendaClient.uploadStoreMedia(storeRef, {
      token,
      files: [namedFile],
      alternativeText: slot.alt || slot.label,
      attach,
    });

    if (candidateResult?.ok) {
      result = candidateResult;
      break;
    }

    lastErrorMessage = candidateResult?.message || candidateResult?.text || lastErrorMessage;
  }

  if (!result?.ok) {
    throw new Error(lastErrorMessage);
  }

  const uploaded = result?.data?.[0];
  return uploaded?.formats?.small?.url || uploaded?.url || '';
}

function MediaSlot({
  slot,
  uploading,
  saved,
  onOpenEditor,
}: {
  slot: ContentMediaSlot;
  uploading?: boolean;
  saved?: boolean;
  onOpenEditor?: () => void;
}) {
  const preview = slot.src;

  return (
    <Tooltip
      label={
        uploading
          ? `${slot.label} is uploading...`
          : saved
            ? `${slot.label} saved`
            :
        slot.disabled
          ? (slot.disabledMessage || `${slot.label} is preview-only right now`)
              : `Click to edit ${slot.label}`
      }
      withArrow
    >
      <Box
        onClick={() => {
          if (uploading) {
            return;
          }

          if (slot.disabled) {
            notifications.show({
              title: 'Preview only',
              message: slot.disabledMessage || `${slot.label} is not editable here yet.`,
              color: 'yellow',
            });
            return;
          }

          onOpenEditor?.();
        }}
        style={{
          width: rem(80),
          height: rem(80),
          borderRadius: rem(10),
          border: `2px dashed ${preview ? markketColors.sections.about.main : '#d0d0d0'}`,
          background: preview ? 'transparent' : markketColors.sections.about.light,
          overflow: 'hidden',
          cursor: uploading ? 'progress' : (slot.disabled ? 'not-allowed' : 'pointer'),
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s, opacity 0.15s, box-shadow 0.15s',
          opacity: slot.disabled ? 0.7 : 1,
          boxShadow: 'none',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={slot.alt || slot.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Stack gap={4} align="center">
            <IconPhoto size={22} color="#9E9E9E" />
            <Text size="xs" c="dimmed" ta="center" lh={1.2} style={{ fontSize: rem(9) }}>
              {slot.label}
            </Text>
          </Stack>
        )}

        {uploading && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.62)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Badge size="xs" color="grape" variant="filled">Uploading...</Badge>
          </Box>
        )}

        {!uploading && saved && (
          <Box
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
            }}
          >
            <Badge size="xs" color="teal" variant="filled">Saved</Badge>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}

/**
 * Reusable thumbnail strip for any tienda content type.
 * Shows labelled slots — filled or empty — and handles inline upload.
 *
 * @example
 * <ContentMediaPreview
 *   storeRef={store.documentId}
 *   contentType="page"
 *   itemDocumentId={page.documentId}
 *   slots={[{ label: 'Social', field: 'SEO.socialImage', src: page.SEO?.socialImage?.url }]}
 *   studioHref={`/tienda/${storeSlug}/snapshot`}
 * />
 */
export default function ContentMediaPreview({
  storeRef,
  contentType,
  itemDocumentId,
  slots,
  onUpload,
  studioHref,
}: ContentMediaPreviewProps) {
  const slotKey = (slot: ContentMediaSlot, index: number) => `${slot.field}-${slot.label}-${index}`;
  const [selectedSlotKey, setSelectedSlotKey] = useState(slots[0] ? slotKey(slots[0], 0) : '');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const [savedSlotKey, setSavedSlotKey] = useState<string | null>(null);
  const [slotPreviewOverrides, setSlotPreviewOverrides] = useState<Record<string, string>>({});
  const [slotAltOverrides, setSlotAltOverrides] = useState<Record<string, string>>({});
  const slotBlobPreviewsRef = useRef<Record<string, string>>({});
  const savedBadgeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedSlotKey(slots[0] ? slotKey(slots[0], 0) : '');
  }, [slots]);

  useEffect(() => {
    return () => {
      if (savedBadgeTimerRef.current) {
        window.clearTimeout(savedBadgeTimerRef.current);
      }

      Object.values(slotBlobPreviewsRef.current).forEach((blobUrl) => {
        if (blobUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
      });
      slotBlobPreviewsRef.current = {};
    };
  }, []);

  const setSlotPreview = (key: string, nextUrl: string, isBlobPreview: boolean) => {
    const previousBlobUrl = slotBlobPreviewsRef.current[key];
    if (previousBlobUrl && previousBlobUrl !== nextUrl) {
      URL.revokeObjectURL(previousBlobUrl);
      delete slotBlobPreviewsRef.current[key];
    }

    if (isBlobPreview && nextUrl.startsWith('blob:')) {
      slotBlobPreviewsRef.current[key] = nextUrl;
    }

    setSlotPreviewOverrides((current) => ({
      ...current,
      [key]: nextUrl,
    }));
  };

  const clearSlotPreviewOverride = (key: string) => {
    const previousBlobUrl = slotBlobPreviewsRef.current[key];
    if (previousBlobUrl) {
      URL.revokeObjectURL(previousBlobUrl);
      delete slotBlobPreviewsRef.current[key];
    }

    setSlotPreviewOverrides((current) => {
      if (!(key in current)) return current;
      const { [key]: _removed, ...rest } = current;
      return rest;
    });
  };

  const normalizedSlots = slots.map((slot, index) => {
    const key = slotKey(slot, index);
    return {
      ...slot,
      src: slotPreviewOverrides[key] ?? slot.src,
      alt: slotAltOverrides[key] ?? slot.alt,
      key,
    };
  });

  const selectedSlotEntry = normalizedSlots.find((slot) => slot.key === selectedSlotKey) || normalizedSlots[0];

  const uploadFromModal = async ({ url, img, alt }: { url?: string; img?: File; alt?: string }) => {
    if (!selectedSlotEntry) return;

    try {
      setUploadingSlotKey(selectedSlotEntry.key);
      const nextAlt = (alt || '').trim();
      if (nextAlt) {
        setSlotAltOverrides((current) => ({
          ...current,
          [selectedSlotEntry.key]: nextAlt,
        }));
      }

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
        nextFile = new File([blob], `media-image.${extension}`, {
          type: mime,
          lastModified: Date.now(),
        });
      }

      if (!nextFile) {
        throw new Error('No image to upload');
      }

      setSlotPreview(selectedSlotEntry.key, URL.createObjectURL(nextFile), true);

      const nextUrl = await uploadContentMediaSlotImage({
        storeRef,
        contentType,
        itemDocumentId,
        slot: selectedSlotEntry,
        file: nextFile,
      });

      if (nextUrl) {
        setSlotPreview(selectedSlotEntry.key, nextUrl, false);
        setSavedSlotKey(selectedSlotEntry.key);
        if (savedBadgeTimerRef.current) {
          window.clearTimeout(savedBadgeTimerRef.current);
        }
        savedBadgeTimerRef.current = window.setTimeout(() => {
          setSavedSlotKey((current) => (current === selectedSlotEntry.key ? null : current));
        }, 2200);
        onUpload?.(selectedSlotEntry.field, nextUrl);
      }

      setImageModalOpen(false);
    } catch (error) {
      if (selectedSlotEntry.src) {
        setSlotPreview(selectedSlotEntry.key, selectedSlotEntry.src, false);
      } else {
        clearSlotPreviewOverride(selectedSlotEntry.key);
      }
      console.error('content.media.modal.upload.failed', error);
      notifications.show({
        title: 'Could not apply image work',
        message: error instanceof Error ? error.message : 'Try again in a moment.',
        color: 'red',
      });
    } finally {
      setUploadingSlotKey(null);
    }
  };

  return (
    <Stack gap="xs">
      <Group gap="xs" align="center">
        <IconPhoto size={14} color={markketColors.sections.about.main} />
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">Image Manager</Text>
        {uploadingSlotKey && (
          <Badge size="xs" color="grape" variant="light">Uploading image...</Badge>
        )}
        {studioHref && (
          <Badge
            component="a"
            href={studioHref}
            size="xs"
            variant="light"
            color="cyan"
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            Open Studio
          </Badge>
        )}
      </Group>

      <Group gap="sm" wrap="wrap">
        {normalizedSlots.map((slot) => (
          <Stack key={slot.key} gap={4} align="center">
            <MediaSlot
              slot={slot}
              uploading={uploadingSlotKey === slot.key}
              saved={savedSlotKey === slot.key}
              onOpenEditor={() => {
                setSelectedSlotKey(slot.key);
                setImageModalOpen(true);
              }}
            />
            <Text size="xs" c="dimmed" ta="center" style={{ fontSize: rem(10) }}>
              {slot.label}
            </Text>
          </Stack>
        ))}
      </Group>

      <ImageModal
        imageModalOpen={imageModalOpen}
        handleCloseModal={() => setImageModalOpen(false)}
        imageUrl={selectedSlotEntry?.src || ''}
        imageAlt={selectedSlotEntry?.alt || ''}
        maxWidth={1920}
        onReplace={uploadFromModal}
      />

    </Stack>
  );
}
