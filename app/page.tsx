"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  SimpleGrid,
  Paper,
} from "@mantine/core";
import {
  IconRocket,
  IconBrandGithub,
  IconBuildingStore,
  IconCode,
  IconShoppingBag,
  IconFileTypeDoc,
  IconRadio,
  IconLogin2,
  IconHeartCode,
  IconBrandMysql,
} from "@tabler/icons-react";
import { strapiClient } from "@/markket/api";
import { FeatureCard } from "./components/ui/feature.card";
import PageContent from "@/app/components/ui/page.content";
import { useEffect, useState } from "react";
import { useAuth } from "./providers/auth";

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

const features = [
  {
    icon: IconRocket,
    title: "Fast & Modern",
    description: "Built with Next.js and Astro for optimal performance",
  },
  {
    icon: IconBuildingStore,
    title: "Ready to Sell",
    description: "Supported by Stripe connect",
  },
  {
    icon: IconCode,
    title: "Developer Friendly",
    description: "Plugin ecosystem & custom integrations",
  },
];

const create_links = (prefix?: string) => {
  return [
    {
      href: "/stores",
      icon: IconShoppingBag,
      label: "Browse Stores",
      variant: "gradient",
      gradient: { from: "indigo", to: "cyan" },
    },
    {
      href: `${prefix}/blog`,
      icon: IconFileTypeDoc,
      label: "Documentation",
      variant: "light",
    },
    {
      href: `${prefix}/about`,
      icon: IconBrandMysql,
      label: "About",
      variant: "light",
    },
    {
      href: "https://github.com/calimania/markketplace-next",
      icon: IconBrandGithub,
      label: "GitHub",
      variant: "light",
    },
    {
      href: `${prefix}/about/newsletter`,
      icon: IconRadio,
      label: "Newsletter",
      variant: "gradient",
      gradient: { from: "#1b57ad", to: "#367de4" },
    },
  ];
};

/**
 * Default page displayed to the user, when a main store exists we display the store's logo and description
 *
 * @returns {JSX.Element}
 */
export default function Home() {
  const { isLoggedIn } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [page, setPage] = useState<any>(null);
  console.log(isLoggedIn());
  useEffect(() => {
    async function fetchData() {
      const storeResponse = await strapiClient.getStore();
      setStore(storeResponse?.data?.[0]);

      const pageResponse = await strapiClient.getPage("home");
      setPage(pageResponse?.data?.[0]);
    }

    fetchData();
  }, []);
  const links = create_links(store ? `/store/${store?.slug}` : "");

  return (
    <Container size="lg" className="py-20">
      <Stack gap="xl">
        {/* Hero Section */}
        <div className="text-center">
          <img
            src={store?.Logo?.url || defaultLogo}
            alt={store?.SEO?.metaTitle || "Markket Logo"}
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          <Title className="text-4xl md:text-5xl mb-4">
            Welcome to {store?.SEO?.metaTitle || "Markket"}
          </Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            {store?.SEO?.metaDescription || "eCommerce"}
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
              target={link.href.startsWith("http") ? "_blank" : undefined}
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

        <Paper
          shadow="sm"
          p="xl"
          mt="xl"
          withBorder
          className="bg-gradient-to-r from-gray-50 to-gray-100"
        >
          <Stack align="center" gap="md">
            <Title order={2} size="h3" ta="center">
              Ready to start your store?
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={600}>
              Create your account today and join our growing community
            </Text>
            <Group mt="md">
              <Button
                component="a"
                href="/auth/"
                size="lg"
                leftSection={<IconHeartCode size={20} />}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
              >
                Auth
              </Button>
              <Button
                component="a"
                href="/auth/login"
                size="lg"
                leftSection={<IconLogin2 size={20} />}
                variant="light"
              >
                Sign In
              </Button>
            </Group>
          </Stack>
        </Paper>
        {page?.Content && <PageContent params={{ page }} />}
      </Stack>
    </Container>
  );
}
