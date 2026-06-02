import type { ReactNode } from 'react';
import { MobileBottomNav, SiteNav } from '@/app/(site)/_components/site-nav';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SiteNav />
      <div className="page-root">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
