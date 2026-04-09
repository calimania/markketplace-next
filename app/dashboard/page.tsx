import { redirect } from 'next/navigation';

// Old dashboard home — replaced by /me
// See: app/me/page.tsx
export default function DashboardHome() {
  redirect('/me');
}
