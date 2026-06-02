import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.autosport.com' },
      { protocol: 'https', hostname: 'images.motorsport.com' },
      { protocol: 'https', hostname: 'cdn.the-race.com' },
      { protocol: 'https', hostname: 'storage.ghost.io' },
      { protocol: 'https', hostname: 'cdn-1.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-2.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-3.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-4.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-5.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-6.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-7.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-8.motorsport.com' },
      { protocol: 'https', hostname: 'cdn-9.motorsport.com' },
    ],
  },
};

export default nextConfig;
