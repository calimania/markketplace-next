import { Container, Title, Text, Button, Group, Stack, SimpleGrid } from "@mantine/core";
import { IconRocket, IconBrandGithub, IconBuildingStore, IconCode, IconShoppingBag, IconFileTypeDoc } from "@tabler/icons-react";
import { strapiClient } from '@/markket/api';
import { FeatureCard } from "./components/ui/feature.card";

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

const features = [
  {
    icon: IconRocket,
    title: "Fast & Modern",
    description: "Built with Next.js and Astro for optimal performance"
  },
  {
    icon: IconBuildingStore,
    title: "Ready to Sell",
    description: "Supported by Stripe connect"
  },
  {
    icon: IconCode,
    title: "Developer Friendly",
    description: "Plugin ecosystem & custom integrations"
  }
];

const links = [
  {
    href: "/stores",
    icon: IconShoppingBag,
    label: "Browse Stores",
    variant: "gradient",
    gradient: { from: 'indigo', to: 'cyan' }
  },
  {
    href: "/docs",
    icon: IconFileTypeDoc,
    label: "Documentation",
    variant: "light"
  },
  {
    href: "https://github.com/calimania/markketplace-next",
    icon: IconBrandGithub,
    label: "GitHub",
    variant: "light"
  }
];

export default async function Home() {
  const a = await strapiClient.getStore();
  const store = a.data[0];

  return (
    <Container size="lg" className="py-20">
      <Stack gap="xl">
        {/* Hero Section */}
        <div className="text-center">
          <img
            src={store?.Logo?.url || defaultLogo}
            alt={store?.SEO?.metaTitle || 'Markket Logo'}
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          <Title className="text-4xl md:text-5xl mb-4">
            Welcome to {store?.SEO?.metaTitle || 'Markket'}
          </Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            {store?.SEO?.metaDescription || 'eCommerce'}
          </Text>
        </div>

        {/* Links Section */}
        <Group justify="center" gap="md" wrap="wrap">
          {links.map((link) => (
            <Button
              key={link.href}
              component="a"
              href={link.href}
              leftSection={<link.icon size={20} />}
              variant={link.variant}
              gradient={link.gradient}
              target={link.href.startsWith('http') ? '_blank' : undefined}
            >
              {link.label}
            </Button>
          ))}
        </Group>

        {/* Features Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
