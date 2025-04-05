import { useAuth } from '@/app/providers/auth.provider';
import {
  Paper, Text, Title, Container, ThemeIcon,
  Timeline, Button, Group, Stack,
} from '@mantine/core';
import {
  IconBuildingStore, IconArticle, IconRocket,
  IconPalette, IconArrowRight, IconShoppingCart,
  IconLibraryPhoto
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper as any);

const OnboardingComponent = ({ }: { slug?: string }) => {
  const { stores } = useAuth();

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <MotionPaper
          withBorder
          p="xl"
          radius="md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Stack gap="md">
            <Group>
              <ThemeIcon size={44} radius="md" color="blue">
                <IconRocket size={24} />
              </ThemeIcon>
              <div>
                <Title order={1} size="h2">¡Welcome to Markkët!</Title>
                <Text c="dimmed" size="lg">
                  set up your electromechanical commerce store
                </Text>
              </div>
            </Group>
          </Stack>
        </MotionPaper>

        <MotionPaper
          withBorder
          p="xl"
          radius="md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Timeline active={stores?.length ? 1 : 0} bulletSize={24} lineWidth={2}>
            <Timeline.Item
              bullet={<IconBuildingStore size={12} />}
              title="Create your first Store"
            >
              <Text c="dimmed" size="sm">
                A store is the base unit in the mall, each store has its own brand, unique homepage,
                images, blog & catalogues
              </Text>
              {!stores.length && (<Button
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                mt="md"
                component="a"
                href="/dashboard/stores/new"
              >
                Create Store
              </Button>)}
            </Timeline.Item>

            <Timeline.Item
              bullet={<IconPalette size={12} />}
              title="Make it yours"
            >
              <Text c="dimmed" size="sm">
                Manage content, add images, titles and descriptions to personalize your store
              </Text>

              {stores.length && (<Button
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                mt="md"
                component="a"
                href="/dashboard/stores/new"
              >
                Store Dashboard
              </Button>)}
            </Timeline.Item>
            <Timeline.Item
              bullet={<IconLibraryPhoto size={12} />}
              title="Add Pictures"
            >
              <Text c="dimmed" size="sm">
                Upload some pictures with your brand colors & vibe, or use our
                algorithms to create some
              </Text>
            </Timeline.Item>
            <Timeline.Item
              bullet={<IconArticle size={12} />}
              title="Create Content"
            >
              <Text c="dimmed" size="sm">
                Start adding pages and articles to share your story. Build your brand
                with engaging content that connects with your audience.
              </Text>
            </Timeline.Item>

            <Timeline.Item
              bullet={<IconShoppingCart size={12} />}
              title="Start Sharing"
            >
              <Text c="dimmed" size="sm">
                Preview your bazaar, share it, and enjoy the compliments!
              </Text>
            </Timeline.Item>
          </Timeline>
        </MotionPaper>

        <MotionPaper
          withBorder
          p="xl"
          radius="md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Stack gap="md">
            <Title order={3}>Pro Tips 💡</Title>
            <Group gap="md">
              {[
                {
                  title: 'Dynamic',
                  description: 'Create Products, Articles & Collections',
                },
                {
                  title: 'Mobile Friendly',
                  description: 'Works great on all devices, optimized for performance',
                },
                {
                  title: 'Online Sales',
                  description: 'Set up Stripe to accept payments & receive payouts',
                },
              ].map((tip) => (
                <Paper
                  key={tip.title}
                  withBorder
                  p="md"
                  radius="md"
                  style={{ flex: 1 }}
                >
                  <Text fw={500} mb={4}>{tip.title}</Text>
                  <Text size="sm" c="dimmed">{tip.description}</Text>
                </Paper>
              ))}
            </Group>
          </Stack>
        </MotionPaper>

        <MotionPaper
          withBorder
          p="xl"
          radius="md"
          bg="blue.0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Group justify="space-between" align="center">
            <div>
              <Text fw={500} mb={4}>Need Help?</Text>
              <Text size="sm" c="dimmed">
                Check out our documentation or reach out to support@caliman.org
              </Text>
            </div>
            <Button
              component="a"
              href="/docs"
              variant="light" >View Docs</Button>
          </Group>
        </MotionPaper>
      </Stack>
    </Container>
  );
};

export default OnboardingComponent;
