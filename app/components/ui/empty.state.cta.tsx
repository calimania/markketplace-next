import { Button, Stack, Text } from '@mantine/core';

type EmptyStateCTAProps = {
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: React.ReactNode;
  isAuthorized?: boolean;
};

export default function EmptyStateCTA({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon,
  isAuthorized = false,
}: EmptyStateCTAProps) {
  if (!isAuthorized) {
    return <Text c="dimmed">{description || `No ${title.toLowerCase()} yet.`}</Text>;
  }

  return (
    <Stack align="center" gap="sm" py="md">
      <Text c="dimmed" ta="center">
        {description || `No ${title.toLowerCase()} yet.`}
      </Text>
      <Button component="a" href={ctaHref} leftSection={icon}>
        {ctaLabel}
      </Button>
    </Stack>
  );
}
