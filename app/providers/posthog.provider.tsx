'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { JSX, useEffect } from 'react'
import PostHogPageView from "@/app/components/pageView"
import { markketplace } from '@/markket/config'

const resolvePostHogHost = () => {
  if (!markketplace.extensions.posthog.host) {
    return 'https://us.i.posthog.com';
  }

  try {
    return new URL(markketplace.extensions.posthog.host).toString().replace(/\/$/, '');
  } catch (error) {
    return 'https://us.i.posthog.com';
  }
};

export function PostHogProvider({ children }: { children: JSX.Element }) {
  useEffect(() => {
    if (!markketplace.extensions.posthog.api_key) {
      return;
    }

    try {
      posthog.init(markketplace.extensions.posthog.api_key, {
        api_host: resolvePostHogHost(),
        ui_host: 'https://us.posthog.com',
        capture_pageview: false,
        autocapture: true,
        disable_surveys: true,
        person_profiles: 'identified_only',
      });
    } catch (error) {
      console.error('[PostHog] Initialization failed.', error);
    }
  }, [markketplace.extensions.posthog.api_key]);

  return (
    markketplace.extensions.posthog.api_key ? (
      <PHProvider client={posthog} >
        <PostHogPageView />
        {children}
      </PHProvider>
    ) : children
  )
};
