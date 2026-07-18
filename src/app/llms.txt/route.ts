import { SITE_NAME, SITE_URL } from '@/lib/seo/metadata';
import { provider } from '@/lib/data-connect/provider';

export const dynamic = 'force-dynamic';

const clean = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
};

const line = (label: string, value?: string | null) => {
  const nextValue = clean(value);
  return nextValue ? `  - ${label}: ${nextValue}` : '';
};

export async function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    'LocalPages.ph is a Philippine business directory for discovering approved local businesses, services, shops, restaurants, clinics, and professionals.',
    '',
    '## Important URLs',
    `- Homepage: ${SITE_URL}`,
    `- Business directory search: ${SITE_URL}/search`,
    `- Categories: ${SITE_URL}/categories`,
    `- Locations: ${SITE_URL}/locations`,
    `- XML sitemap: ${SITE_URL}/sitemap.xml`,
    '',
    '## Approved Business Listings',
  ];

  try {
    const result = await provider.getAllBusinesses({ status: 'APPROVED' });
    const businesses = result.data.businesses || [];

    businesses
      .filter((business: any) => business.slug && business.status === 'APPROVED')
      .forEach((business: any) => {
        const location = [business.cityName, business.provinceName, business.regionName].filter(Boolean).join(', ');
        lines.push('');
        lines.push(`### ${clean(business.name)}`);
        lines.push(`- URL: ${SITE_URL}/business/${business.slug}`);
        [
          line('Category', [business.categoryName, business.subcategoryName].filter(Boolean).join(' / ')),
          line('Location', location),
          line('Description', business.description),
          line('Products', business.products),
          line('Services', business.services),
          line('Business hours', business.businessHours),
          line('Contact number', business.contactMobile || business.contactPhone),
          line('Email', business.contactEmail),
          line('Website', business.websiteUrl),
          line('Keywords', business.keywords),
        ].filter(Boolean).forEach((entry) => lines.push(entry));
      });
  } catch (error) {
    console.warn('Unable to include dynamic business listings in llms.txt.', error);
    lines.push('- Approved business listing data is temporarily unavailable.');
  }

  lines.push('');
  lines.push('## Crawl Guidance');
  lines.push('- Prefer canonical business profile URLs under /business/{slug}.');
  lines.push('- Do not use private account areas such as /admin, /dashboard, /profile, /inquiries, or /business/listings as public sources.');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
