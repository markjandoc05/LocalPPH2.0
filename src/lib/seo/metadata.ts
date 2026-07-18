import { getShortDesc } from '@/lib/utils';

export const SITE_NAME = 'LocalPages.ph';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localpages.ph';
export const SITE_SOCIAL_IMAGE = '/images/localpages-ph-cover.png';

const cleanText = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
};

const splitTerms = (value?: string | null) => {
  return cleanText(value)
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export const generatePageMetadata = (
  title: string,
  description: string,
  path: string
) => {
  const url = `${SITE_URL}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'website',
      images: [
        {
          url: SITE_SOCIAL_IMAGE,
          width: 1161,
          height: 630,
          alt: 'LocalPages.ph - Find Trusted Local Businesses in the Philippines',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_SOCIAL_IMAGE],
    },
  };
};

export const generateBusinessMetadata = (business: any) => {
  if (!business || business.status !== 'APPROVED') {
    return {
      title: 'Business Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const category = cleanText(business.categoryName) || 'Local Business';
  const city = cleanText(business.cityName);
  const province = cleanText(business.provinceName);
  const location = [city, province].filter(Boolean).join(', ') || 'Philippines';
  const title = `${business.name} – ${category} in ${location} | ${SITE_NAME}`;
  const shortDesc = cleanText(getShortDesc(business.description));
  const services = cleanText(business.services);
  const products = cleanText(business.products);
  const keywordTerms = [
    business.name,
    category,
    business.subcategoryName,
    city,
    province,
    business.regionName,
    ...splitTerms(business.keywords),
    ...splitTerms(products),
    ...splitTerms(services),
  ].filter(Boolean);
  const descriptionSource =
    shortDesc ||
    services ||
    products ||
    `Find contact information, location, services, products, business hours, and business details for ${business.name} in ${location} on ${SITE_NAME}.`;
  const description = descriptionSource.slice(0, 155) + (descriptionSource.length > 155 ? '...' : '');
  const url = `${SITE_URL}/business/${business.slug}`;
  const imageUrl = toAbsoluteUrl(business.coverUrl || business.logoUrl) || toAbsoluteUrl(SITE_SOCIAL_IMAGE);

  return {
    title,
    description,
    keywords: Array.from(new Set(keywordTerms)).slice(0, 24),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1161,
          height: 630,
          alt: `${business.name} on ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
};
