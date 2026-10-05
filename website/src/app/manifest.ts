import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IIT Calendar — Buddhist Practice & Monastic Companion',
    short_name: 'IIT Calendar',
    description:
      'Astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script Pāli chanting, and serene meditation timers. 100% offline, free, and privacy-first.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffffd',
    theme_color: '#7f5700',
    icons: [
      {
        src: '/icons/icon-192.webp',
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
