'use client';

import { Grid, Card, GridCol, Stack, Box, Text, Badge } from '@mantine/core';
import { markketColors } from '@/markket/colors.config';

type SectionLink = {
  url: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
};

interface StoreSectionLinksProps {
  links: SectionLink[];
  borderColor: string;
}

export function StoreSectionLinks({ links, borderColor }: StoreSectionLinksProps) {
  return (
    <Grid gap="md">
      {links.map((link) => (
        <GridCol span={{ base: 6, sm: 4, md: 4 }} key={link.url}>
          <Card
            shadow="none"
            padding="lg"
            radius="xl"
            component="a"
            href={link.url}
            withBorder
            style={{
              cursor: 'pointer',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              borderColor,
              background: `linear-gradient(180deg, ${markketColors.neutral.white} 0%, ${markketColors.neutral.offWhite} 100%)`,
              height: '100%',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(-3px) scale(1.015)';
              el.style.boxShadow = `0 10px 28px ${link.color}32`;
              el.style.borderColor = `${link.color}60`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = '';
              el.style.boxShadow = '';
              el.style.borderColor = borderColor;
            }}
          >
            <Stack gap={8} align="flex-start">
              <Box
                style={{
                  width: 40,
                  height: 2,
                  borderRadius: 999,
                  background: link.color,
                  opacity: 0.7,
                }}
              />
              <Text fw={650} size="sm" ta="left" style={{ color: '#424242' }}>
                {link.title}
              </Text>
              <Badge
                variant="light"
                size="xs"
                radius="xl"
                style={{
                  background: `${link.color}14`,
                  color: link.color,
                }}
              >
                {link.description}
              </Badge>
            </Stack>
          </Card>
        </GridCol>
      ))}
    </Grid>
  );
}