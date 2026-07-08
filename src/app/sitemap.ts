import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';
import { provider } from '@/lib/data-connect/provider'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ];

  try {
    const { data } = await provider.getAllBusinesses({ status: 'APPROVED' });
    const approved = data.businesses;
    
    const businessRoutes = approved.map((business: any) => ({
      url: `${SITE_URL}/business/${business.slug}`,
      lastModified: business.updatedAt ? new Date(business.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...businessRoutes];
  } catch (error) {
    console.warn('Skipping dynamic business routes in sitemap because database is not connected/reachable during build.');
    return routes;
  }
}

