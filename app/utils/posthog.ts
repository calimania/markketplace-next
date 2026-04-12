import { PostHog } from 'posthog-node'
import { markketplace } from '@/markket/config';

export default function PostHogClient() {
  if (!markketplace.extensions.posthog.api_key) {
    return null;
  }

  const posthogClient = new PostHog(markketplace.extensions.posthog.api_key, {
    host: markketplace.extensions.posthog.api_host,
    flushAt: 1,
    flushInterval: 0
  })
  return posthogClient
};
