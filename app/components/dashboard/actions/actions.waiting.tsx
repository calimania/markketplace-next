import { Title, Paper, Stack, Text, Group } from '@mantine/core';
import { IconLoader, IconSeo, IconArticle, IconHome } from '@tabler/icons-react';

export type DashboardWaitingProps = {
  singular?: string;
  action?: string;
}

const tips = [
  {
    icon: <IconHome size={26} color="#0ea5e9" />,
    text: 'A store is the basic unit of content.'
  },
  {
    icon: <IconArticle size={26} color="#f472b6" />,
    text: 'Blog post & Pages to share brand updates.'
  },
  {
    icon: <IconSeo size={26} color="#fbbf24" />,
    text: 'SEO features control how bots see your site.'
  },
];

const DashboardWaitingAction = (props: DashboardWaitingProps) => {
  const { singular, action } = props;
  const verb = action === 'new' ? 'Creating' : 'Editing';

  return (
    <Paper radius="xl" shadow="lg" p="xl" className="brutal-waiting bg-gradient-to-br from-blue-50 to-fuchsia-50 border border-fuchsia-200 relative overflow-hidden" withBorder>
      <span className="absolute -top-8 left-8 w-24 h-24 bg-fuchsia-100 rounded-full opacity-30 z-0" />
      <span className="absolute bottom-0 right-0 w-32 h-32 bg-sky-100 rounded-full opacity-30 z-0" />
      <Stack align="center" gap="lg" className="relative z-10">
        <span className="inline-flex  rounded-full bg-yellow-100 p-4 shadow-md mb-2">
          <IconLoader size={36} className="animate-spin text-fuchsia-400" style={{ filter: 'drop-shadow(1px 1px 0 #fbbf24)' }} />
        </span>
        <Title order={3} fw={900} className="text-fuchsia-700 text-left tracking-tight mb-0">
          {verb} your {singular}
        </Title>
        <Text size="md" className="text-sky-700 font-semibold text-left mb-0">
          Vroom, Vroooom
        </Text>
        <Stack gap="sm" mt="sm" style={{ width: '100%' }}>
          {tips.map((tip, idx) => (
            <Group key={idx} gap="md">
              <span className="inline-flex items-center justify-center rounded-full bg-white p-1 shadow border border-fuchsia-100">
                {tip.icon}
              </span>
              <Text size="sm" className="text-sky-900">{tip.text}</Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DashboardWaitingAction;
