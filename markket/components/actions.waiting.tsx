import { Title, Paper, Stack, Text, Group } from '@mantine/core';
import {
  IconLoader, IconSeo, IconArticle, IconHome, IconPhoto, IconMusic, IconHeart, IconUsers, IconSparkles, IconBrandStripe, IconGift, IconPalette, IconMessageHeart
} from '@tabler/icons-react';

export type DashboardWaitingProps = {
  singular?: string;
  action?: string;
}

// Dynamic tips based on content type
function getTips(singular?: string) {
  const baseTips = [
    {
      icon: <IconHome size={26} color="#0ea5e9" />, text: 'A store is the basic unit of content'
    },
    {
      icon: <IconSeo size={26} color="#fbbf24" />, text: 'SEO features control how bots perceive you'
    },
    {
      icon: <IconHeart size={26} color="#f472b6" />, text: 'Kindness and creativity'
    },
  ];
  if (!singular) return baseTips;
  const s = singular.toLowerCase();

  // Use switch(true) for expressive matching
  switch (true) {
    case /article/.test(s):
      return [
        { icon: <IconArticle size={26} color="#f472b6" />, text: 'Share your stories to connect with readers' },
        { icon: <IconSeo size={26} color="#fbbf24" />, text: 'Great posts get shared by your fans' },
        { icon: <IconMessageHeart size={26} color="#e879f9" />, text: 'Inspire, inform, and build community' },
      ];
    case /page/.test(s):
      return [
        { icon: <IconHome size={26} color="#0ea5e9" />, text: 'Static pages to explain your store' },
        { icon: <IconSeo size={26} color="#fbbf24" />, text: 'Optimize for discovery' },
        { icon: <IconSparkles size={26} color="#a21caf" />, text: 'Decoreate with art' },
      ];
    case /product/.test(s):
      return [
        { icon: <IconGift size={26} color="#fbbf24" />, text: 'Offer your creations' },
        { icon: <IconPhoto size={26} color="#0ea5e9" />, text: 'Digital & Physical products' },
        { icon: <IconBrandStripe size={26} color="#635bff" />, text: 'Secure payments powered by Stripe' },
      ];
    case /album|track/.test(s):
      return [
        { icon: <IconMusic size={26} color="#0ea5e9" />, text: 'Collections to group similar things' },
        { icon: <IconPalette size={26} color="#fbbf24" />, text: 'Easy to share' },
        { icon: <IconUsers size={26} color="#a21caf" />, text: 'in your homepage, or private links' },
      ];
    default:
      return baseTips;
  }
}

const DashboardWaitingAction = (props: DashboardWaitingProps) => {
  const { singular, action } = props;
  const verb = action === 'new' ? 'Creating' : 'Editing';
  const tips = getTips(singular);

  return (
    <Paper radius="xl" shadow="lg" p="xl" className="brutal-waiting mb-8 bg-gradient-to-br from-blue-50 to-fuchsia-50 border border-fuchsia-200 relative overflow-hidden" withBorder>
      {/* Extra neobrutal shapes */}
      <span className="absolute -top-8 left-8 w-24 h-24 bg-fuchsia-100 rounded-full opacity-30 z-0" />
      <span className="absolute bottom-0 right-0 w-32 h-32 bg-sky-100 rounded-full opacity-30 z-0" />
      <span className="absolute top-1/2 left-1/2 w-40 h-10 bg-yellow-100 rounded-lg opacity-20 z-0 rotate-12" />
      <span className="absolute top-10 right-24 w-16 h-16 bg-pink-200 rounded-full opacity-20 z-0" />
      <Stack align="center" gap="lg" className="relative z-10">
        <span className="inline-flex rounded-full bg-yellow-100 p-4 shadow-md mb-2 border-4 border-fuchsia-300 brutal-shadow animate-bounce">
          <IconLoader size={36} className="animate-spin text-fuchsia-400" style={{ filter: 'drop-shadow(1px 1px 0 #fbbf24)' }} />
        </span>
        <Title order={3} fw={900} className="text-fuchsia-700 text-left tracking-tight mb-0 brutal-shadow">
          {verb} your {singular}
        </Title>
        <Text size="md" className="text-sky-700 font-semibold text-left mb-0">
          Vroom, Vroooom
        </Text>
        <Stack gap="sm" mt="sm" style={{ width: '100%' }}>
          {tips.map((tip, idx) => (
            <Group key={idx} gap="md">
              <span className="inline-flex items-center justify-center rounded-full bg-white p-1 shadow border border-fuchsia-100 brutal-shadow">
                {tip.icon}
              </span>
              <Text size="sm" className="text-sky-900">{tip.text}</Text>
            </Group>
          ))}
        </Stack>
        <Group>
          <IconHeart size={16} className="inline ml-1" color="#f472b6" />
          <Text size="xs" className="text-center text-fuchsia-500 mt-4 brutal-shadow">
            Thanks to modern innovations, artists can feed their cats!
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default DashboardWaitingAction;
