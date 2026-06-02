import type { Metadata } from 'next';
import { Bebas_Neue, Barlow_Condensed, IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-condensed',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Project Anthology',
  description: 'F1 anthology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${barlowCondensed.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
