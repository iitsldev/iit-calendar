import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://sati.theravado.com/sitemap.xml',
    host: 'https://sati.theravado.com',
  };
}
