export const SITE_NAME = 'LocalPages.ph';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localpages.ph';

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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
  const description = business.description.slice(0, 150) + (business.description.length > 150 ? '...' : '');
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
      // images: [ { url: business.logoUrl || fallback } ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
};
