'use client';

import { AppShell, Burger, Container, Group, Button, Text, Stack, Divider, Box, Paper, Anchor } from "@mantine/core";
import { IconHome, IconShoppingCart, IconArticle, IconInfoCircle, IconArrowLeft, IconCalendar, IconNews } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { Store } from '@/markket/store.d';
import { StoreVisibility } from '@/markket/store.visibility.d';
import { markketColors } from '@/markket/colors.config';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';
import './store-navbar.css';

function StoreNavigation({ slug, visibility, onNavigate }: { slug: string; visibility?: StoreVisibility | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const navLinks = [
    {
      href: `/${slug}`,
      icon: <IconHome size={18} />,
      label: 'Home',
      show: visibility ? visibility.show_home : true,
      color: markketColors.neutral.charcoal,
    },
    {
      href: `/${slug}/products`,
      icon: <IconShoppingCart size={18} />,
      label: 'Products',
      show: visibility ? visibility.show_shop : true,
      color: markketColors.sections.shop.main,
    },
    {
      href: `/${slug}/blog`,
      icon: <IconArticle size={18} />,
      label: 'Blog',
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
    },
    {
      href: `/${slug}/events`,
      icon: <IconCalendar size={18} />,
      label: 'Events',
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
    },
    {
      href: `/${slug}/about`,
      icon: <IconInfoCircle size={18} />,
      label: 'About',
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
    },
    {
      href: `/${slug}/about/newsletter`,
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
              leftSection={<Box style={{ color: link.color }}>{link.icon}</Box>}
              fullWidth
              justify="flex-start"
              className="store-nav-btn"
              data-active={pathname === link.href ? 'true' : undefined}
              style={{ color: markketColors.neutral.charcoal, fontWeight: 600 }}
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
              leftSection={<IconArrowLeft size={18} />}
              fullWidth
              justify="flex-start"
              size="sm"
              className="store-nav-home"
            >
              Back to Markkët
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
  const embedded = useEmbeddedMode();
  const pathname = usePathname();

  const handleNavigation = () => {
    close();
  };

  // Generate nav links for header
  const headerNavLinks = [
    {
      href: `/${store?.slug}`,
      icon: <IconHome size={16} />,
      label: 'Home',
      show: visibility ? visibility.show_home : true,
      color: markketColors.neutral.charcoal,
    },
    {
      href: `/${store?.slug}/products`,
      icon: <IconShoppingCart size={16} />,
      label: 'Shop',
      show: visibility ? visibility.show_shop : true,
      color: markketColors.sections.shop.main,
    },
    {
      href: `/${store?.slug}/blog`,
      icon: <IconArticle size={16} />,
      label: 'Blog',
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
    },
    {
      href: `/${store?.slug}/events`,
      icon: <IconCalendar size={16} />,
      label: 'Events',
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
    },
    {
      href: `/${store?.slug}/about`,
      icon: <IconInfoCircle size={16} />,
      label: 'About',
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
    },
  ].filter(link => link.show);

  return (
    <AppShell
      header={embedded ? undefined : { height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          desktop: embedded ? true : !opened,
          mobile: embedded ? true : !opened,
        }
      }}
    >
      {!embedded && (
        <AppShell.Header className="store-shell-header">
        <Container size="lg">
          <Group justify="space-between" h="60px">
            <Group gap="md">
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                hiddenFrom="md"
              />
              <Link href={`/${store?.slug}`} onClick={handleNavigation} style={{ textDecoration: 'none' }}>
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
                  leftSection={<Box style={{ color: link.color }}>{link.icon}</Box>}
                  className="store-header-link"
                  data-active={pathname === link.href ? 'true' : undefined}
                  style={{ color: markketColors.neutral.charcoal, fontWeight: 600 }}
                >
                  {link.label}
                </Button>
              ))}
            </Group>
          </Group>
        </Container>
        </AppShell.Header>
      )}

      {!embedded && (
        <AppShell.Navbar p="md" className="store-shell-navbar">
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
                  <Text size="sm" fw={700} truncate>
                  {store?.title || store?.SEO?.metaTitle}
                </Text>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts="0.08em">
                    Explore Store
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
      )}

      <AppShell.Main p="xs" className="store-page">
        {children}
        {!embedded && (
          <Container size="lg" mt="xl" mb="xl">
            <Paper
              radius="xl"
              p="lg"
              style={{
                background: 'linear-gradient(135deg, rgba(250,250,250,0.96) 0%, rgba(245,245,245,0.92) 100%)',
                border: `1px solid ${markketColors.neutral.lightGray}`,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Group justify="space-between" align="center" gap="md" wrap="wrap">
                <Box>
                  <Text size="sm" fw={700} c="dark">
                    Leaving this storefront?
                  </Text>
                  <Text size="sm" c="dimmed">
                    Return to the Markkët homepage to browse other stores and sections.
                  </Text>
                </Box>
                <Anchor component={Link} href="/" underline="never">
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconArrowLeft size={18} />}
                    radius="xl"
                  >
                    Back to homepage
                  </Button>
                </Anchor>
              </Group>
            </Paper>
          </Container>
        )}
      </AppShell.Main>
    </AppShell>
  );
};
