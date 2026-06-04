import type { Metadata } from 'next';
import {
  Bebas_Neue,
  Barlow_Condensed,
  IBM_Plex_Mono,
  Inter,
} from 'next/font/google';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { SiteNav } from '@/components/ui/SiteNav';
import { PageTransition } from '@/components/providers/PageTransition';
import './globals.css';

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Project Anthology',
  description: 'Formula 1 data, news, circuits, and team radio — Project Anthology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlowCondensed.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <SiteNav />
        <PageTransition>
          <main className="site-main flex flex-1 flex-col">{children}</main>
        </PageTransition>
        <MobileBottomNav />
      </body>
    </html>
  );
}
