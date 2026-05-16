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
  Badge,
  ScrollArea,
} from '@mantine/core';
import { IconLink, IconUpload, IconPhotoPlus, IconSparkles, IconTypography, IconShape, IconAdjustments } from '@tabler/icons-react';
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
  disableReplace?: boolean;
  mode?: string; // optional, ignored by new modal
};

type EditorTab = 'text' | 'design' | 'source';
type ShapePreset = 'none' | 'hex-outline' | 'side-bands' | 'corner-frame' | 'circle-badge';

type FilterState = {
  grayscale: number;
  brightness: number;
  contrast: number;
  tintColor: string;
  tintOpacity: number;
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
  tintColor: '#000000',
  tintOpacity: 0,
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

const BACKGROUND_COLOR_PRESETS = ['#ffffff', '#f5f5f5', '#111827', '#e4007c', '#00bcd4', '#4caf50', '#f59e0b', '#667eea', '#ec4899'];

const SHAPE_COLOR_PRESETS = ['#ffffff', '#111827', '#e4007c', '#00bcd4', '#4caf50', '#f59e0b', '#667eea', '#ec4899'];

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
    const radius = Math.max(16, Math.min(width, height) * 0.22);

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

function getFontWeight(fontFamily: string): string {
  // Monospace fonts look better without bold
  if (fontFamily.includes('Mono') || fontFamily.includes('monospace')) {
    return '500';
  }
  return '700';
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
  disableReplace = false,
}: ImageModalProps) => {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState<EditorTab>('text');
  const [backgroundColor, setBackgroundColor] = useState<string>('#f5f5f5');
  const [isBlankCanvas, setIsBlankCanvas] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
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
  const hasContent = hasImage || textLayer.value.trim();

  const uploadAccept = useMemo(
    () => 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml',
    []
  );

  const loadImageFromFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setFileLoading(true);

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
      setTab('design');
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      setUrlError(error instanceof Error ? error.message : 'Could not read selected image.');
    } finally {
      setFileLoading(false);
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
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Could not load URL image.');
    } finally {
      setUrlLoading(false);
    }
  };

  const fetchLibraryUrls = async (action: 'unsplash' | 'pexels', query: string) => {
    const endpoint = query
      ? `/api/markket/img?action=${action}&query=${encodeURIComponent(query)}`
      : `/api/markket/img?action=${action}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Could not load ${action} images.`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.urls)
      ? payload.urls.filter((value: unknown) => typeof value === 'string') as string[]
      : [];
  };

  const runLibrarySearch = async (queryOverride?: string) => {
    try {
      setLibraryLoading(true);
      setUrlError(null);

      const nextQuery = (queryOverride ?? searchQuery).trim();
      const urls = await Promise.all([
        fetchLibraryUrls('unsplash', nextQuery),
        fetchLibraryUrls('pexels', nextQuery),
      ]).then(([unsplashResults, pexelsResults]) => {
        const staggered: string[] = [];
        const maxLength = Math.max(unsplashResults.length, pexelsResults.length);

        for (let index = 0; index < maxLength; index += 1) {
          const fromUnsplash = unsplashResults[index];
          const fromPexels = pexelsResults[index];
          if (fromUnsplash) staggered.push(fromUnsplash);
          if (fromPexels) staggered.push(fromPexels);
        }

        return staggered;
      });

      if (!urls.length) {
        setSearchResults([]);
        setUrlError('No images found.');
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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSearchOrUrl();
    }
  };

  const renderToCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Handle blank canvas mode (when text is added but no image)
    if (!workingImage && textLayer.value.trim()) {
      canvas.width = 1200;
      canvas.height = 640;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawShapeOverlay(ctx, canvas.width, canvas.height, shapePreset, shapeColor, shapeOpacity, shapeWeight);

      const x = Math.round((textLayer.xPercent / 100) * canvas.width);
      const y = Math.round((textLayer.yPercent / 100) * canvas.height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${getFontWeight(textLayer.fontFamily)} ${Math.max(10, textLayer.size)}px ${textLayer.fontFamily}`;
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
      return;
    }

    if (!workingImage) {
      canvas.width = 1200;
      canvas.height = 640;
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

    // Save context state before applying filters
    ctx.save();
    ctx.filter = `grayscale(${filters.grayscale}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%)`;
    ctx.drawImage(workingImage, 0, 0, nextWidth, nextHeight);
    ctx.restore();

    drawShapeOverlay(ctx, nextWidth, nextHeight, shapePreset, shapeColor, shapeOpacity, shapeWeight);

    if (textLayer.value.trim()) {
      const x = Math.round((textLayer.xPercent / 100) * nextWidth);
      const y = Math.round((textLayer.yPercent / 100) * nextHeight);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${getFontWeight(textLayer.fontFamily)} ${Math.max(10, Math.round(textLayer.size * ratio))}px ${textLayer.fontFamily}`;
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

    // If no working image but text was added, export text + background as image
    if (!workingImage && textLayer.value.trim()) {
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
        setUrlError(error instanceof Error ? error.message : 'Could not export text image.');
      } finally {
        setApplying(false);
      }
      return;
    }

    // If no working image and no text, use initial image or abort
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
    setBackgroundColor('#f5f5f5');

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
  }, [workingImage, filters, textLayer, shapePreset, shapeColor, shapeOpacity, shapeWeight, maxWidth, imageModalOpen, backgroundColor]);

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
      title={<Text fw={700} size="lg">Create Image</Text>}
      size={isMobile ? '100%' : '96%'}
      centered
      radius="lg"
      styles={{
        content: {
          minHeight: isMobile ? '100dvh' : 880,
          maxHeight: isMobile ? '100dvh' : '95vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack gap="sm" style={{ flex: 1, minHeight: 0 }}>
        <Paper withBorder p="xs" radius="md" style={{ flex: 1, minHeight: 0 }}>
          <Center style={{ height: isMobile ? 360 : 580, background: 'var(--mantine-color-gray-0)', borderRadius: 10 }}>
            {!hasContent && !rendering && !fileLoading && (
              <Stack align="center" gap={12}>
                <MantineImage src={PLACEHOLDER} alt="placeholder" w={220} h={140} fit="contain" />
                <Stack gap={4} align="center">
                  <Text size="sm" fw={600}>Start creating your image</Text>
                  <Text size="xs" c="dimmed">Add text, upload a photo, or search</Text>
                </Stack>
                <FileButton
                  onChange={(file) => {
                    if (file) {
                      void loadImageFromFile(file);
                    }
                  }}
                  accept={uploadAccept}
                >
                  {(props) => (
                    <Button
                      size="sm"
                      variant="filled"
                      color="pink"
                      leftSection={<IconUpload size={16} />}
                      {...props}
                    >
                      Upload from Device
                    </Button>
                  )}
                </FileButton>
              </Stack>
            )}

            {(fileLoading || rendering) && (
              <Stack align="center" justify="center" gap="md" style={{ height: '100%' }}>
                <Group gap="xs">
                  <Loader size="sm" />
                  <Text size="sm">{fileLoading ? '📤 Loading image...' : 'Rendering canvas...'}</Text>
                </Group>
                {previewThumb && fileLoading && (
                  <MantineImage src={previewThumb} alt="preview" mah={200} fit="contain" />
                )}
              </Stack>
            )}

            <canvas
              ref={canvasRef}
              style={{
                display: hasContent ? 'block' : 'none',
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
            { value: 'text', label: <Group gap={4} wrap="nowrap"><IconTypography size={16} /><span>Text</span></Group> },
            { value: 'design', label: <Group gap={4} wrap="nowrap"><IconShape size={16} /><span>Design</span></Group> },
            { value: 'source', label: <Group gap={4} wrap="nowrap"><IconUpload size={16} /><span>Upload</span></Group> },
          ]}
          fullWidth
          size="sm"
        />

        <Paper withBorder p="md" radius="md" style={{ maxHeight: 360, overflowY: 'auto', flex: 1 }}>
          {tab === 'text' && (
            <Stack gap="md">
              <Stack gap="sm">
                <Text size="sm" fw={600}>Add Text</Text>
                <Text size="xs" c="dimmed">Start typing to create text. A background will be generated automatically.</Text>
                {isMobile ? (
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    onClick={() => setTextPromptOpen(true)}
                    style={{ cursor: 'pointer', background: 'rgba(250,250,250,0.8)' }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={600} lineClamp={2}>
                          {textLayer.value.trim() || 'Tap to add text'}
                        </Text>
                      </Box>
                      <Button size="sm" variant="light" onClick={() => setTextPromptOpen(true)}>
                        Edit
                      </Button>
                    </Group>
                  </Paper>
                ) : (
                  <TextInput
                    placeholder="Type something…"
                    value={textLayer.value}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setTextLayer((current) => ({ ...current, value }));
                    }}
                    size="md"
                  />
                )}
              </Stack>

              {textLayer.value.trim() && (
                <>
                  <Stack gap="sm">
                    <Text size="sm" fw={600}>Font</Text>
                    <Group gap="xs" wrap="wrap">
                      {TEXT_FONT_PRESETS.map((preset) => {
                        const active = textLayer.fontFamily === preset.family;
                        return (
                          <Button
                            key={preset.label}
                            size="xs"
                            variant={active ? 'filled' : 'light'}
                            color={active ? 'pink' : 'gray'}
                            onClick={() => setTextLayer((current) => ({ ...current, fontFamily: preset.family }))}
                            style={{ fontFamily: preset.family }}
                          >
                            {preset.label}
                          </Button>
                        );
                      })}
                    </Group>
                  </Stack>

                  <Stack gap="sm">
                    <Text size="sm" fw={600}>Color</Text>
                    <Group gap="xs">
                      {TEXT_COLOR_PRESETS.map((color) => {
                        const active = textLayer.color.toLowerCase() === color.toLowerCase();
                        return (
                          <Box
                            key={color}
                            onClick={() => setTextLayer((current) => ({ ...current, color }))}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 999,
                              background: color,
                              border: active ? '3px solid #111827' : '2px solid rgba(15,23,42,0.16)',
                              boxShadow: active ? '0 0 0 2px rgba(228,0,124,0.18)' : 'none',
                              cursor: 'pointer',
                              transition: 'transform 100ms ease',
                            }}
                          />
                        );
                      })}
                    </Group>
                  </Stack>

                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="sm" fw={600}>Size</Text>
                      <Text size="xs" c="dimmed">{textLayer.size}px</Text>
                    </Group>
                    <Slider
                      label={null}
                      min={16}
                      max={120}
                      value={textLayer.size}
                      onChange={(value) => setTextLayer((current) => ({ ...current, size: value }))}
                    />
                  </Stack>
                </>
              )}
            </Stack>
          )}

          {tab === 'design' && (
            <Stack gap="md">
              {!hasImage && !textLayer.value.trim() && (
                <Paper p="md" radius="md" style={{ background: 'rgba(250,250,250,0.8)', borderStyle: 'dashed', border: '1px dashed rgba(15,23,42,0.3)' }}>
                  <Text size="sm" c="dimmed">✨ Add text or an image first to design.</Text>
                </Paper>
              )}

              {textLayer.value.trim() && !hasImage && (
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={600}>Background Color</Text>
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>{backgroundColor}</Text>
                  </Group>
                  <Group gap="xs">
                    {BACKGROUND_COLOR_PRESETS.map((color) => {
                      const active = backgroundColor.toLowerCase() === color.toLowerCase();
                      return (
                        <Box
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            background: color,
                            border: active ? '3px solid #111827' : '2px solid rgba(15,23,42,0.2)',
                            cursor: 'pointer',
                            transition: 'all 100ms ease',
                            opacity: active ? 1 : 0.8,
                          }}
                        />
                      );
                    })}
                  </Group>
                </Stack>
              )}

              <Stack gap="sm">
                <Text size="sm" fw={600}>Shape</Text>
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
                  size="sm"
                />
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600}>Style presets</Text>
                <Group gap="xs" wrap="wrap">
                  {SHAPE_STYLE_PRESETS.map((preset) => {
                    const active = shapeColor === preset.color && shapeOpacity === preset.opacity && shapeWeight === preset.weight;
                    return (
                      <Button
                        key={preset.label}
                        size="xs"
                        variant={active ? 'filled' : 'light'}
                        color={active ? 'pink' : 'gray'}
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
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600}>Color</Text>
                <Group gap="xs">
                  {SHAPE_COLOR_PRESETS.map((color) => {
                    const active = shapeColor.toLowerCase() === color.toLowerCase();
                    return (
                      <Box
                        key={color}
                        onClick={() => setShapeColor(color)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          background: color,
                          border: active ? '3px solid #111827' : '1px solid rgba(15,23,42,0.16)',
                          boxShadow: active ? '0 0 0 2px rgba(228,0,124,0.18)' : 'none',
                          cursor: 'pointer',
                          transition: 'transform 100ms ease',
                        }}
                      />
                    );
                  })}
                </Group>
              </Stack>

              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>Opacity</Text>
                  <Text size="xs" c="dimmed">{shapeOpacity}%</Text>
                </Group>
                <Slider
                  label={null}
                  min={10}
                  max={100}
                  value={shapeOpacity}
                  onChange={(value) => setShapeOpacity(value)}
                />
              </Stack>

              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>Weight</Text>
                  <Text size="xs" c="dimmed">{shapeWeight}px</Text>
                </Group>
                <Slider
                  label={null}
                  min={2}
                  max={24}
                  value={shapeWeight}
                  onChange={(value) => setShapeWeight(value)}
                />
              </Stack>
            </Stack>
          )}

          {tab === 'source' && (
            <Stack gap="sm">
              <Group align="end" gap="xs" wrap="nowrap">
                <FileButton
                  ref={fileInputRef}
                  onChange={(file) => {
                    if (file) {
                      void loadImageFromFile(file);
                    }
                  }}
                  accept={uploadAccept}
                >
                  {(props) => (
                    <Button
                      size="sm"
                      variant="filled"
                      color="pink"
                      leftSection={<IconUpload size={16} />}
                      style={{ flexShrink: 0 }}
                      title="Click to select an image from your device"
                      {...props}
                    >
                      Upload
                    </Button>
                  )}
                </FileButton>
                <TextInput
                  style={{ flex: 1 }}
                  placeholder="Search or paste URL…"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  onKeyDown={handleSearchKeyDown}
                  leftSection={/^https?:\/\//i.test(searchQuery.trim()) ? <IconLink size={14} /> : <IconSparkles size={14} />}
                  error={urlError}
                  size="sm"
                />
                <Button
                  size="sm"
                  variant="filled"
                  color="pink"
                  onClick={() => void handleSearchOrUrl()}
                  loading={libraryLoading || urlLoading}
                  style={{ flexShrink: 0 }}
                >
                  Search
                </Button>
              </Group>

              <Text size="xs" c="dimmed" style={{ marginBottom: 8 }}>💡 Click an image to load, or upload/search above</Text>

              {searchResults.length > 0 ? (
                <Box
                  style={{
                    columns: isMobile ? 2 : 3,
                    columnGap: 10,
                  }}
                >
                  {searchResults.map((url, index) => {
                    const tall = index % 3 === 0;
                    return (
                      <Box
                        key={url}
                        style={{
                          breakInside: 'avoid',
                          marginBottom: 10,
                          height: tall ? 184 : 130,
                          borderRadius: 12,
                          overflow: 'hidden',
                          border: '1px solid rgba(15,23,42,0.12)',
                          cursor: 'pointer',
                          background: '#fff',
                          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                          transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
                        }}
                        onClick={() => {
                          void loadFromUrl(url);
                        }}
                      >
                        <MantineImage src={url} alt="result" w="100%" h="100%" fit="cover" />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Paper
                    withBorder
                    radius="md"
                    p="lg"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'linear-gradient(180deg, rgba(250,250,250,0.92), rgba(255,255,255,0.98))',
                      borderStyle: 'dashed',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                      minHeight: 180,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#E4007C';
                      e.currentTarget.style.background = 'linear-gradient(180deg, rgba(250,250,250,0.98), rgba(255,240,245,0.98))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.background = 'linear-gradient(180deg, rgba(250,250,250,0.92), rgba(255,255,255,0.98))';
                    }}
                  >
                    <Stack gap={6} align="center" justify="center" style={{ height: '100%' }}>
                      <Text fw={600} size="sm">📤 Click or search for images</Text>
                      <Text size="xs" c="dimmed">
                        Upload from device or search libraries
                      </Text>
                  </Stack>
                </Paper>
              )}
            </Stack>
          )}

          {tab === 'design' && (
            <Stack gap="md">
              {!hasImage && !textLayer.value.trim() && (
                <Paper p="md" radius="md" style={{ background: 'rgba(250,250,250,0.8)', borderStyle: 'dashed', border: '1px dashed rgba(15,23,42,0.3)' }}>
                  <Text size="sm" c="dimmed">Add text or an image to add design elements.</Text>
                </Paper>
              )}

              <Stack gap="sm">
                <Text size="sm" fw={600}>Shape</Text>
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
                  size="sm"
                />
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600}>Style presets</Text>
                <Group gap="xs" wrap="wrap">
                  {SHAPE_STYLE_PRESETS.map((preset) => {
                    const active = shapeColor === preset.color && shapeOpacity === preset.opacity && shapeWeight === preset.weight;
                    return (
                      <Button
                        key={preset.label}
                        size="sm"
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
              </Stack>

              <Stack gap="sm">
                <Text size="sm" fw={600}>Color</Text>
                <Group gap="xs">
                  {SHAPE_COLOR_PRESETS.map((color) => {
                    const active = shapeColor.toLowerCase() === color.toLowerCase();
                    return (
                      <Box
                        key={color}
                        onClick={() => setShapeColor(color)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          background: color,
                          border: active ? '2px solid #111827' : '1px solid rgba(15,23,42,0.16)',
                          boxShadow: active ? '0 0 0 2px rgba(228,0,124,0.18)' : 'none',
                          cursor: 'pointer',
                          transition: 'transform 100ms ease',
                        }}
                      />
                    );
                  })}
                </Group>
              </Stack>

              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>Opacity</Text>
                  <Text size="xs" c="dimmed">{shapeOpacity}%</Text>
                </Group>
                <Slider
                  label={null}
                  min={10}
                  max={100}
                  value={shapeOpacity}
                  onChange={(value) => setShapeOpacity(value)}
                />
              </Stack>

              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>Weight</Text>
                  <Text size="xs" c="dimmed">{shapeWeight}px</Text>
                </Group>
                <Slider
                  label={null}
                  min={2}
                  max={24}
                  value={shapeWeight}
                  onChange={(value) => setShapeWeight(value)}
                />
              </Stack>
            </Stack>
          )}

        </Paper>

        <Stack gap="sm">
          <TextInput
            label="Alt Text"
            placeholder="Describe the image content (accessibility & SEO)"
            value={imageAlt}
            onChange={(event) => setImageAlt(event.currentTarget.value)}
            description="Help people understand what's in the image."
          />

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {hasContent
                ? 'Ready to save. Edits apply when you confirm.'
                : 'Upload or search to get started.'}
            </Text>
            <Group gap="xs">
              <Button variant="default" onClick={handleCloseModal} disabled={applying}>
                Cancel
              </Button>
              <Button
                leftSection={<IconPhotoPlus size={16} />}
                onClick={() => void applyImageWork()}
                disabled={disableReplace || applying || (!hasContent && !initialImageUrl)}
                loading={applying}
                color="pink"
              >
                {initialImageUrl ? 'Save Image' : 'Create Image'}
              </Button>
            </Group>
          </Group>
        </Stack>

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
