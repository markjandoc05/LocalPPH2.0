import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/business/'],
      disallow: [
        '/admin',
        '/business',
        '/dashboard',
        '/auth',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
