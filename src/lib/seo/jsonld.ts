import { BusinessListing } from '@/types/business';
import { SITE_NAME, SITE_URL, toAbsoluteUrl } from './metadata';
import { getFullDesc } from '@/lib/utils';

const clean = (value?: string | number | null) => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text || undefined;
};

const parseGallery = (gallery: BusinessListing['gallery']) => {
  if (!gallery) return [];
  if (Array.isArray(gallery)) return gallery;
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const removeEmpty = (value: any): any => {
  if (Array.isArray(value)) {
    const cleaned = value.map(removeEmpty).filter((item) => item !== undefined);
    return cleaned.length ? cleaned : undefined;
  }

  if (value && typeof value === 'object') {
    const cleaned = Object.entries(value).reduce((acc, [key, item]) => {
      const next = removeEmpty(item);
      if (next !== undefined) acc[key] = next;
      return acc;
    }, {} as Record<string, any>);

    return Object.keys(cleaned).length ? cleaned : undefined;
  }

  return value === undefined || value === null || value === '' ? undefined : value;
};

const getBusinessSchemaType = (category?: string) => {
  const value = category?.toLowerCase() || '';
  if (value.includes('food') || value.includes('restaurant') || value.includes('dining')) return 'Restaurant';
  if (value.includes('health') || value.includes('clinic') || value.includes('medical')) return 'MedicalBusiness';
  if (value.includes('hotel') || value.includes('travel') || value.includes('hospitality')) return 'LodgingBusiness';
  if (value.includes('shop') || value.includes('retail')) return 'Store';
  if (value.includes('professional') || value.includes('services')) return 'ProfessionalService';
  return 'LocalBusiness';
};

export const generateBreadcrumbJsonLd = (items: Array<{ label: string; href?: string }>) => {
  return removeEmpty({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  });
};

export const generateSiteJsonLd = () => {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: toAbsoluteUrl('/icon.jpg'),
    description: 'LocalPages.ph helps people discover trusted local businesses, services, shops, clinics, restaurants, and professionals across the Philippines.',
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return [removeEmpty(organization), removeEmpty(website)];
};

export const generateLocalBusinessJsonLd = (business: BusinessListing) => {
  const businessUrl = `${SITE_URL}/business/${business.slug}`;
  const description = clean(getFullDesc(business.description));
  const category = clean(business.categoryName);
  const galleryImages = parseGallery(business.gallery).map((url) => toAbsoluteUrl(url)).filter(Boolean);
  const images = [
    toAbsoluteUrl(business.coverUrl),
    toAbsoluteUrl(business.logoUrl),
    ...galleryImages,
  ].filter(Boolean);
  const sameAs = [
    business.websiteUrl,
    business.facebookUrl,
    business.instagramUrl,
    business.linkedinUrl,
    business.tiktokUrl,
    business.shopeeUrl,
    business.lazadaUrl,
  ].map(clean).filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': getBusinessSchemaType(category),
    '@id': `${businessUrl}#business`,
    name: clean(business.name),
    description,
    url: businessUrl,
    logo: toAbsoluteUrl(business.logoUrl),
    image: images,
    telephone: clean(business.contactMobile || business.contactPhone),
    email: clean(business.contactEmail),
    address: {
      '@type': 'PostalAddress',
      streetAddress: clean(business.addressLine1),
      addressLocality: clean(business.cityName),
      addressRegion: clean(business.provinceName),
      postalCode: clean(business.zipCode),
      addressCountry: 'PH',
    },
    geo: business.latitude && business.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    } : undefined,
    openingHours: clean(business.businessHours),
    category,
    knowsAbout: clean([business.products, business.services].filter(Boolean).join(', ')),
    sameAs,
    hasMap: clean(business.googleMapsUrl),
    dateModified: clean(business.updatedAt),
  };

  return removeEmpty(jsonLd);
};
