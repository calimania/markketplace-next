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
    <Container size="md" py="xl" className='dashboard-page'>
      <Stack gap="xl">
        <MotionPaper
          withBorder
          p="xl"
          radius="md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50"
        >
          <Stack gap="md">
            <Group>
              <ThemeIcon size={44} radius="md" color="blue">
                <IconRocket size={24} />
              </ThemeIcon>
              <div>
                <Title order={1} size="h2">¡¡Markkët Dashboard!</Title>
                <Title order={4}>
                  your electromechanical commerce portal
                </Title>
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
          <Timeline active={stores?.length ? 1 : 0} bulletSize={32} lineWidth={4} >
            <Timeline.Item
              bullet={<IconBuildingStore size={12} />}
              title="It starts with a story"
            >
              <Text c="dimmed" size="sm">
                A store is your base unit in the mall, each one has its own id, brand, unique content,
                images, blog & catalogues
              </Text>
              {!stores.length && (<Button
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                mt="md"
                component="a"
                href="/dashboard/stores/new"
              >
                Start Creating
              </Button>)}
            </Timeline.Item>

            <Timeline.Item
              bullet={<IconPalette size={12} />}
              title="Make it yours"
            >
              <Text c="dimmed" size="sm">
                Add titles, logos & links and you have a landing page ready to share!
              </Text>

              {stores.length ? (<Button
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                mt="md"
                component="a"
                href="/dashboard/stores/new"
              >
                Store Dashboard
              </Button>) : null}
            </Timeline.Item>
            <Timeline.Item
              bullet={<IconArticle size={12} />}
              title="Write a litte"
            >
              <Text c="dimmed" size="sm">
                Publish pages and articles to tell your story, inspire your audience
              </Text>
            </Timeline.Item>
            <Timeline.Item
              bullet={<IconLibraryPhoto size={12} />}
              title="Add Pictures"
            >
              <Text c="dimmed" size="sm">
                Decorate your posts, and products uploading your branded images
              </Text>
            </Timeline.Item>
            <Timeline.Item
              bullet={<IconShoppingCart size={12} />}
              title="Continuous Improvement"
            >
              <Text c="dimmed" size="sm">
                Preview your bazaar, share it, enjoy the compliments! implement feedback
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
                  title: 'Be original',
                  description: 'Create from your heart',
                },
                {
                  title: 'Participate',
                  description: 'Find support & be supportive ',
                },
                {
                  title: 'Follow excellence',
                  description: 'Success will chase you',
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
