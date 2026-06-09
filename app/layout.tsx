import type { Metadata } from 'next';
import {
  Bebas_Neue,
  Barlow_Condensed,
  IBM_Plex_Mono,
  Inter,
} from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SiteNav } from '@/components/ui/SiteNav';
import { PageTransition } from '@/components/providers/PageTransition';
import { SITE_NAME, SITE_TAGLINE, siteUrl, websiteJsonLd } from '@/lib/seo';
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
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  // Absolute canonical from the single URL source (siteUrl()), so it tracks the
  // real production origin instead of a hardcoded string.
  alternates: { canonical: siteUrl() },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
    url: siteUrl(),
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
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
        <script
          type="application/ld+json"
          // Static, server-rendered site schema — safe stringified JSON.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <SiteNav />
        <PageTransition>
          <main className="site-main flex flex-1 flex-col">{children}</main>
        </PageTransition>
        <Analytics />
      </body>
    </html>
  );
}
