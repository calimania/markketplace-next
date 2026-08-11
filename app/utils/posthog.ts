import { PostHog } from 'posthog-node'
import { markketplace } from '@/markket/config';

const client: { ph?: PostHog } = { ph: undefined };

export default function PostHogClient() {
  if (!markketplace.extensions.posthog.api_key) {
    return null;
  }

  if (client.ph) return client.ph;

  client.ph = new PostHog(markketplace.extensions.posthog.api_key, {
    host: markketplace.extensions.posthog.host,
    flushAt: 1,
    flushInterval: 0
  });

  return client.ph;
};


