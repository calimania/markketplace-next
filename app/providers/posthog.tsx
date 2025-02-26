'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { JSX, useEffect } from 'react'

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY as string;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;

export function PostHogProvider({ children }: { children: JSX.Element }) {

  useEffect(() => {
    if (!POSTHOG_API_KEY) {
      return;
    }

    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST || 'https://i.posthog.com',
      capture_pageview: false
    })
  }, [])

  return (
    POSTHOG_API_KEY ? (
      <PHProvider client={posthog} >
        {children}
      </PHProvider>
    ) : children
  )
};
