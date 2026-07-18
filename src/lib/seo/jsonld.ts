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

const splitTextItems = (value?: string | null) =>
  clean(value)
    ?.split(/[\n;,|]+/)
    .map((item) => item.trim())
    .filter(Boolean) || [];

const dayMap: Record<string, string> = {
  mon: 'Monday',
  monday: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  tuesday: 'Tuesday',
  wed: 'Wednesday',
  wednesday: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  thursday: 'Thursday',
  fri: 'Friday',
  friday: 'Friday',
  sat: 'Saturday',
  saturday: 'Saturday',
  sun: 'Sunday',
  sunday: 'Sunday',
};

const normalizeTime = (value: string) => {
  const trimmed = value.trim().toLowerCase().replace(/\./g, '');
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return undefined;

  let hour = Number(match[1]);
  const minute = match[2] || '00';
  const period = match[3];

  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;

  if (hour > 23 || Number(minute) > 59) return undefined;
  return `${String(hour).padStart(2, '0')}:${minute}`;
};

const parseDayNames = (value: string) => {
  const normalized = value.toLowerCase();
  const rangeMatch = normalized.match(/\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s*[-–]\s*(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/);
  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (rangeMatch) {
    const start = dayMap[rangeMatch[1]];
    const end = dayMap[rangeMatch[2]];
    const startIndex = orderedDays.indexOf(start);
    const endIndex = orderedDays.indexOf(end);
    if (startIndex >= 0 && endIndex >= startIndex) {
      return orderedDays.slice(startIndex, endIndex + 1);
    }
  }

  return Array.from(normalized.matchAll(/\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/g))
    .map((match) => dayMap[match[1]])
    .filter(Boolean);
};

const parseOpeningHoursSpecification = (value?: string | null) => {
  const lines = clean(value)?.split(/\n|;/).map((line) => line.trim()).filter(Boolean) || [];

  return lines
    .map((line) => {
      const days = parseDayNames(line);
      const timeMatch = line.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i);
      const opens = timeMatch ? normalizeTime(timeMatch[1]) : undefined;
      const closes = timeMatch ? normalizeTime(timeMatch[2]) : undefined;

      if (!days.length || !opens || !closes) return undefined;

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days,
        opens,
        closes,
      };
    })
    .filter(Boolean);
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
  const productItems = splitTextItems(business.products);
  const serviceItems = splitTextItems(business.services);
  const keywords = splitTextItems(business.keywords);
  const openingHoursSpecification = parseOpeningHoursSpecification(business.businessHours);
  const location = [business.cityName, business.provinceName, business.regionName].filter(Boolean).join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': getBusinessSchemaType(category),
    '@id': `${businessUrl}#business`,
    name: clean(business.name),
    description,
    url: businessUrl,
    logo: toAbsoluteUrl(business.logoUrl),
    image: images,
    slogan: category ? `${category} in ${location || 'the Philippines'}` : undefined,
    telephone: clean(business.contactMobile || business.contactPhone),
    email: clean(business.contactEmail),
    contactPoint: (business.contactMobile || business.contactPhone || business.contactEmail) ? {
      '@type': 'ContactPoint',
      telephone: clean(business.contactMobile || business.contactPhone),
      email: clean(business.contactEmail),
      contactType: 'customer service',
      areaServed: 'PH',
      availableLanguage: ['en', 'fil'],
    } : undefined,
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
    openingHoursSpecification,
    category,
    keywords: keywords.length ? keywords.join(', ') : undefined,
    knowsAbout: Array.from(new Set([...keywords, ...productItems, ...serviceItems, category].filter(Boolean))),
    areaServed: {
      '@type': 'AdministrativeArea',
      name: location || 'Philippines',
    },
    makesOffer: [...productItems, ...serviceItems].map((item) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: item,
      },
    })),
    sameAs,
    hasMap: clean(business.googleMapsUrl),
    dateModified: clean(business.updatedAt),
    dateCreated: clean(business.createdAt),
  };

  return removeEmpty(jsonLd);
};
