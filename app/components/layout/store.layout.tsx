'use client';

import { AppShell, Burger, Container, Group, Button, Text, Stack, Divider, Box } from "@mantine/core";
import { IconHome, IconShoppingCart, IconLockBolt, IconArticle, IconInfoCircle, IconArrowLeft, IconCalendar, IconNews } from "@tabler/icons-react";
import Link from "next/link";
import { useDisclosure } from '@mantine/hooks';
import { Store } from '@/markket/store.d';
import { StoreVisibility } from '@/markket/store.visibility.d';
import { markketColors } from '@/markket/colors.config';
import './store-navbar.css';

function StoreNavigation({ slug, visibility, onNavigate }: { slug: string; visibility?: StoreVisibility | null; onNavigate?: () => void }) {
  const navLinks = [
    {
      href: `/store/${slug}`,
      icon: <IconHome size={18} />,
      label: 'Store Home',
      show: true, // Always show home
      color: markketColors.neutral.charcoal,
    },
    {
      href: `/store/${slug}/products`,
      icon: <IconShoppingCart size={18} />,
      label: 'Products',
      show: visibility ? visibility.show_shop : true,
      color: markketColors.sections.shop.main,
    },
    {
      href: `/store/${slug}/blog`,
      icon: <IconArticle size={18} />,
      label: 'Articles',
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
    },
    {
      href: `/store/${slug}/events`,
      icon: <IconCalendar size={18} />,
      label: 'Events',
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
    },
    {
      href: `/store/${slug}/about`,
      icon: <IconInfoCircle size={18} />,
      label: 'About',
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
    },
    {
      href: `/store/${slug}/about/newsletter`,
      icon: <IconNews size={18} />,
      label: 'Newsletter',
      show: visibility ? visibility.show_newsletter : true,
      color: markketColors.sections.newsletter.main,
    },
  ].filter(link => link.show);

  return (
    <Stack gap="lg" w="100%" h="100%">
      {/* Main Navigation */}
      <Stack gap="xs">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            <Button
              variant="subtle"
              leftSection={<Box style={{ color: markketColors.neutral.mediumGray }}>{link.icon}</Box>}
              fullWidth
              justify="flex-start"
              className="store-nav-btn"
              style={{ color: markketColors.neutral.charcoal, fontWeight: 400 }}
            >
              {link.label}
            </Button>
          </Link>
        ))}
      </Stack>

      {/* Footer Section */}
      <Box className="mt-auto">
        <Divider my="md" />
        <Stack gap="xs">
          <Link href="/" onClick={onNavigate}>
            <Button
              variant="light"
              color="gray"
              leftSection={<IconArrowLeft size={18} />}
              fullWidth
              justify="flex-start"
              size="sm"
            >
              Markkët Home
            </Button>
          </Link>
        </Stack>
      </Box>
    </Stack>
  );
}

type ClientLayoutProps = {
  children: React.ReactNode;
  store: Store;
  visibility?: StoreVisibility | null;
};

export function ClientLayout({
  children,
  store,
  visibility,
}: ClientLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();

  const handleNavigation = () => {
    close();
  };

  // Generate nav links for header
  const headerNavLinks = [
    {
      href: `/store/${store?.slug}`,
      icon: <IconHome size={16} />,
      label: 'Home',
      show: true,
      color: markketColors.neutral.charcoal,
    },
    {
      href: `/store/${store?.slug}/products`,
      icon: <IconShoppingCart size={16} />,
      label: 'Shop',
      show: visibility ? visibility.show_shop : true,
      color: markketColors.sections.shop.main,
    },
    {
      href: `/store/${store?.slug}/blog`,
      icon: <IconArticle size={16} />,
      label: 'Blog',
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
    },
    {
      href: `/store/${store?.slug}/events`,
      icon: <IconCalendar size={16} />,
      label: 'Events',
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
    },
    {
      href: `/store/${store?.slug}/about`,
      icon: <IconInfoCircle size={16} />,
      label: 'About',
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
    },
  ].filter(link => link.show);

  return (
    <AppShell
      header={{ height: 60, }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          desktop: !opened,
          mobile: !opened,
        }
      }}
    >
      <AppShell.Header>
        <Container size="lg">
          <Group justify="space-between" h="60px">
            <Group gap="md">
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                hiddenFrom="md"
              />
              <Link href={`/store/${store?.slug}`} onClick={handleNavigation} style={{ textDecoration: 'none' }}>
                <Group gap="sm">
                  <img
                    src={store?.Logo?.url}
                    alt={store?.SEO?.metaTitle}
                    style={{ height: '30px', width: 'auto' }}
                  />
                  <Text size="lg" fw={600} visibleFrom="sm" c="dark">
                    {store?.title || store?.SEO?.metaTitle}
                  </Text>
                </Group>
              </Link>
            </Group>

            {/* Desktop Navigation */}
            <Group gap="xs" visibleFrom="md">
              {headerNavLinks.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  variant="subtle"
                  size="sm"
                  leftSection={<Box style={{ color: markketColors.neutral.mediumGray }}>{link.icon}</Box>}
                  style={{ color: markketColors.neutral.charcoal, fontWeight: 400 }}
                >
                  {link.label}
                </Button>
              ))}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack h="100%" gap="md">
          {/* Store Branding */}
          <Box>
            <Group gap="sm" mb="xs" wrap="nowrap">
              {store?.Logo?.url && (
                <img
                  src={store.Logo.url}
                  alt={store.SEO?.metaTitle || store.title}
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                />
              )}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>
                  {store?.title || store?.SEO?.metaTitle}
                </Text>
                <Text size="xs" c="dimmed" fw={500} tt="uppercase" lts="0.05em">
                  Navigation
                </Text>
              </Box>
            </Group>
          </Box>

          {/* Navigation Links */}
          <StoreNavigation
            slug={store?.slug as string}
            visibility={visibility}
            onNavigate={handleNavigation}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main p="xs" className="store-page">
        {children}
      </AppShell.Main>
    </AppShell>
  );
};
