import type { Metadata } from 'next';
import { Suspense } from 'react';
import RSVPConfirmationView from './rsvp.view';

export const metadata: Metadata = {
  title: 'Your RSVP | Markketplace',
  description: 'View your event RSVP confirmation.',
  robots: { index: false, follow: false },
};

export default function RSVPPage() {
  return (
    <Suspense>
      <RSVPConfirmationView />
    </Suspense>
  );
}
