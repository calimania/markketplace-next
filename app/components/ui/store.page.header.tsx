import { Title, Text, Stack, Box, Paper, Group } from '@mantine/core';
import { ReactNode } from 'react';
import { Page } from '@/markket/page';
import { markketColors } from '@/markket/colors.config';

interface StorePageHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  page?: Page;
  backgroundImage?: string;
  iconColor?: string;
}

export default function StorePageHeader({
  icon,
  title,
  description,
  backgroundImage,
  iconColor = markketColors.sections.shop.main,
}: StorePageHeaderProps) {
  const hasCover = !!backgroundImage;

  return (
    <Paper
      radius="xl"
      p={{ base: 'lg', md: 40 }}
      mb={32}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: hasCover
          ? `linear-gradient(135deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.28) 100%), url(${backgroundImage}) center/cover no-repeat`
          : markketColors.gradients.hero,
        border: 'none',
      }}
    >
      {/* Decorative blob */}
      <Box
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }}
      />

      <Stack align="center" gap="sm" style={{ position: 'relative', zIndex: 1 }}>
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: hasCover ? 'rgba(255,255,255,0.18)' : `${iconColor}25`,
            backdropFilter: hasCover ? 'blur(8px)' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>

        <Title
          order={1}
          ta="center"
          c="white"
          style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2 }}
        >
          {title}
        </Title>

        {description && (
          <Text
            size="sm"
            ta="center"
            maw={560}
            mx="auto"
            c="rgba(255,255,255,0.85)"
            style={{ lineHeight: 1.6 }}
          >
            {description}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}