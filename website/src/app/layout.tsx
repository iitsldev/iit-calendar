import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#7f5700',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://sati.theravado.com'),
  title: {
    default: 'Sati — Buddhist Lunar Calendar, Vinaya Solar Calculations & Chanting Companion',
    template: '%s | Sati',
  },
  description:
    'A quiet, reverent companion app for Buddhist monastics and lay practitioners. Astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script Pāli chanting, and serene meditation timers. 100% offline, free, and privacy-first.',
  applicationName: 'Sati',
  keywords: [
    'Sati',
    'Sati App',
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
  authors: [{ name: 'International Institute of Theravada (IIT)', url: 'https://theravado.com' }],
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
    title: 'Sati — Buddhist Practice & Monastic Companion',
    description:
      'Astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script Pāli chanting, and serene stillness timers. 100% offline and free.',
    url: 'https://sati.theravado.com',
    siteName: 'Sati',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Sati Monastery Emblem',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sati — Buddhist Practice & Monastic Companion',
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
    title: 'Sati',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: 'WydCc_btFlhAVngJby8kygyAfdrvApdFznLUYpYClc8',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://sati.theravado.com/#website',
      url: 'https://sati.theravado.com',
      name: 'Sati',
      description: 'Buddhist Lunar Calendar, Vinaya Solar Calculations & Chanting Companion',
      publisher: {
        '@id': 'https://theravado.com/#organization',
      },
      inLanguage: ['en', 'si', 'my', 'th', 'vi', 'km', 'lo'],
    },
    {
      '@type': 'Organization',
      '@id': 'https://theravado.com/#organization',
      name: 'International Institute of Theravada',
      url: 'https://theravado.com',
      logo: 'https://sati.theravado.com/logo.png',
      sameAs: ['https://github.com/iitsldev/iit-calendar'],
    },
    {
      '@type': 'MobileApplication',
      '@id': 'https://sati.theravado.com/#app',
      name: 'Sati',
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
        'https://sati.theravado.com/screenshots/calendar.png',
        'https://sati.theravado.com/screenshots/chants.png',
        'https://sati.theravado.com/screenshots/meditation.png',
        'https://sati.theravado.com/screenshots/books.png',
        'https://sati.theravado.com/screenshots/study.png',
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
        '@id': 'https://theravado.com/#organization',
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
