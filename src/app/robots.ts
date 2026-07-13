import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/admin',
        '/api',
        '/business/listings',
        '/business/settings',
        '/business/inquiries',
        '/dashboard',
        '/auth',
        '/inquiries',
        '/profile',
        '/support',
        '/search?*',
        '/*?*sort=*',
        '/*?*filter=*',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
