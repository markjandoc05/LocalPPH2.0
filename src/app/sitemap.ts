import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';
import { provider } from '@/lib/data-connect/provider';

export const dynamic = 'force-dynamic';

const STATIC_LAST_MODIFIED = new Date('2026-07-11T00:00:00+08:00');
const cleanSiteUrl = SITE_URL.replace(/\/$/, '');

const toUrl = (path = '') => `${cleanSiteUrl}${path}`;
const toDate = (value?: string | Date | null) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: toUrl(),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: toUrl('/search'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: toUrl('/categories'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: toUrl('/locations'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: toUrl('/privacy'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: toUrl('/terms'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  try {
    const [
      businessesResult,
      categoriesResult,
      regionsResult,
      provincesResult,
      citiesResult,
    ] = await Promise.all([
      provider.getAllBusinesses({ status: 'APPROVED' }),
      provider.getCategories(),
      provider.getRegions(),
      provider.getProvinces(),
      provider.getCities(),
    ]);

    const approved = businessesResult.data.businesses || [];
    const categories = categoriesResult.data.categories || [];
    const regions = regionsResult.data.regions || [];
    const provinces = provincesResult.data.provinces || [];
    const cities = citiesResult.data.cities || [];

    const regionSlugById = new Map(regions.map((region: any) => [region.id, region.slug]));
    const provinceById = new Map(provinces.map((province: any) => [province.id, province]));
    
    const categoryRoutes = categories
      .filter((category: any) => category.slug && category.status !== false)
      .map((category: any) => ({
        url: toUrl(`/categories/${category.slug}`),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      }));

    const regionRoutes = regions
      .filter((region: any) => region.slug && region.status !== false)
      .map((region: any) => ({
        url: toUrl(`/locations/${region.slug}`),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      }));

    const provinceRoutes = provinces
      .filter((province: any) => province.slug && province.status !== false && regionSlugById.has(province.regionId))
      .map((province: any) => ({
        url: toUrl(`/locations/${regionSlugById.get(province.regionId)}/${province.slug}`),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));

    const cityRoutes = cities
      .filter((city: any) => {
        const province = provinceById.get(city.provinceId);
        return city.slug && province?.slug && province.status !== false && city.status !== false && regionSlugById.has(province.regionId);
      })
      .map((city: any) => {
        const province = provinceById.get(city.provinceId);
        return {
          url: toUrl(`/locations/${regionSlugById.get(province.regionId)}/${province.slug}/${city.slug}`),
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly' as const,
          priority: 0.55,
        };
      });

    const businessRoutes = approved
      .filter((business: any) => business.slug && business.status === 'APPROVED')
      .map((business: any) => ({
        url: toUrl(`/business/${business.slug}`),
        lastModified: toDate(business.updatedAt) || STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: business.isFeatured ? 0.75 : 0.6,
      }));

    return [
      ...routes,
      ...categoryRoutes,
      ...regionRoutes,
      ...provinceRoutes,
      ...cityRoutes,
      ...businessRoutes,
    ];
  } catch (error) {
    console.warn('Skipping dynamic sitemap routes because database is not connected/reachable.', error);
    return routes;
  }
}
