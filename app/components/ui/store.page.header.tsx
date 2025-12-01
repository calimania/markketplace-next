import { Paper, Title, Text, Stack, Box } from '@mantine/core';
import { ReactNode } from 'react';
import PageContent from './page.content';
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
  page,
  backgroundImage,
  iconColor = markketColors.sections.shop.main,
}: StorePageHeaderProps) {
  return (
    <Paper
      radius="md"
      p={40}
      mb={32}
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(to right, ${markketColors.neutral.white}f8, ${markketColors.neutral.white}), url(${backgroundImage})`
          : markketColors.neutral.offWhite,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderWidth: '1px',
        borderColor: markketColors.neutral.gray,
      }}
    >
      <Stack align="center" gap="md">
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: '8px',
            background: `${iconColor}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </Box>

        <Title order={1} ta="center" style={{ fontSize: '1.75rem', fontWeight: 500, color: markketColors.neutral.charcoal }}>
          {title}
        </Title>

        {page?.Content ? (
          <Box maw={600} mx="auto">
            <PageContent params={{ page }} />
          </Box>
        ) : description ? (
          <Text size="sm" ta="center" maw={600} mx="auto" style={{ lineHeight: 1.6, color: markketColors.neutral.mediumGray }}>
            {description}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}