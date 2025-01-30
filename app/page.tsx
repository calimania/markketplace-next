import { Container, Title, Text, Button, Group, Stack } from "@mantine/core";
import { IconRocket, IconBrandGithub, IconBuildingStore, IconCode } from "@tabler/icons-react";
import { strapiClient } from '@/markket/api';

export default async function Home() {
  const { data: [store] } = await strapiClient.getStore();
  console.log({ store });

  return (
    <Container size="lg" className="py-20">
      <Stack gap="xl">
        {/* Hero Section */}
        <div className="text-center">
          <img
            src="https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png"
            alt="Markket Logo"
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          <Title className="text-4xl md:text-5xl mb-4">Welcome to Markket</Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            Build beautiful storefronts with modern technology stack
          </Text>
        </div>

        {/* Links Section */}
        <Group justify="center" gap="md" wrap="wrap">
          <Button
            component="a"
            href="https://astro.markket.place"
            leftSection={<IconBuildingStore size={20} />}
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            target="_blank"
          >
            View Demo Store
          </Button>

          <Button
            component="a"
            href="https://github.com/calimania/markketplace-next"
            leftSection={<IconBrandGithub size={20} />}
            target="_blank"
            variant="light"
          >
            Next.js Repo
          </Button>

          <Button
            component="a"
            href="https://github.com/calimania/markketplace-astro"
            leftSection={<IconCode size={20} />}
            target="_blank"
            variant="light"
          >
            Astro Repo
          </Button>
        </Group>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <IconRocket className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Open Source</h3>
            <Text c="dimmed">Open standards & a modern stack</Text>
          </div>

          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <IconBuildingStore className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Ready to Sell</h3>
            <Text c="dimmed">Supported by Stripe connect</Text>
          </div>

          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <IconCode className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Developer Friendly</h3>
            <Text c="dimmed">Plugin ecosystem & custom integrations</Text>
          </div>
        </div>
      </Stack>
    </Container>
  );
}
