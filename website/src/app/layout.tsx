import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#7f5700',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://iit.damsak.org'),
  title: {
    default: 'IIT Calendar — Buddhist Lunar Calendar, Vinaya Solar Calculations & Chanting Companion',
    template: '%s | IIT Calendar',
  },
  description:
    'A quiet, reverent companion app for Buddhist monastics and lay practitioners. Astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script Pāli chanting, and serene meditation timers. 100% offline, free, and privacy-first.',
  applicationName: 'IIT Calendar',
  keywords: [
    'IIT Calendar',
    'Buddhist Calendar',
    'Theravada Calendar',
    'Uposatha Observance',
    'Vinaya Solar Calculations',
    'Dawn rise Arunuggamana',
    'Solar Noon Majjhanhike',
    'Pali Chants',
    'Aksharamukha Pali Scripts',
    'Meditation Timer',
    'Offline Buddhist App',
    'International Institute of Theravada',
    'Monastic Companion',
    'Buddhist Moon Phases',
  ],
  authors: [{ name: 'International Institute of Theravada (IIT)', url: 'https://iit.damsak.org' }],
  creator: 'International Institute of Theravada',
  publisher: 'International Institute of Theravada',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'IIT Calendar — Buddhist Practice & Monastic Companion',
    description:
      'Astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script Pāli chanting, and serene stillness timers. 100% offline and free.',
    url: 'https://iit.damsak.org',
    siteName: 'IIT Calendar',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'IIT Calendar Monastery Emblem',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'IIT Calendar — Buddhist Practice & Monastic Companion',
    description:
      'Astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script Pāli chanting, and serene stillness timers. 100% offline and free.',
    images: ['/logo.png'],
    creator: '@iitsldev',
  },
  icons: {
    icon: [
      { url: '/icons/icon-48.webp', sizes: '48x48', type: 'image/webp' },
      { url: '/icons/icon-96.webp', sizes: '96x96', type: 'image/webp' },
      { url: '/icons/icon-192.webp', sizes: '192x192', type: 'image/webp' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.webp', sizes: '192x192' },
      { url: '/logo.png', sizes: '512x512' },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'IIT Calendar',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://iit.damsak.org/#website',
      url: 'https://iit.damsak.org',
      name: 'IIT Calendar',
      description: 'Buddhist Lunar Calendar, Vinaya Solar Calculations & Chanting Companion',
      publisher: {
        '@id': 'https://iit.damsak.org/#organization',
      },
      inLanguage: ['en', 'si', 'my', 'th', 'vi', 'km', 'lo'],
    },
    {
      '@type': 'Organization',
      '@id': 'https://iit.damsak.org/#organization',
      name: 'International Institute of Theravada',
      url: 'https://iit.damsak.org',
      logo: 'https://iit.damsak.org/logo.png',
      sameAs: ['https://github.com/iitsldev/iit-calendar'],
    },
    {
      '@type': 'MobileApplication',
      '@id': 'https://iit.damsak.org/#app',
      name: 'IIT Calendar',
      operatingSystem: 'iOS, Android',
      applicationCategory: 'LifestyleApplication',
      applicationSubCategory: 'ReligiousApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      installUrl: [
        'https://apps.apple.com/app/iit-calendar/id6470000000',
        'https://play.google.com/store/apps/details?id=com.iitcalendar.applet&pcampaignid=web_share',
      ],
      screenshot: [
        'https://iit.damsak.org/screenshots/calendar.png',
        'https://iit.damsak.org/screenshots/chants.png',
        'https://iit.damsak.org/screenshots/meditation.png',
        'https://iit.damsak.org/screenshots/books.png',
        'https://iit.damsak.org/screenshots/study.png',
      ],
      featureList: [
        'Astronomical Vinaya Solar Calculations (Arunuggamana Dawn, Majjhanhike Solar Noon)',
        'Multi-Tradition Uposatha Observance (Maha Nikaya, Dhammayuttika, Amarapura-Ramanna)',
        'Multi-Script Pāli Chanting (Sinhala, Burmese, Thai, Khmer, Lao, Devanagari, Roman)',
        'Serene Offline Meditation Timer with Authentic Monastic Bell Sounds',
        'Pāli Grammar and Vinaya Reference Library',
        '100% Offline & Free Dāna Software without Ads or Tracking',
      ],
      author: {
        '@id': 'https://iit.damsak.org/#organization',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
