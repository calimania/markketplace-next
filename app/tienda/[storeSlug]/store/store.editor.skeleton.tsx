'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Badge, Button, CopyButton, Group, Image, Paper, Skeleton, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconCopy, IconDeviceFloppy, IconEdit, IconExternalLink, IconPalette, IconPencilX, IconUsers } from '@tabler/icons-react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import URLsInput from '@/app/components/ui/form.input.urls';
import type { URLItem } from '@/app/components/ui/form.input.urls';
import RichTextContent from '@/app/components/ui/richtext.content';
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
            Identity and links
          </Text>
        </div>
        <Group gap="xs">
          <Badge variant="light" color={isPublished ? 'green' : 'gray'}>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
          <Badge variant="light" color="cyan">Tendero</Badge>
        </Group>
      </Group>

      <Group wrap="wrap" gap="xs">
        <Button component={Link} href={`/tienda/${store.slug}`} variant="default" leftSection={<IconArrowLeft size={16} />}>
          Back
        </Button>
        <Button component={Link} href={publicHref} target="_blank" rel="noopener noreferrer" leftSection={<IconExternalLink size={16} />} variant="light" color="cyan">
          View
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
          <Text fw={600}>Public URL</Text>
          <Text c="dimmed" size="sm">
            Use this when sharing your link
          </Text>
          <Group align="flex-end" wrap="nowrap">
            <TextInput value={publicHref} readOnly type="url" style={{ flex: 1 }} />
            <CopyButton value={publicHref} timeout={1800}>
              {({ copied, copy }) => (
                <Button
                  variant={copied ? 'filled' : 'default'}
                  color={copied ? 'teal' : 'gray'}
                  onClick={copy}
                  leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </CopyButton>
          </Group>
          {!isEditing && (
            <Text size="xs" c="dimmed">Click Edit above to make changes.</Text>
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
            (ﾉ◕ヮ◕)ﾉ:･ﾟ✧
          </Text>

          {isEditing ? (
            <div className="form-cols">
              <TextInput
                label="Name"
                description="^ _ ^ "
                value={draftTitle}
                onChange={(event) => onTitleChange(event.currentTarget.value)}
                autoFocus
              />
              <TextInput
                label="Slug"
                value={draftSlug}
                onChange={(event) => onSlugChange(event.currentTarget.value)}
                description="Lowercase letters, numbers, and dashes"
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
                description="Short text for your homepage"
                placeholder="Creative studio for forest fae"
                value={draftDescription}
                onChange={(value) => onDescriptionChange(typeof value === 'string' ? value : '')}
                format="html"
                minHeight={220}
              />
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
            <Text fw={600}>Bot Optimization</Text>
            <Badge variant="light" color="grape">SEO</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            {"(>ᴗ•)"} As seen in social previews
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
              <Text size="sm" fw={600}>Preview</Text>
              <Text size="sm" c="blue" fw={500}>{draftSeoTitle || draftTitle || store.title}</Text>
              <Text size="xs" c="green">{publicHref}</Text>
              <Text size="sm" c="dimmed">
                {draftSeoDescription || 'by markkët'}
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
          {isEditing ? (
            <URLsInput
              label="Store Links"
              description="https://"
              value={draftUrls}
              onChange={onUrlsChange}
            />
          ) : draftUrls.length > 0 ? (
            <URLsInput
              label="Store Links"
                description="Shown on your homepage"
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
