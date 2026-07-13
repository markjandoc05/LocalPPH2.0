import { getShortDesc } from '@/lib/utils';

export const SITE_NAME = 'LocalPages.ph';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localpages.ph';
export const SITE_SOCIAL_IMAGE = '/images/localpages-ph-cover.png';

const cleanText = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
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
  const descriptionSource = shortDesc || `Find contact information, location, services, and business details for ${business.name} on ${SITE_NAME}.`;
  const description = descriptionSource.slice(0, 155) + (descriptionSource.length > 155 ? '...' : '');
  const url = `${SITE_URL}/business/${business.slug}`;
  const imageUrl = toAbsoluteUrl(business.coverUrl || business.logoUrl) || toAbsoluteUrl(SITE_SOCIAL_IMAGE);

  return {
    title,
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
      type: 'article',
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
