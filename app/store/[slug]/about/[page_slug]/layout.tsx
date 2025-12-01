import { Container, Stack } from '@mantine/core';

interface AboutLayoutProps {
  children: React.ReactNode;
}

export default async function AboutLayout({ children }: AboutLayoutProps) {

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          {children}
        </div>
      </Stack>
    </Container>
  );
};
