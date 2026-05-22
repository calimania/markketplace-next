'use client';

import { AppShell, Burger, Container, Group, Button, Text, Stack, Divider, Box, Paper, Anchor } from "@mantine/core";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { Store } from '@/markket/store.d';
import { StoreVisibility } from '@/markket/store.visibility.d';
import { markketColors } from '@/markket/colors.config';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';
import { useAuth } from '@/app/providers/auth.provider';
import AccountButton from '@/app/components/ui/account.button';
import './store-navbar.css';

function StoreNavigation({ slug, visibility, onNavigate }: { slug: string; visibility?: StoreVisibility | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const hasProducts = visibility ? visibility.content_summary.products_count > 0 : true;
  const hasBlog = visibility ? visibility.content_summary.articles_count > 0 : true;
  const hasEvents = visibility ? visibility.content_summary.events_count > 0 : true;
  const hasAbout = visibility ? visibility.content_summary.pages_count > 0 : true;

  const navLinks = [
    {
      href: `/${slug}/products`,
      label: 'Products',
      show: visibility ? visibility.show_shop && hasProducts : true,
      color: markketColors.sections.shop.main,
    },
    {
      href: `/${slug}/blog`,
      label: 'Blog',
      show: visibility ? visibility.show_blog && hasBlog : true,
      color: markketColors.sections.blog.main,
    },
    {
      href: `/${slug}/events`,
      label: 'Events',
      show: visibility ? visibility.show_events && hasEvents : true,
      color: markketColors.sections.events.main,
    },
    {
      href: `/${slug}/about`,
      label: 'About',
      show: visibility ? visibility.show_about && hasAbout : true,
      color: markketColors.sections.about.main,
    },
    {
      href: `/${slug}/about/newsletter`,
      label: 'Newsletter',
      show: visibility ? visibility.show_newsletter : true,
      color: markketColors.sections.newsletter.main,
    },
  ].filter(link => link.show);

  return (
    <Stack gap="lg" w="100%" h="100%">
      <Stack gap="xs">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            <Button
              variant="subtle"
              fullWidth
              justify="flex-start"
              className="store-nav-btn"
              data-active={pathname === link.href ? 'true' : undefined}
              style={{ color: pathname === link.href ? link.color : markketColors.neutral.charcoal, fontWeight: 600 }}
            >
              {link.label}
            </Button>
          </Link>
        ))}
      </Stack>
      <Box className="mt-auto">
        <Divider my="md" />
        <Stack gap="xs">
          <Link href="/" onClick={onNavigate}>
            <Button
              variant="light"
              fullWidth
              justify="flex-start"
              size="sm"
              className="store-nav-home"
            >
              Markkët
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
  const { user } = useAuth();

  const handleNavigation = () => {
    close();
  };

  const storeInitial = (store?.title || store?.SEO?.metaTitle || store?.slug || 'S').charAt(0).toUpperCase();
  const logoUrl = store?.Logo?.url;
  const hasProducts = visibility ? visibility.content_summary.products_count > 0 : true;
  const hasBlog = visibility ? visibility.content_summary.articles_count > 0 : true;
  const hasEvents = visibility ? visibility.content_summary.events_count > 0 : true;
  const hasAbout = visibility ? visibility.content_summary.pages_count > 0 : true;

  // Generate nav links for header
  const headerNavLinks = [
    {
      href: `/${store?.slug}/products`,
      label: 'Shop',
      show: visibility ? visibility.show_shop && hasProducts : true,
      color: markketColors.sections.shop.main,
    },
    {
      href: `/${store?.slug}/blog`,
      label: 'Blog',
      show: visibility ? visibility.show_blog && hasBlog : true,
      color: markketColors.sections.blog.main,
    },
    {
      href: `/${store?.slug}/events`,
      label: 'Events',
      show: visibility ? visibility.show_events && hasEvents : true,
      color: markketColors.sections.events.main,
    },
    {
      href: `/${store?.slug}/about`,
      label: 'About',
      show: visibility ? visibility.show_about && hasAbout : true,
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
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={store?.SEO?.metaTitle || store?.title || 'Store logo'}
                        style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
                      />
                    ) : (
                      <Box
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: markketColors.gradients.hero,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {storeInitial}
                      </Box>
                    )}
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
                  className="store-header-link"
                  data-active={pathname === link.href ? 'true' : undefined}
                  style={{ color: pathname === link.href ? link.color : markketColors.neutral.charcoal, fontWeight: 600 }}
                >
                  {link.label}
                </Button>
              ))}
            </Group>

            {/* User Menu */}
            <AccountButton />
          </Group>
        </Container>
        </AppShell.Header>
      )}

      {!embedded && (
        <AppShell.Navbar p="md" className="store-shell-navbar">
        <Stack h="100%" gap="md">
          {/* Store Branding */}
          <Box>
              <Link href={`/${store?.slug}`} onClick={handleNavigation} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Group gap="sm" mb="xs" wrap="nowrap">
                {logoUrl ? (
                <img
                    src={logoUrl}
                  alt={store.SEO?.metaTitle || store.title}
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                />
                ) : (
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: markketColors.gradients.hero,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {storeInitial}
                  </Box>
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
              </Link>
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
                  <Text size="sm" c="dimmed">
                    {"(◕‿◕✿)"}
                  </Text>
                </Box>
                <Anchor component={Link} href="/" underline="never">
                  <Button
                    variant="light"
                    color="gray"
                    radius="xl"
                  >
                    markkët
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
