import { BusinessListing } from '@/types/business';
import { SITE_NAME, SITE_URL, toAbsoluteUrl } from './metadata';
import { getFullDesc } from '@/lib/utils';

const clean = (value?: string | number | null) => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text && text.toLowerCase() !== 'not assigned' ? text : undefined;
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
const dayTokenPattern = 'mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?';
const closedDayPattern = new RegExp(
  `\\b(?:${dayTokenPattern})(?:\\s*(?:[-–]|to)\\s*(?:${dayTokenPattern}))?\\s*:?\\s*closed\\b`,
  'gi',
);

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
  const rangeMatch = normalized.match(/\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s*(?:[-–]|to)\s*(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/);
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
  const lines = value
    ?.split(/\r?\n|;/)
    .map((line) => clean(line))
    .filter((line): line is string => Boolean(line)) || [];

  return lines
    .map((line) => {
      const activeHours = line.replace(closedDayPattern, ' ');
      const days = parseDayNames(activeHours);
      const timeMatch = activeHours.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)\s*(?:[-–]|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i);
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

export const getBusinessSchemaType = (business: Pick<BusinessListing, 'categoryName' | 'categorySlug' | 'subcategoryName' | 'subcategorySlug'>) => {
  const category = [business.categoryName, business.categorySlug].filter(Boolean).join(' ').toLowerCase();
  const subcategory = [business.subcategoryName, business.subcategorySlug].filter(Boolean).join(' ').toLowerCase();

  if (subcategory.includes('coffee shop')) return 'CafeOrCoffeeShop';
  if (subcategory.includes('bakery')) return 'Bakery';
  if (subcategory.includes('restaurant') || subcategory.includes('fast food')) return 'Restaurant';
  if (category.includes('food') || category.includes('dining')) return 'FoodEstablishment';

  if (subcategory.includes('gym') || subcategory.includes('fitness')) return 'HealthClub';
  if (subcategory.includes('dental')) return 'Dentist';
  if (subcategory.includes('pharmac')) return 'Pharmacy';
  if (subcategory.includes('hospital')) return 'Hospital';
  if (subcategory.includes('clinic') || category.includes('health-medical') || category.includes('health & medical')) return 'MedicalBusiness';
  if (subcategory.includes('salon')) return 'BeautySalon';
  if (subcategory.includes('spa')) return 'DaySpa';

  if (subcategory.includes('auto repair')) return 'AutoRepair';
  if (subcategory.includes('car dealer')) return 'AutoDealer';
  if (category.includes('automotive')) return 'AutomotiveBusiness';
  if (category.includes('travel') || category.includes('hospitality')) return 'LodgingBusiness';
  if (category.includes('retail') || category.includes('shopping')) return 'Store';
  if (category.includes('professional') || category.includes('technology') || category.includes('digital')) return 'ProfessionalService';
  if (category.includes('real estate')) return 'RealEstateAgent';
  if (category.includes('home') || category.includes('construction')) return 'HomeAndConstructionBusiness';

  return 'LocalBusiness';
};

export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    const escapes: Record<string, string> = {
      '<': '\\u003c',
      '>': '\\u003e',
      '&': '\\u0026',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    return escapes[character];
  });

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
    '@type': getBusinessSchemaType(business),
    '@id': `${businessUrl}#business`,
    name: clean(business.name),
    description,
    url: businessUrl,
    logo: toAbsoluteUrl(business.logoUrl),
    image: images,
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
    openingHoursSpecification,
    category,
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
  };

  return removeEmpty(jsonLd);
};
