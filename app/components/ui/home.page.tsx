'use client';

import { useEffect, useState } from "react";
import {
  IconRocket, IconBrandGithub, IconBuildingStore, IconCode,
  IconShoppingBag, IconFileTypeDoc, IconRadio,
  IconHeartCode, IconSailboat, IconArrowRight,
} from "@tabler/icons-react";
import {
  Container, Title, Text, Button, Group, Stack, SimpleGrid,
  Paper, BackgroundImage, rem
} from "@mantine/core";
import { FeatureCard } from "@/app/components/ui/feature.card";
import { Store, Page, Album } from "@/markket";
import PageContent from '@/app/components/ui/page.content';
import { useAuth } from "@/app/providers/auth.provider";
import Albums from '@/app/components/ui/albums.grid';
import { markketConfig } from "@/markket/config";

const features = [
  {
    icon: IconRocket,
    title: "Performance & Security ",
    description: "Created with code & algorithms, bioorganic inteligence"
  },
  {
    icon: IconBuildingStore,
    title: "Quickstart prototypes",
    description: "Launch with easy landing pages, hyperlinks & payments"
  },
  {
    icon: IconCode,
    title: "Devs & hackers",
    description: "Open source templates, self-host & community support"
  },
];

const create_links = (prefix?: string) => {
  return [
    {
      href: `/docs`,
      icon: IconFileTypeDoc,
      label: "Blog ",
      variant: "gradient",
      gradient: { from: 'indigo', to: 'cyan' }
    },
    {
      href: `${prefix}/about`,
      icon: IconSailboat,
      label: "About",
      variant: "light"
    },
    {
      href: "https://github.com/search?q=org%3Acalimania+markket&type=repositories",
      icon: IconBrandGithub,
      label: "GitHub",
      variant: "light"
    },
    {
      href: `/newsletter`,
      icon: IconRadio,
      label: 'Newsletter',
      variant: 'gradient',
      gradient: { from: '#1b57ad', to: '#367de4' }
    }
  ];
}

type HomePageProps = {
  store?: Store;
  page?: Page;
};



const HomePage = ({ store, page }: HomePageProps) => {
  const [links] = useState(create_links(store ? `/store/${store?.slug}` : ''));
  const { maybe } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log('x')
    setIsLoggedIn(maybe());
  }, [maybe]);

  return (
    <div className="min-h-screen markketpage homepage">
      <BackgroundImage
        className="homepage-hero"
        src={store?.Cover?.url || markketConfig.blank_cover_url}
        h={rem(500)}
      >
        <Container size="lg" h="100%" className="relative z-10">
          <div className="flex flex-col justify-center items-center h-full text-center text-white ">
            <img
              src={store?.Logo?.url || markketConfig.blank_logo_url}
              alt={store?.SEO?.metaTitle || 'Markkët'}
              width={150}
              height={150}
              className="mb-8 rounded-2xl shadow-2xl bg-slate-50"
            />
            <Title className="text-5xl md:text-6xl font-bold mb-6 text-white bg-slate-900 p-2">
              {store?.SEO?.metaTitle || store?.title || 'Mall'}
            </Title>
            <div className="my-2">
              <Title order={2} className="max-w-2xl mb-8 text-gray-200 bg-slate-800 p-2">
                {store?.SEO?.metaDescription || 'Markkët'}
              </Title>
            </div>
            <Group gap="md">
              <Button
                size="xl"
                variant="gradient"
                gradient={{ from: 'cyan', to: 'indigo' }}
                leftSection={<IconShoppingBag size={20} />}
                component="a"
                href="/stores"
              >
                Mall
              </Button>
              <Button
                size="xl"
                variant="subtle"
                color="white"
                className="text-white border-white hover:bg-white transition-all"
                component="a"
                leftSection={<IconArrowRight size={20} />}
                href={!isLoggedIn ? '/auth/magic' : '/dashboard/store'}
              >
                {!isLoggedIn ? 'Get Started' : 'Dashboard'}
              </Button>
            </Group>
          </div>
        </Container>
      </BackgroundImage>

      <Container size="lg" className="py-20">
        <Stack gap="xl">
          <Group justify="center" gap="md" wrap="wrap" className="py-10">
            {links.map((link) => (
              <Button
                key={link.href}
                component="a"
                href={link.href}
                leftSection={<link.icon size={20} />}
                variant={link.variant}
                gradient={link.gradient}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                size="lg"
                className="transform hover:scale-105 transition-transform"
              >
                {link.label}
              </Button>
            ))}
          </Group>
          <div className="py-10">
            <Title order={2} size="h1" ta="center" mb="xl">
              Markkët
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {features.map((feature, index) => (
                <div key={index} className="transform hover:-translate-y-2 transition-transform">
                  <FeatureCard {...feature} />
                </div>
              ))}
            </SimpleGrid>
          </div>
        </Stack>
      </Container>
      <Paper
        shadow="lg"
        p="xl"
        mt="xl"
        withBorder
        className="bg-gradient-to-r from-blue-50 to-indigo-50"
      >
        <Stack align="center" gap="md">
          <Title order={2} size="h2" ta="center" className="gradient-text">
            {isLoggedIn ? 'Content Manager' : 'Whoa, whoa, whoa'}
          </Title>
          {!isLoggedIn && (
            <Text c="dimmed" size="xl" ta="center" maw={600}>
              verify an email, write a title, add some pages, an article. <br />Baby, you&apos;ve got a store going
            </Text>
          )}
          <Group mt="xl">
            <Button
              component="a"
              href={isLoggedIn ? "/dashboard/store" : "/auth/magic"}
              size="xl"
              leftSection={<IconHeartCode size={24} />}
              variant="white"
              className="transform hover:scale-105 transition-transform text-white border-fuchsia-300"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Group>
          <Text c="dimmed" size="sm" ta="center" maw={600} my="xl">
            Dreams are worth fighting for, are you gonna be an artist or are you gonna be a doctor?!
          </Text>
        </Stack>
      </Paper>
      <Container size="lg" className="py-20">
        <Stack gap="xl">
          {page?.albums && page.albums.length > 0 && (
            <div className="py-10">
              <Title order={2} size="h2" ta="center" mb="xl">
                Calima Collections
              </Title>
              <Albums albums={page.albums as Album[]} store_slug={store?.slug as ''} />
            </div>
          )}

          {page?.Content && (
            <Container>
              <PageContent params={{ page }} />
            </Container>
          )}
        </Stack>
      </Container>
    </div>
  );
}

export default HomePage;
