'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge, Button, Group, Image, Paper, Skeleton, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconDeviceFloppy, IconEdit, IconExternalLink, IconPalette, IconPencilX, IconSparkles } from '@tabler/icons-react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import RichTextContent from '@/app/components/ui/richtext.content';
import { buildEditorMediaPreview } from '@/markket/richtext.smart';
import type { Store } from '@/markket/store';

type StoreEditorSkeletonProps = {
  store: Store;
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  editorNotice: string | null;
  draftTitle: string;
  draftSlug: string;
  draftDescription: string;
  draftSeoTitle: string;
  draftSeoDescription: string;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
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
  draftSeoTitle,
  draftSeoDescription,
  onStartEditing,
  onCancelEditing,
  onSave,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: StoreEditorSkeletonProps) {
  const activeSlug = isEditing ? (draftSlug || store.slug) : store.slug;
  const publicHref = `/${activeSlug}`;
  const mediaPreview = useMemo(() => buildEditorMediaPreview(draftDescription), [draftDescription]);
  const hasMediaPreview =
    !!mediaPreview.excerpt ||
    mediaPreview.imageThumbnails.length > 0 ||
    mediaPreview.embeds.length > 0 ||
    mediaPreview.urlCount > 0;

  return (
    <Stack gap="md">
      <TinyBreadcrumbs
        items={[
          { label: 'Tienda', href: '/tienda' },
          { label: store.slug, href: `/tienda/${store.slug}` },
          { label: 'Store' },
        ]}
      />

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>Store Details</Title>
          <Text c="dimmed" mt={2}>
            <span className="accent-blue">/tienda/{store.slug}/store</span>
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Manage store identity, storefront metadata, and the public URL people will actually visit.
          </Text>
        </div>
        <Badge variant="light" color="cyan">Tendero</Badge>
      </Group>

      <Group>
        <Button component={Link} href={publicHref} target="_blank" rel="noopener noreferrer" leftSection={<IconExternalLink size={16} />} variant="light" color="cyan">
          Open in Markket
        </Button>
        <Button component={Link} href={`/tienda/${store.slug}/design-system`} target="_blank" rel="noopener noreferrer" variant="default" leftSection={<IconPalette size={16} />}>
          Open Design System
        </Button>
        {!isEditing && (
          <Button onClick={onStartEditing} leftSection={<IconEdit size={16} />}>
            Edit
          </Button>
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
            This is the storefront link you can preview and share publicly.
          </Text>
          <TextInput value={publicHref} readOnly type="url" />
          {!isEditing && (
            <Text size="xs" c="dimmed">Tip: use the Edit button or double-click any preview section below.</Text>
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
            <Badge variant="light" color="grape">Simple fields</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            These are the first metadata controls for the storefront. Keep them short, descriptive, and aligned with what people should find.
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
            minRows={3}
            autosize
            readOnly={!isEditing}
            description={`${draftSeoDescription.length}/160 characters`}
          />

          <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
            <Stack gap={4}>
              <Text size="sm" fw={600}>Search Preview</Text>
              <Text size="sm" c="blue" fw={500}>{draftSeoTitle || draftTitle || store.title}</Text>
              <Text size="xs" c="green">{publicHref}</Text>
              <Text size="sm" c="dimmed">
                {draftSeoDescription || 'Add a concise description to shape how this tienda appears in search and social previews.'}
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600}>Identity</Text>
            <Badge variant="light" color="yellow">Step 1</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            Start with the basic fields first. Title, slug, and description can be the first tienda-native editing milestone.
          </Text>
          <TextInput
            label="Store Title"
            value={draftTitle}
            onChange={(event) => onTitleChange(event.currentTarget.value)}
            readOnly={!isEditing}
          />
          <TextInput
            label="Slug"
            value={draftSlug}
            onChange={(event) => onSlugChange(event.currentTarget.value)}
            readOnly={!isEditing}
            description="Lowercase letters, numbers, and dashes only."
          />

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

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600}>Next Sections</Text>
            <Badge variant="light" color="grape" leftSection={<IconSparkles size={12} />}>
              Coming next
            </Badge>
          </Group>
          <Text c="dimmed" size="sm">
            We can iterate this into richer modules for visual assets, SEO, links, storefront settings, and long-form content in steps.
          </Text>
          <Skeleton height={42} radius="md" />
          <Skeleton height={84} radius="md" />
          <Skeleton height={42} radius="md" />
        </Stack>
      </Paper>

      {isEditing && (
        <Paper
          withBorder
          radius="xl"
          p="sm"
          style={{
            position: 'sticky',
            bottom: 12,
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">Editing in progress</Text>
            <Group>
              <Button variant="default" onClick={onCancelEditing} leftSection={<IconPencilX size={16} />}>
                Discard
              </Button>
              <Button onClick={onSave} loading={isSaving} leftSection={<IconDeviceFloppy size={16} />}>
                Save
              </Button>
            </Group>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
