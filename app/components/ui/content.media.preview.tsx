'use client';

import { useRef, useState } from 'react';
import { Badge, Box, Group, Stack, Text, Tooltip, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { tiendaClient } from '@/markket/api.tienda';
import { markketColors } from '@/markket/colors.config';

const MAX_UPLOAD_EDGE = 1920;
const MAX_UPLOAD_BYTES = 1_500_000;

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

function readAuthToken() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('markket.auth');
    return raw ? JSON.parse(raw)?.jwt || '' : '';
  } catch {
    return '';
  }
}

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

/** A single thumbnail slot — shows image or empty placeholder, accepts file drop */
function MediaSlot({
  slot,
  storeRef,
  contentType,
  itemDocumentId,
  onUpload,
}: {
  slot: ContentMediaSlot;
  storeRef: string;
  contentType: string;
  itemDocumentId: string;
  onUpload?: (field: string, url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(slot.src);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (slot.disabled) {
      notifications.show({
        title: 'Upload unavailable',
        message: slot.disabledMessage || `${slot.label} cannot be uploaded here yet.`,
        color: 'yellow',
      });
      return;
    }

    const token = readAuthToken();
    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    try {
      setUploading(true);
      const optimizedFile = await optimizeImageBeforeUpload(file);

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
        console.log('[ContentMediaPreview] uploading with attach candidate:', attach);
        const candidateResult = await tiendaClient.uploadStoreMedia(storeRef, {
          token,
          files: [optimizedFile],
          alternativeText: slot.alt || slot.label,
          attach,
        });

        console.log('[ContentMediaPreview] upload result:', {
          attach,
          ok: candidateResult?.ok,
          status: candidateResult?.status,
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
      const url = uploaded?.formats?.small?.url || uploaded?.url;
      if (url) {
        setPreview(url);
        onUpload?.(slot.field, url);
      }

      notifications.show({
        title: 'Uploaded',
        message: `${slot.label} updated (optimized for web).`,
        color: 'green',
        autoClose: 2500,
      });
    } catch (err) {
      console.error('[ContentMediaPreview] upload failed', err);
      notifications.show({
        title: 'Upload failed',
        message: err instanceof Error ? err.message : 'Something went wrong.',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Tooltip
      label={
        slot.disabled
          ? (slot.disabledMessage || `${slot.label} is preview-only right now`)
          : uploading
            ? 'Uploading…'
            : `Click to upload ${slot.label}`
      }
      withArrow
    >
      <Box
        onClick={() => {
          if (slot.disabled) {
            notifications.show({
              title: 'Preview only',
              message: slot.disabledMessage || `${slot.label} is not editable here yet.`,
              color: 'yellow',
            });
            return;
          }

          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        style={{
          width: rem(80),
          height: rem(80),
          borderRadius: rem(10),
          border: `2px dashed ${preview ? markketColors.sections.about.main : '#d0d0d0'}`,
          background: preview ? 'transparent' : markketColors.sections.about.light,
          overflow: 'hidden',
          cursor: slot.disabled ? 'not-allowed' : uploading ? 'wait' : 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s, opacity 0.15s',
          opacity: slot.disabled ? 0.7 : uploading ? 0.6 : 1,
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

        {/* upload hover overlay */}
        <Box
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: slot.disabled ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          className="media-slot-overlay"
        >
          <IconUpload size={18} color="#fff" />
        </Box>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
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
  return (
    <Stack gap="xs">
      <Group gap="xs" align="center">
        <IconPhoto size={14} color={markketColors.sections.about.main} />
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">Image Manager</Text>
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
        {slots.map((slot, index) => (
          <Stack key={`${slot.field}-${slot.label}-${index}`} gap={4} align="center">
            <MediaSlot
              slot={slot}
              storeRef={storeRef}
              contentType={contentType}
              itemDocumentId={itemDocumentId}
              onUpload={onUpload}
            />
            <Text size="xs" c="dimmed" ta="center" style={{ fontSize: rem(10) }}>
              {slot.label}
            </Text>
          </Stack>
        ))}
      </Group>

      <style>{`
        .media-slot-overlay { opacity: 0 !important; }
        [data-slot]:hover .media-slot-overlay { opacity: 1 !important; }
      `}</style>
    </Stack>
  );
}
