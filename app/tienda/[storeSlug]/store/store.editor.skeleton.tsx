'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Badge, Button, Group, Image, Paper, Skeleton, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconExternalLink, IconPalette, IconPencilX, IconUsers } from '@tabler/icons-react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import URLsInput from '@/app/components/ui/form.input.urls';
import type { URLItem } from '@/app/components/ui/form.input.urls';
import RichTextContent from '@/app/components/ui/richtext.content';
import { buildEditorMediaPreview } from '@/markket/richtext.smart';
import type { Store } from '@/markket/store';
import { markketplace } from '@/markket/config';

type StoreEditorSkeletonProps = {
  store: Store;
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  editorNotice: string | null;
  draftTitle: string;
  draftSlug: string;
  draftDescription: string;
  draftUrls: URLItem[];
  draftSeoTitle: string;
  draftSeoDescription: string;
  isPublished: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUrlsChange: (value: URLItem[]) => void;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
};

export default function StoreEditorSkeleton({
  store,
  isEditing,
  isSaving,
  saveError,
  editorNotice,
  draftTitle,
  draftSlug,
  draftDescription,
  draftUrls,
  draftSeoTitle,
  draftSeoDescription,
  isPublished,
  onStartEditing,
  onCancelEditing,
  onSave,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onUrlsChange,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: StoreEditorSkeletonProps) {
  const activeSlug = isEditing ? (draftSlug || store.slug) : store.slug;
  const publicHref = `${markketplace.markket_url}/${activeSlug}`;
  const mediaPreview = useMemo(() => buildEditorMediaPreview(draftDescription), [draftDescription]);

  useEffect(() => {
    if (!isEditing || typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (!isSaving) {
          onSave();
        }
        return;
      }

      if (event.key === 'Escape' && !isSaving) {
        event.preventDefault();
        onCancelEditing();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditing, isSaving, onCancelEditing, onSave]);

  const hasMediaPreview =
    !!mediaPreview.excerpt ||
    mediaPreview.imageThumbnails.length > 0 ||
    mediaPreview.embeds.length > 0 ||
    mediaPreview.urlCount > 0;

  return (
    <Stack gap="sm">
      <TinyBreadcrumbs
        items={[
          { label: 'Me', href: '/me' },
          { label: 'Tienda', href: '/tienda' },
          { label: store.slug, href: `/tienda/${store.slug}` },
          { label: 'Store' },
        ]}
      />

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>Store Details</Title>
          <Text size="xs" c="dimmed" mt={4}>
            Manage store identity, storefront metadata, and the public URL people will actually visit.
          </Text>
        </div>
        <Group gap="xs">
          <Badge variant="light" color={isPublished ? 'green' : 'gray'}>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
          <Badge variant="light" color="cyan">Tendero</Badge>
        </Group>
      </Group>

      <Group>
        <Button component={Link} href={`/tienda/${store.slug}`} variant="default" leftSection={<IconArrowLeft size={16} />}>
          Back
        </Button>
        <Button component={Link} href={publicHref} target="_blank" rel="noopener noreferrer" leftSection={<IconExternalLink size={16} />} variant="light" color="cyan">
          View live site
        </Button>
        <Button component={Link} href={`/tienda/${store.slug}/design-system`} target="_blank" rel="noopener noreferrer" variant="default" leftSection={<IconPalette size={16} />}>
          View design system
        </Button>
        <Button component={Link} href={`/tienda/${store.slug}/team`} variant="default" leftSection={<IconUsers size={16} />}>
          Team
        </Button>
        {!isEditing && (
          <Button onClick={onStartEditing} leftSection={<IconEdit size={16} />}>
            Edit
          </Button>
        )}
        {isEditing && (
          <Badge variant="light" color="blue">
            Save: Cmd/Ctrl+S • Cancel: Esc
          </Badge>
        )}
      </Group>

      {saveError && (
        <Paper withBorder radius="md" p="md">
          <Text size="sm" c="red">{saveError}</Text>
        </Paper>
      )}

      {editorNotice && (
        <Paper withBorder radius="md" p="md" bg="blue.0">
          <Text size="sm" c="blue.8">{editorNotice}</Text>
        </Paper>
      )}

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Text fw={600}>Shared URL</Text>
          <Text c="dimmed" size="sm">
            This is the storefront link you can share publicly.
          </Text>
          <TextInput value={publicHref} readOnly type="url" />
          {!isEditing && (
            <Text size="xs" c="dimmed">Tip: use Edit or double-click any section below.</Text>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        radius="md"
        p="md"
        role={!isEditing ? 'button' : undefined}
        tabIndex={!isEditing ? 0 : undefined}
        onDoubleClick={!isEditing ? onStartEditing : undefined}
        onKeyDown={!isEditing ? ((event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onStartEditing();
          }
        }) : undefined}
        style={!isEditing ? { cursor: 'pointer' } : undefined}
        aria-label={!isEditing ? 'Open edit mode from SEO section' : undefined}
        title={!isEditing ? 'Double-click to edit' : undefined}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text fw={600}>Identity</Text>
            <Badge variant="light" color="yellow">Step 1</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            Start with the basic fields first. Title, slug, and description can be the first tienda-native editing milestone.
          </Text>

          {isEditing ? (
            <div className="form-cols">
              <TextInput
                label="Store Title"
                value={draftTitle}
                onChange={(event) => onTitleChange(event.currentTarget.value)}
                autoFocus
              />
              <TextInput
                label="Slug"
                value={draftSlug}
                onChange={(event) => onSlugChange(event.currentTarget.value)}
                description="Lowercase letters, numbers, and dashes only."
              />
            </div>
          ) : (
            <>
                <TextInput
                  label="Store Title"
                  value={draftTitle}
                  onChange={(event) => onTitleChange(event.currentTarget.value)}
                  readOnly
                />
                <TextInput
                  label="Slug"
                  value={draftSlug}
                  onChange={(event) => onSlugChange(event.currentTarget.value)}
                  readOnly
                  description="Lowercase letters, numbers, and dashes only."
                />
            </>
          )}

          {isEditing && (
            <Group justify="flex-end">
              <Button variant="default" onClick={onCancelEditing} leftSection={<IconPencilX size={16} />}>
                Discard
              </Button>
              <Button onClick={onSave} loading={isSaving} leftSection={<IconDeviceFloppy size={16} />}>
                Save
              </Button>
            </Group>
          )}

          {isEditing ? (
            <Stack gap="sm">
              <ContentEditor
                label="Description"
                description="Rich text (Strapi richtext) powered by Tiptap."
                placeholder="Tell people what this store is about."
                value={draftDescription}
                onChange={(value) => onDescriptionChange(typeof value === 'string' ? value : '')}
                format="html"
                minHeight={220}
              />

              {hasMediaPreview && (
                <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={600} size="sm">Compact Media Summary</Text>
                      <Badge variant="light" color="gray">{mediaPreview.urlCount} links</Badge>
                    </Group>

                    {!!mediaPreview.excerpt && (
                      <Text size="xs" c="dimmed">{mediaPreview.excerpt}</Text>
                    )}

                    {mediaPreview.imageThumbnails.length > 0 && (
                      <Stack gap={6}>
                        <Text size="xs" fw={500}>Thumbnails</Text>
                        <Group gap={6}>
                          {mediaPreview.imageThumbnails.map((image, index) => (
                            <Image
                              key={`${image.src}-${index}`}
                              src={image.src}
                              alt={image.alt || `preview-${index}`}
                              h={54}
                              w={54}
                              radius="sm"
                              fit="cover"
                            />
                          ))}
                        </Group>
                      </Stack>
                    )}

                    {mediaPreview.embeds.length > 0 && (
                      <Stack gap={6}>
                        <Text size="xs" fw={500}>Embeds</Text>
                        <Group gap={6}>
                          {mediaPreview.embeds.map((embed) => (
                            <Badge key={`${embed.provider}-${embed.id}`} variant="light" color="violet">
                              {embed.provider}:{embed.id.slice(0, 10)}
                            </Badge>
                          ))}
                        </Group>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>
          ) : (
              <div
                role="button"
                tabIndex={0}
                onDoubleClick={onStartEditing}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onStartEditing();
                  }
                }}
                style={{ cursor: 'pointer' }}
                aria-label="Open edit mode"
                title="Double-click to edit"
              >
              <Text size="sm" fw={500} mb={6}>Description</Text>
              {draftDescription?.trim() ? (
                <RichTextContent content={draftDescription} />
              ) : (
                <Text c="dimmed" size="sm">No description yet.</Text>
              )}
                <Text size="xs" c="dimmed" mt={8}>Double-click this section to edit.</Text>
            </div>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        radius="md"
        p="md"
        role={!isEditing ? 'button' : undefined}
        tabIndex={!isEditing ? 0 : undefined}
        onDoubleClick={!isEditing ? onStartEditing : undefined}
        onKeyDown={!isEditing ? ((event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onStartEditing();
          }
        }) : undefined}
        style={!isEditing ? { cursor: 'pointer' } : undefined}
        aria-label={!isEditing ? 'Open edit mode from SEO section' : undefined}
        title={!isEditing ? 'Double-click to edit' : undefined}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600}>SEO</Text>
            <Badge variant="light" color="grape">Bottom section</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            Keep metadata concise and intentional. This block stays at the bottom to avoid jumping around while editing core content.
          </Text>

          <TextInput
            label="SEO Title"
            value={draftSeoTitle}
            onChange={(event) => onSeoTitleChange(event.currentTarget.value)}
            readOnly={!isEditing}
          />

          <Textarea
            label="SEO Description"
            value={draftSeoDescription}
            onChange={(event) => onSeoDescriptionChange(event.currentTarget.value)}
            minRows={4}
            readOnly={!isEditing}
            styles={{ input: { resize: 'none' } }}
            description={`${draftSeoDescription.length}/160 characters`}
          />

          <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
            <Stack gap={4}>
              <Text size="sm" fw={600}>Search Card</Text>
              <Text size="sm" c="blue" fw={500}>{draftSeoTitle || draftTitle || store.title}</Text>
              <Text size="xs" c="green">{publicHref}</Text>
              <Text size="sm" c="dimmed">
                {draftSeoDescription || 'Add a concise description to shape how this tienda appears in search and social cards.'}
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600}>Links</Text>
            <Badge variant="light" color="cyan">Store URLs</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            Add website and social links that show on the public store page.
          </Text>

          {isEditing ? (
            <URLsInput
              label="Store Links"
              description="Website, Instagram, X, YouTube, and any other links you want to feature."
              value={draftUrls}
              onChange={onUrlsChange}
            />
          ) : draftUrls.length > 0 ? (
            <URLsInput
              label="Store Links"
              description="Public links currently shown on the storefront."
              value={draftUrls}
              onChange={() => undefined}
              readOnly
            />
          ) : (
            <Text c="dimmed" size="sm">No public links yet.</Text>
          )}
        </Stack>
      </Paper>

      {isEditing && (
        <Paper
          withBorder
          radius="xl"
          p="xs"
          style={{
            position: 'sticky',
            bottom: 10,
            zIndex: 30,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.96))',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 6px 22px rgba(0, 0, 0, 0.10)',
          }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">Editing in progress</Text>
            <Group>
              <Button
                variant="default"
                onClick={onCancelEditing}
                leftSection={<IconPencilX size={16} />}
                aria-keyshortcuts="Escape"
              >
                Discard
              </Button>
              <Button
                onClick={onSave}
                loading={isSaving}
                leftSection={<IconDeviceFloppy size={16} />}
                aria-keyshortcuts="Meta+S Control+S"
              >
                Save
              </Button>
            </Group>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
