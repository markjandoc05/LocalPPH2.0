import { getShortDesc } from '@/lib/utils';

export const SITE_NAME = 'LocalPages.ph';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localpages.ph';
export const SITE_SOCIAL_IMAGE = '/images/localpages-ph-cover.png';

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

  const title = `${business.name} - ${business.categoryName || business.categoryId} in ${business.cityName || business.cityId}`;
  const shortDesc = getShortDesc(business.description);
  const description = shortDesc.slice(0, 150) + (shortDesc.length > 150 ? '...' : '');
  const url = `${SITE_URL}/business/${business.slug}`;

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
          url: business.coverUrl || SITE_SOCIAL_IMAGE,
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
      images: [business.coverUrl || SITE_SOCIAL_IMAGE],
    },
  };
};
