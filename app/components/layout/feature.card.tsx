import { Paper, Stack, Box, Title, Text } from '@mantine/core';
import { markketColors } from '@/markket/colors.config';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  color?: string;
  variant?: 'default' | 'minimal' | 'bold';
}

/**
 * Reusable feature card component
 * Implements consistent card design from Markketplace design system
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={<IconRocket size={30} />}
 *   title="Fast Setup"
 *   description="Get started in minutes"
 *   color={markketColors.sections.shop.main}
 * />
 * ```
 */
export function FeatureCard({
  icon,
  title,
  description,
  color = markketColors.cyan.main,
  variant = 'default',
}: FeatureCardProps) {
  if (variant === 'minimal') {
    return (
      <Stack gap={20}>
        {icon && (
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Title order={3} size="h4" style={{ color: markketColors.neutral.charcoal }}>
          {title}
        </Title>
        <Text c="dimmed" style={{ lineHeight: 1.6 }}>
          {description}
        </Text>
      </Stack>
    );
  }

  if (variant === 'bold') {
    return (
      <Paper
        radius="card"
        p="xl"
        style={{
          background: `${color}10`,
          border: `2px solid ${color}30`,
          transition: 'all 0.2s ease',
        }}
        className="hover:shadow-card-hover transform hover:scale-[1.02]"
      >
        <Stack gap={20}>
          {icon && (
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${color}20`,
              }}
            >
              {icon}
            </Box>
          )}
          <Title order={3} size="h3" style={{ color: markketColors.neutral.charcoal }}>
            {title}
          </Title>
          <Text c="dimmed" style={{ lineHeight: 1.6 }}>
            {description}
          </Text>
        </Stack>
      </Paper>
    );
  }

  // Default variant
  return (
    <Paper
      radius="card"
      className="p-card-inner hover:shadow-card-hover"
      style={{
        border: `1px solid ${markketColors.neutral.lightGray}`,
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <Stack gap={20}>
        {icon && (
          <Box
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Title order={3} size="h3" style={{ color: markketColors.neutral.charcoal }}>
          {title}
        </Title>
        <Text c="dimmed" style={{ lineHeight: 1.6 }}>
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

export default FeatureCard;
