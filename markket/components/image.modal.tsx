import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Stack,
  SegmentedControl,
  Paper,
  Text,
  Center,
  Loader,
  TextInput,
  Textarea,
  Button,
  Group,
  FileButton,
  Box,
  Image as MantineImage,
  Slider,
} from '@mantine/core';
import { IconLink, IconUpload, IconPhotoPlus, IconSparkles } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import { useMediaQuery } from '@mantine/hooks';
import { markketplace } from '@/markket/config';

const PLACEHOLDER = markketplace.blank_image_url;

type ImageModalProps = {
  imageModalOpen: boolean;
  handleCloseModal: () => void;
  imageUrl?: string;
  imageAlt?: string;
  maxWidth?: number;
  onReplace?: (img: { url: string; alt: string; img?: File }) => void;
  onInsert?: (img: { url: string; alt: string }) => void;
  mode?: 'preview' | 'replace';
  onToggleMode?: () => void;
  disableReplace?: boolean;
};

type EditorTab = 'source' | 'adjust' | 'design' | 'text';
type SourceKind = 'upload' | 'web';
type LibraryKind = 'unsplash' | 'pexels';
type ShapePreset = 'none' | 'hex-outline' | 'side-bands' | 'corner-frame' | 'circle-badge';

type FilterState = {
  grayscale: number;
  brightness: number;
  contrast: number;
};

type TextLayerState = {
  value: string;
  color: string;
  fontFamily: string;
  size: number;
  xPercent: number;
  yPercent: number;
};

const DEFAULT_FILTERS: FilterState = {
  grayscale: 0,
  brightness: 100,
  contrast: 100,
};

const DEFAULT_TEXT_LAYER: TextLayerState = {
  value: '',
  color: '#ffffff',
  fontFamily: '"Space Grotesk", "Manrope", ui-sans-serif, system-ui, sans-serif',
  size: 42,
  xPercent: 50,
  yPercent: 88,
};

const TEXT_COLOR_PRESETS = ['#ffffff', '#111827', '#e4007c', '#00bcd4', '#4caf50', '#f59e0b'];

const TEXT_FONT_PRESETS = [
  { label: 'Display', family: '"Space Grotesk", "Manrope", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Body', family: '"Manrope", ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', family: '"Newsreader", Georgia, serif' },
  { label: 'Mono', family: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace' },
];

const SHAPE_COLOR_PRESETS = ['#ffffff', '#111827', '#e4007c', '#00bcd4', '#4caf50', '#f59e0b'];

const SHAPE_STYLE_PRESETS = [
  { label: 'Soft', color: '#ffffff', opacity: 40, weight: 4 },
  { label: 'Bold', color: '#111827', opacity: 82, weight: 10 },
  { label: 'Rosa', color: '#e4007c', opacity: 68, weight: 8 },
  { label: 'Cyan', color: '#00bcd4', opacity: 60, weight: 7 },
];

function toRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '').trim();

  if (![3, 6].includes(normalized.length)) {
    return `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
  }

  const value = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  const int = Number.parseInt(value, 16);

  if (Number.isNaN(int)) {
    return `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
  }

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}

function drawShapeOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  preset: ShapePreset,
  color: string,
  opacity: number,
  weight: number
) {
  if (preset === 'none') return;

  const alpha = opacity / 100;
  const strokeColor = toRgba(color, alpha);
  const fillColor = toRgba(color, Math.min(alpha * 0.45, 0.45));
  const thickness = Math.max(2, Math.round(weight));

  ctx.save();
  ctx.lineWidth = thickness;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  if (preset === 'hex-outline') {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(24, Math.min(width, height) * 0.38);

    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  if (preset === 'side-bands') {
    const bandWidth = Math.max(10, Math.round(width * 0.08));
    ctx.fillRect(0, 0, bandWidth, height);
    ctx.fillRect(width - bandWidth, 0, bandWidth, height);
  }

  if (preset === 'corner-frame') {
    const inset = Math.max(8, Math.round(Math.min(width, height) * 0.03));
    const arm = Math.max(20, Math.round(Math.min(width, height) * 0.14));

    ctx.beginPath();
    ctx.moveTo(inset, inset + arm);
    ctx.lineTo(inset, inset);
    ctx.lineTo(inset + arm, inset);

    ctx.moveTo(width - inset - arm, inset);
    ctx.lineTo(width - inset, inset);
    ctx.lineTo(width - inset, inset + arm);

    ctx.moveTo(inset, height - inset - arm);
    ctx.lineTo(inset, height - inset);
    ctx.lineTo(inset + arm, height - inset);

    ctx.moveTo(width - inset - arm, height - inset);
    ctx.lineTo(width - inset, height - inset);
    ctx.lineTo(width - inset, height - inset - arm);
    ctx.stroke();
  }

  if (preset === 'circle-badge') {
    const radius = Math.max(16, Math.round(Math.min(width, height) * 0.1));
    const x = width - radius - Math.max(12, thickness * 2);
    const y = radius + Math.max(12, thickness * 2);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function baseName(fileName: string) {
  return fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
}

function createFileFromBlob(blob: Blob, fileName: string) {
  return new File([blob], fileName, {
    type: blob.type || 'image/webp',
    lastModified: Date.now(),
  });
}

const ImageModal = ({
  imageModalOpen,
  handleCloseModal,
  imageUrl: initialImageUrl = '',
  imageAlt: initialImageAlt = '',
  maxWidth,
  onReplace,
  mode = 'preview',
  onToggleMode,
  disableReplace = false,
}: ImageModalProps) => {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [tab, setTab] = useState<EditorTab>('source');
  const [sourceKind, setSourceKind] = useState<SourceKind>('upload');
  const [libraryKind, setLibraryKind] = useState<LibraryKind>('unsplash');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [workingFile, setWorkingFile] = useState<File | null>(null);
  const [workingImage, setWorkingImage] = useState<HTMLImageElement | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string>('');
  const [rendering, setRendering] = useState(false);
  const [applying, setApplying] = useState(false);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [textLayer, setTextLayer] = useState<TextLayerState>(DEFAULT_TEXT_LAYER);
  const [shapePreset, setShapePreset] = useState<ShapePreset>('none');
  const [shapeColor, setShapeColor] = useState('#ffffff');
  const [shapeOpacity, setShapeOpacity] = useState(55);
  const [shapeWeight, setShapeWeight] = useState(6);
  const [imageAlt, setImageAlt] = useState(initialImageAlt);
  const [textPromptOpen, setTextPromptOpen] = useState(false);

  const hasImage = Boolean(workingImage);

  const uploadAccept = useMemo(
    () => 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml',
    []
  );

  const loadImageFromFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Could not read the selected image.'));
        img.src = objectUrl;
      });

      if (previewThumb && previewThumb.startsWith('blob:')) {
        URL.revokeObjectURL(previewThumb);
      }

      setWorkingFile(file);
      setWorkingImage(img);
      setPreviewThumb(objectUrl);
      setUrlError(null);
      setTab('adjust');
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      setUrlError(error instanceof Error ? error.message : 'Could not read selected image.');
    }
  };

  const fetchAsFile = async (sourceUrl: string, fallbackName: string) => {
    const proxyUrl = `/api/markket/img?action=proxy&url=${encodeURIComponent(sourceUrl)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error('Could not load image URL.');
    }

    const blob = await response.blob();
    const mime = blob.type || 'image/webp';
    const extension = mime.includes('png') ? 'png' : mime.includes('jpeg') ? 'jpg' : 'webp';
    return createFileFromBlob(blob, `${baseName(fallbackName)}.${extension}`);
  };

  const loadFromUrl = async (sourceUrl: string) => {
    if (!sourceUrl.trim()) return;

    try {
      setUrlLoading(true);
      setUrlError(null);
      const file = await fetchAsFile(sourceUrl.trim(), 'url-image');
      await loadImageFromFile(file);
      setSourceKind('web');
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Could not load URL image.');
    } finally {
      setUrlLoading(false);
    }
  };

  const runLibrarySearch = async (queryOverride?: string) => {
    try {
      setLibraryLoading(true);
      setUrlError(null);

      const nextQuery = (queryOverride ?? searchQuery).trim();

      const action = libraryKind === 'pexels' ? 'pexels' : 'unsplash';
      const endpoint = nextQuery
        ? `/api/markket/img?action=${action}&query=${encodeURIComponent(nextQuery)}`
        : `/api/markket/img?action=${action}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Could not load images from library.');
      }

      const payload = await response.json();
      const urls = Array.isArray(payload?.urls) ? payload.urls.filter((value: unknown) => typeof value === 'string') : [];

      if (!urls.length) {
        setSearchResults([]);
        setUrlError(`No ${libraryKind === 'pexels' ? 'Pexels' : 'Unsplash'} images found.`);
        return;
      }

      setSearchResults(urls.slice(0, 18));
      setTab('source');
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Could not load library results.');
      setSearchResults([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleSearchOrUrl = async () => {
    const nextValue = searchQuery.trim();

    if (!nextValue) {
      await runLibrarySearch('');
      return;
    }

    if (/^https?:\/\//i.test(nextValue)) {
      await loadFromUrl(nextValue);
      return;
    }

    await runLibrarySearch(nextValue);
  };

  const renderToCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (!workingImage) {
      canvas.width = 1000;
      canvas.height = 560;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const naturalWidth = workingImage.naturalWidth || workingImage.width;
    const naturalHeight = workingImage.naturalHeight || workingImage.height;

    const nextWidth = Math.max(1, Math.round(maxWidth ? Math.min(naturalWidth, maxWidth) : naturalWidth));
    const ratio = nextWidth / Math.max(1, naturalWidth);
    const nextHeight = Math.max(1, Math.round(naturalHeight * ratio));

    canvas.width = nextWidth;
    canvas.height = nextHeight;

    ctx.clearRect(0, 0, nextWidth, nextHeight);
    ctx.filter = `grayscale(${filters.grayscale}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%)`;
    ctx.drawImage(workingImage, 0, 0, nextWidth, nextHeight);
    ctx.filter = 'none';

    drawShapeOverlay(ctx, nextWidth, nextHeight, shapePreset, shapeColor, shapeOpacity, shapeWeight);

    if (textLayer.value.trim()) {
      const x = Math.round((textLayer.xPercent / 100) * nextWidth);
      const y = Math.round((textLayer.yPercent / 100) * nextHeight);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.max(10, Math.round(textLayer.size * ratio))}px ${textLayer.fontFamily}`;
      ctx.fillStyle = textLayer.color;
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
      ctx.fillText(textLayer.value.trim(), x, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  };

  const exportCanvasFile = async () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      throw new Error('Editor canvas is not available.');
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => resolve(value), 'image/webp', 0.9);
    });

    if (!blob) {
      throw new Error('Could not export edited image.');
    }

    const fileName = `${baseName(workingFile?.name || 'image')}-edited.webp`;
    return createFileFromBlob(blob, fileName);
  };

  const resetAdjustments = () => {
    setFilters(DEFAULT_FILTERS);
    setTextLayer(DEFAULT_TEXT_LAYER);
  };

  const applyImageWork = async () => {
    if (!onReplace) return;

    if (!workingImage) {
      onReplace({ url: initialImageUrl || '', alt: imageAlt.trim() });
      handleCloseModal();
      return;
    }

    try {
      setApplying(true);
      const file = await exportCanvasFile();
      onReplace({
        url: '',
        alt: imageAlt.trim(),
        img: file,
      });
      handleCloseModal();
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Could not apply image work.');
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    if (!imageModalOpen) return;

    setTab('source');
    setSourceKind(initialImageUrl ? 'web' : 'upload');
    setLibraryKind('unsplash');
    setSearchQuery('');
    setSearchResults([]);
    setUrlError(null);
    setFilters(DEFAULT_FILTERS);
    setTextLayer(DEFAULT_TEXT_LAYER);
    setShapePreset('none');
    setShapeColor('#ffffff');
    setShapeOpacity(55);
    setShapeWeight(6);
    setImageAlt(initialImageAlt || '');
    setTextPromptOpen(false);

    if (initialImageUrl) {
      void loadFromUrl(initialImageUrl);
    } else {
      setWorkingFile(null);
      setWorkingImage(null);
      if (previewThumb && previewThumb.startsWith('blob:')) {
        URL.revokeObjectURL(previewThumb);
      }
      setPreviewThumb('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageModalOpen, initialImageUrl, initialImageAlt]);

  useEffect(() => {
    if (!imageModalOpen) return;

    setRendering(true);
    renderToCanvas();
    setRendering(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingImage, filters, textLayer, shapePreset, shapeColor, shapeOpacity, shapeWeight, maxWidth, imageModalOpen]);

  useEffect(() => {
    return () => {
      if (previewThumb && previewThumb.startsWith('blob:')) {
        URL.revokeObjectURL(previewThumb);
      }
    };
  }, [previewThumb]);

  return (
    <Modal
      opened={imageModalOpen}
      onClose={() => {
        if (!applying) {
          handleCloseModal();
        }
      }}
      closeOnClickOutside={!applying}
      closeOnEscape={!applying}
      title={
        <Group gap="xs" align="center">
          <Text fw={700}>{mode === 'replace' ? 'Image Workbench' : 'Image Preview & Workbench'}</Text>
          {!disableReplace && onToggleMode && (
            <Button
              variant="light"
              color="grape"
              size="xs"
              leftSection={<IconPhotoPlus size={14} />}
              onClick={onToggleMode}
            >
              {mode === 'preview' ? 'Switch to Replace' : 'Switch to Preview'}
            </Button>
          )}
        </Group>
      }
      size={isMobile ? '100%' : '92%'}
      centered
      radius="lg"
      styles={{
        content: {
          minHeight: isMobile ? '100dvh' : 760,
          maxHeight: isMobile ? '100dvh' : '95vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack gap="sm" style={{ flex: 1, minHeight: 0 }}>
        <Paper withBorder p="xs" radius="md" style={{ flex: 1, minHeight: 0 }}>
          <Center style={{ height: 420, background: 'var(--mantine-color-gray-0)', borderRadius: 10 }}>
            {!hasImage && !rendering && (
              <Stack align="center" gap={6}>
                <MantineImage src={PLACEHOLDER} alt="placeholder" w={220} h={140} fit="contain" />
                <Text size="sm" c="dimmed">Pick a source image to start editing.</Text>
              </Stack>
            )}

            {rendering && (
              <Group gap="xs">
                <Loader size="sm" />
                <Text size="sm">Rendering canvas...</Text>
              </Group>
            )}

            <canvas
              ref={canvasRef}
              style={{
                display: hasImage ? 'block' : 'none',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                background: '#fff',
              }}
            />
          </Center>
        </Paper>

        <SegmentedControl
          value={tab}
          onChange={(value) => setTab(value as EditorTab)}
          data={[
            { value: 'source', label: 'Source' },
            { value: 'adjust', label: 'Adjust' },
            { value: 'design', label: 'Design' },
            { value: 'text', label: 'Text' },
          ]}
          fullWidth
        />

        <Paper withBorder p="sm" radius="md" style={{ maxHeight: 320, overflowY: 'auto' }}>
          {tab === 'source' && (
            <Stack gap="sm">
              <SegmentedControl
                value={sourceKind}
                onChange={(value) => setSourceKind(value as SourceKind)}
                data={[
                  { label: 'Upload', value: 'upload' },
                  { label: 'Search or URL', value: 'web' },
                ]}
                fullWidth
              />

              {sourceKind === 'upload' && (
                <Dropzone
                  onDrop={(files) => {
                    const file = files[0];
                    if (file) {
                      void loadImageFromFile(file);
                    }
                  }}
                  onReject={() => setUrlError('Unsupported image type or file too large.')}
                  maxSize={6 * 1024 * 1024}
                  accept={["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif", "image/svg+xml"]}
                  multiple={false}
                >
                  <Stack align="center" py="md" gap={6}>
                    <IconUpload size={26} opacity={0.6} />
                    <Text size="sm">Drop an image here or select one.</Text>
                    <FileButton
                      onChange={(file) => {
                        if (file) {
                          void loadImageFromFile(file);
                        }
                      }}
                      accept={uploadAccept}
                    >
                      {(props) => (
                        <Button size="xs" variant="light" {...props}>
                          Select Image
                        </Button>
                      )}
                    </FileButton>
                  </Stack>
                </Dropzone>
              )}

              {sourceKind === 'web' && (
                <Stack gap="xs">
                  <SegmentedControl
                    value={libraryKind}
                    onChange={(value) => setLibraryKind(value as LibraryKind)}
                    data={[
                      { label: 'Unsplash', value: 'unsplash' },
                      { label: 'Pexels', value: 'pexels' },
                    ]}
                    fullWidth
                  />
                  <Group grow>
                    <TextInput
                      label="Search or URL"
                      placeholder="Type keywords or paste https://..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.currentTarget.value)}
                      leftSection={/^https?:\/\//i.test(searchQuery.trim()) ? <IconLink size={14} /> : <IconSparkles size={14} />}
                      error={urlError}
                    />
                    <Button loading={libraryLoading || urlLoading} onClick={() => void handleSearchOrUrl()}>
                      Go
                    </Button>
                  </Group>
                  <Group gap="xs">
                    {searchResults.map((url) => (
                      <Box
                        key={url}
                        style={{
                          width: 84,
                          height: 64,
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid rgba(15,23,42,0.14)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          void loadFromUrl(url);
                        }}
                      >
                        <MantineImage src={url} alt="result" w="100%" h="100%" fit="cover" />
                      </Box>
                    ))}
                  </Group>
                </Stack>
              )}
            </Stack>
          )}

          {tab === 'adjust' && (
            <Stack gap="xs">
              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={82}>Grayscale</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}%`}
                  min={0}
                  max={100}
                  value={filters.grayscale}
                  onChange={(value) => setFilters((current) => ({ ...current, grayscale: value }))}
                />
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={82}>Brightness</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}%`}
                  min={40}
                  max={170}
                  value={filters.brightness}
                  onChange={(value) => setFilters((current) => ({ ...current, brightness: value }))}
                />
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={82}>Contrast</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}%`}
                  min={40}
                  max={170}
                  value={filters.contrast}
                  onChange={(value) => setFilters((current) => ({ ...current, contrast: value }))}
                />
              </Group>

              <Group justify="flex-end">
                <Button variant="default" size="xs" onClick={resetAdjustments}>
                  Reset Adjustments
                </Button>
              </Group>
            </Stack>
          )}

          {tab === 'design' && (
            <Stack gap="xs">
              <SegmentedControl
                value={shapePreset}
                onChange={(value) => setShapePreset(value as ShapePreset)}
                data={[
                  { label: 'None', value: 'none' },
                  { label: 'Hex', value: 'hex-outline' },
                  { label: 'Bands', value: 'side-bands' },
                  { label: 'Corners', value: 'corner-frame' },
                  { label: 'Badge', value: 'circle-badge' },
                ]}
                fullWidth
              />

              <Group gap="xs">
                {SHAPE_STYLE_PRESETS.map((preset) => {
                  const active = shapeColor === preset.color && shapeOpacity === preset.opacity && shapeWeight === preset.weight;
                  return (
                    <Button
                      key={preset.label}
                      size="xs"
                      variant={active ? 'filled' : 'light'}
                      color={active ? 'dark' : 'gray'}
                      onClick={() => {
                        setShapeColor(preset.color);
                        setShapeOpacity(preset.opacity);
                        setShapeWeight(preset.weight);
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </Group>

              <Group gap="xs" align="center">
                <Text size="xs" c="dimmed" w={44}>Color</Text>
                <Group gap={6}>
                  {SHAPE_COLOR_PRESETS.map((color) => {
                    const active = shapeColor.toLowerCase() === color.toLowerCase();
                    return (
                      <Box
                        key={color}
                        onClick={() => setShapeColor(color)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: color,
                          border: active ? '2px solid #111827' : '1px solid rgba(15,23,42,0.16)',
                          boxShadow: active ? '0 0 0 2px rgba(228,0,124,0.18)' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </Group>
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={54}>Opacity</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}%`}
                  min={10}
                  max={100}
                  value={shapeOpacity}
                  onChange={(value) => setShapeOpacity(value)}
                />
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={54}>Weight</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}px`}
                  min={2}
                  max={24}
                  value={shapeWeight}
                  onChange={(value) => setShapeWeight(value)}
                />
              </Group>
            </Stack>
          )}

          {tab === 'text' && (
            <Stack gap="xs">
              {isMobile ? (
                <Paper
                  withBorder
                  p="sm"
                  radius="md"
                  onClick={() => setTextPromptOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">Text Overlay</Text>
                      <Text size="sm" fw={600} lineClamp={2}>
                        {textLayer.value.trim() || 'Tap to add text'}
                      </Text>
                    </Box>
                    <Button size="xs" variant="light" onClick={() => setTextPromptOpen(true)}>
                      Edit Text
                    </Button>
                  </Group>
                </Paper>
              ) : (
                  <TextInput
                    label="Text Overlay"
                    placeholder="Type text to place on image"
                    value={textLayer.value}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setTextLayer((current) => ({ ...current, value }));
                    }}
                  />
              )}
              <Group gap="xs">
                {TEXT_FONT_PRESETS.map((preset) => {
                  const active = textLayer.fontFamily === preset.family;
                  return (
                    <Button
                      key={preset.label}
                      size="xs"
                      variant={active ? 'filled' : 'light'}
                      color={active ? 'dark' : 'gray'}
                      onClick={() => setTextLayer((current) => ({ ...current, fontFamily: preset.family }))}
                      style={{ fontFamily: preset.family }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </Group>

              <Group gap="xs" align="center">
                <Text size="xs" c="dimmed" w={44}>Color</Text>
                <Group gap={6}>
                  {TEXT_COLOR_PRESETS.map((color) => {
                    const active = textLayer.color.toLowerCase() === color.toLowerCase();
                    return (
                      <Box
                        key={color}
                        onClick={() => setTextLayer((current) => ({ ...current, color }))}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: color,
                          border: active ? '2px solid #111827' : '1px solid rgba(15,23,42,0.16)',
                          boxShadow: active ? '0 0 0 2px rgba(228,0,124,0.18)' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </Group>
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={54}>Size</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}px`}
                  min={16}
                  max={120}
                  value={textLayer.size}
                  onChange={(value) => setTextLayer((current) => ({ ...current, size: value }))}
                />
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={82}>X Position</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}%`}
                  min={0}
                  max={100}
                  value={textLayer.xPercent}
                  onChange={(value) => setTextLayer((current) => ({ ...current, xPercent: value }))}
                />
              </Group>

              <Group gap="xs" align="center" wrap="nowrap">
                <Text size="xs" w={82}>Y Position</Text>
                <Slider
                  style={{ flex: 1 }}
                  label={(value) => `${value}%`}
                  min={0}
                  max={100}
                  value={textLayer.yPercent}
                  onChange={(value) => setTextLayer((current) => ({ ...current, yPercent: value }))}
                />
              </Group>
            </Stack>
          )}
        </Paper>

        <TextInput
          label="Alt Text"
          placeholder="Descriptive text for the image"
          value={imageAlt}
          onChange={(event) => setImageAlt(event.currentTarget.value)}
          description="Used for accessibility and SEO."
        />

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {hasImage
              ? 'Canvas ready. Nothing uploads until you click Confirm & Upload.'
              : 'Choose a source image to start, then confirm upload.'}
          </Text>
          <Group gap="xs">
            <Button variant="outline" color="gray" onClick={handleCloseModal} disabled={applying}>
              Cancel
            </Button>
            <Button
              leftSection={<IconPhotoPlus size={16} />}
              onClick={() => void applyImageWork()}
              disabled={disableReplace || applying || (!hasImage && !initialImageUrl)}
              loading={applying}
            >
              Confirm & Upload
            </Button>
          </Group>
        </Group>

        <Modal
          opened={textPromptOpen}
          onClose={() => setTextPromptOpen(false)}
          title="Edit Text Overlay"
          centered
          fullScreen={isMobile}
          size="lg"
        >
          <Stack gap="sm">
            <Textarea
              label="Text"
              placeholder="Type text to place on image"
              minRows={isMobile ? 6 : 4}
              autosize
              value={textLayer.value}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setTextLayer((current) => ({ ...current, value }));
              }}
              data-autofocus
            />
            <Group justify="flex-end">
              <Button variant="outline" color="gray" onClick={() => setTextPromptOpen(false)}>
                Done
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Modal>
  );
};

export default ImageModal;
