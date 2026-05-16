import { Title, Text, Stack, Box, Paper, Group } from '@mantine/core';
import { ReactNode } from 'react';
import { Page } from '@/markket/page';
import { hexToRgba, markketColors } from '@/markket/colors.config';

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
  const tintSoft = hexToRgba(iconColor, 0.12);
  const tintStrong = hexToRgba(iconColor, 0.26);
  const tintSurface = hexToRgba(iconColor, 0.08);

  return (
    <Paper
      radius="xl"
      p={{ base: 'lg', md: 40 }}
      mb={32}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 220,
        display: 'flex',
        alignItems: 'flex-start',
        background: `linear-gradient(145deg, ${tintSoft} 0%, rgba(255,255,255,0.98) 48%, rgba(245,246,247,0.96) 100%)`,
        border: `1px solid ${markketColors.neutral.lightGray}`,
        boxShadow: '0 14px 30px rgba(15,23,42,0.06)',
      }}
    >
      {hasCover && (
        <>
          <Box
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              width: 'min(44%, 320px)',
              height: '72%',
              borderRadius: 18,
              background: `url(${backgroundImage}) center/cover no-repeat`,
              opacity: 0.42,
            }}
          />
          <Box
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              width: 'min(44%, 320px)',
              height: '72%',
              borderRadius: 18,
              background: `linear-gradient(160deg, rgba(255,255,255,0.12) 0%, ${tintStrong} 100%)`,
            }}
          />
        </>
      )}

      <Box
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: tintSurface,
          pointerEvents: 'none',
        }}
      />

      <Stack
        align="flex-start"
        gap="sm"
        style={{
          position: 'relative',
          zIndex: 1,
          width: hasCover ? 'min(100%, 620px)' : '100%',
          paddingTop: 4,
        }}
      >
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `${iconColor}1f`,
            border: `1px solid ${iconColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </Box>

        <Title
          order={1}
          ta="left"
          c={markketColors.neutral.charcoal}
          style={{ fontSize: 'clamp(1.45rem, 4vw, 2.25rem)', fontWeight: 750, lineHeight: 1.2 }}
        >
          {title}
        </Title>

        {description && (
          <Text
            size="sm"
            ta="left"
            maw={hasCover ? 540 : 620}
            c={markketColors.neutral.darkGray}
            style={{ lineHeight: 1.6 }}
          >
            {description}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}