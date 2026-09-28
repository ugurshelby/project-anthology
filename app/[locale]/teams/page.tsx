import { redirect } from 'next/navigation';

/** /drivers and /teams merged into a single "Grid" page (2026-07 redesign). */
export default function TeamsGridPage() {
  redirect('/grid');
}
