import { getShortDesc } from '@/lib/utils';

export const SITE_NAME = 'LocalPages.ph';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localpages.ph';
export const SITE_SOCIAL_IMAGE = '/images/localpages-ph-cover.png';
const BUSINESS_TITLE_MAX_LENGTH = 65;
const META_DESCRIPTION_MAX_LENGTH = 160;

const cleanText = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
};

const cleanDirectoryValue = (value?: string | null) => {
  const cleaned = cleanText(value);
  return cleaned.toLowerCase() === 'not assigned' ? '' : cleaned;
};

const truncateAtWord = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;

  const candidate = value.slice(0, maxLength - 1).trimEnd();
  const lastSpace = candidate.lastIndexOf(' ');
  const truncated = lastSpace > Math.floor(maxLength * 0.6)
    ? candidate.slice(0, lastSpace)
    : candidate;

  return `${truncated.replace(/[,:;.!?\s-]+$/g, '')}…`;
};

const splitTerms = (value?: string | null) => {
  return cleanText(value)
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const buildBusinessSeoTitle = (business: any) => {
  const name = cleanText(business?.name) || 'Local Business';
  const category = cleanDirectoryValue(business?.categoryName) || 'Local Business';
  const city = cleanDirectoryValue(business?.cityName);
  const province = cleanDirectoryValue(business?.provinceName);
  const location = [city, province].filter(Boolean).join(', ');
  const candidates = [
    location ? `${name} – ${category} in ${location}` : '',
    `${name} – ${category}`,
    city ? `${name} – ${city}` : '',
    `${name} | ${SITE_NAME}`,
    name,
  ].filter(Boolean);

  return candidates.find((candidate) => candidate.length <= BUSINESS_TITLE_MAX_LENGTH)
    || truncateAtWord(name, BUSINESS_TITLE_MAX_LENGTH);
};

export const buildBusinessMetaDescription = (business: any) => {
  const name = cleanText(business?.name) || 'This local business';
  const category = cleanDirectoryValue(business?.categoryName) || 'local business';
  const city = cleanDirectoryValue(business?.cityName);
  const province = cleanDirectoryValue(business?.provinceName);
  const location = [city, province].filter(Boolean).join(', ') || 'the Philippines';
  const shortDescription = cleanText(getShortDesc(business?.description));
  const serviceSummary = cleanText(business?.services);
  const productSummary = cleanText(business?.products);
  const submittedSummary = shortDescription || serviceSummary || productSummary;
  const context = `${name} is a ${category} listing in ${location}.`;
  const details = submittedSummary
    ? `${context} ${submittedSummary}`
    : `${context} View its address, contact details, services, products, and business hours on ${SITE_NAME}.`;

  return truncateAtWord(details, META_DESCRIPTION_MAX_LENGTH);
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

  const category = cleanDirectoryValue(business.categoryName) || 'Local Business';
  const city = cleanDirectoryValue(business.cityName);
  const province = cleanDirectoryValue(business.provinceName);
  const title = buildBusinessSeoTitle(business);
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
  const description = buildBusinessMetaDescription(business);
  const url = `${SITE_URL}/business/${business.slug}`;
  const businessImage = toAbsoluteUrl(business.coverUrl || business.logoUrl);
  const imageUrl = businessImage || toAbsoluteUrl(SITE_SOCIAL_IMAGE);
  const openGraphImage = businessImage
    ? {
        url: imageUrl,
        alt: `${business.name} on ${SITE_NAME}`,
      }
    : {
        url: imageUrl,
        width: 1161,
        height: 630,
        alt: `${business.name} on ${SITE_NAME}`,
      };

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
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
        'max-video-preview': -1,
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
      images: [openGraphImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
};
