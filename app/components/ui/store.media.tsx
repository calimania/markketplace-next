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
import { IconUpload, IconPhoto, IconArrowLeft, IconArrowRight, IconTrash, IconDeviceFloppy } from '@tabler/icons-react';
import { Store, Media } from '@/markket/store';
import { markketClient } from '@/markket/api';

interface StoreMediaProps {
  store: Store;
  onUpdate: (file: Media, field: string, id: number | string) => void;
  onRefresh?: () => Promise<void> | void;
  onSaveSlides?: (slides: Store['Slides']) => Promise<void> | void;
}

type UploadField = 'Logo' | 'Favicon' | 'SEO.socialImage' | 'Cover' | 'Slides';
type LoadingField = 'logo' | 'favicon' | 'social' | 'slides' | null;
type SlideMedia = Store['Slides'][number];

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
  const [selectedSlotId, setSelectedSlotId] = useState('Logo');
  const [altText, setAltText] = useState('');
  const [draftSlides, setDraftSlides] = useState<SlideMedia[]>(Array.isArray(store.Slides) ? store.Slides : []);
  const client = new markketClient();

  useEffect(() => {
    setDraftSlides(Array.isArray(store.Slides) ? store.Slides : []);
  }, [store.documentId, store.Slides]);

  const getSlideSlotId = (slide: SlideMedia, index: number) => `slide-${slide.documentId || slide.id || index}`;

  const slots: MediaSlot[] = [
    {
      id: 'Logo',
      label: 'Logo',
      field: 'Logo',
      src: store.Logo?.url,
      alt: store.Logo?.alternativeText || 'Store logo',
      mediaId: store.Logo?.id,
    },
    {
      id: 'Favicon',
      label: 'Favicon',
      field: 'Favicon',
      src: store.Favicon?.url,
      alt: store.Favicon?.alternativeText || 'Store favicon',
      mediaId: store.Favicon?.id,
    },
    {
      id: 'Cover',
      label: 'Cover',
      field: 'Cover',
      src: store.Cover?.url,
      alt: store.Cover?.alternativeText || 'Store cover',
      mediaId: store.Cover?.id,
    },
    {
      id: 'SEO.socialImage',
      label: 'Social',
      field: 'SEO.socialImage',
      src: store.SEO?.socialImage?.url,
      alt: store.SEO?.socialImage?.alternativeText || 'Store social image',
      mediaId: store.SEO?.socialImage?.id,
    },
    ...draftSlides.slice(0, 8).map((slide, index) => ({
      id: getSlideSlotId(slide, index),
      label: `Slide ${index + 1}`,
      field: 'Slides' as UploadField,
      src: slide.formats?.small?.url || slide.url,
      alt: slide.alternativeText || `Slide ${index + 1}`,
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

  const handleUpload = async (file: File, field: UploadField) => {
    if (!store?.id) return;

    try {
      setLoading(toLoadingField(field));

      const response = await client.uploadImage(
        file,
        field,
        store.id,
        altText.trim() || `${store.title || store.slug || 'Store'} ${field}`,
        'api::store.store',
        store.id || store.documentId
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      notifications.show({
        title: 'Success',
        message: `Store ${field?.toLowerCase()} updated successfully`,
        color: 'green',
      });

      const json = await response.json();

      const uploaded = json?.[0] as Media | undefined;
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
        message: `Failed to upload ${field?.toLowerCase()}`,
        color: 'red',
      });
    } finally {
      setLoading(null);
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
      await onSaveSlides(draftSlides);
      notifications.show({
        title: 'Slides saved',
        message: 'Slides order and removals were saved.',
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
    const mediaId = selectedSlot?.mediaId;
    const storeId = store.documentId || store.id;

    if (!mediaId || !storeId) return;

    try {
      setSavingAlt(true);
      const nextAlt = altText.trim();

      const response = await client.updateImageAltText(mediaId, nextAlt, storeId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to save alt text');
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
                  key={selectedSlot?.id}
                  style={{
                    height: 340,
                    borderRadius: 10,
                    border: '1px solid rgba(15,23,42,0.12)',
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
                  {loading && (
                    <Box
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
                    <Stack align="center" gap={4}>
                      <IconPhoto size={30} opacity={0.45} />
                      <Text size="sm" c="dimmed">Click to upload {selectedSlot.label}</Text>
                    </Stack>
                  )}
                  {selectedSlot?.src && (
                    <img
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

                <TextInput
                  label="Alt text"
                  description="Used when you upload or replace this selected image."
                  placeholder={`Describe ${selectedSlot.label.toLowerCase()} image`}
                  value={altText}
                  onChange={(event) => setAltText(event.currentTarget.value)}
                  size="xs"
                />

                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed">Save alt text for this selected image.</Text>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={saveAltText}
                    loading={savingAlt}
                    disabled={!selectedSlot?.mediaId || !hasAltDraftChanges || savingAlt}
                  >
                    Save Alt Text
                  </Button>
                </Group>

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
                        disabled={!hasSlideDraftChanges || savingSlides}
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
      </Stack>
    </Paper>
  );
};
