import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/admin',
        '/business/listings',
        '/business/settings',
        '/dashboard',
        '/auth',
        '/profile',
        '/support',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
