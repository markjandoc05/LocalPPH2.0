import { BusinessListing } from '@/types/business';
import { SITE_URL } from './metadata';

export const generateLocalBusinessJsonLd = (business: BusinessListing) => {
  const sameAs = [];
  if (business.facebookUrl) sameAs.push(business.facebookUrl);

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: `${SITE_URL}/business/${business.slug}`,
    telephone: business.contactMobile || business.contactPhone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.addressLine1,
      addressLocality: business.cityName || business.cityId,
      addressRegion: business.provinceId,
      postalCode: business.zipCode,
      addressCountry: 'PH',
    },
  };

  if (business.categoryName) {
    jsonLd.genre = business.categoryName;
  }

  if (business.websiteUrl) {
    jsonLd.sameAs = [business.websiteUrl, ...sameAs];
  } else if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  // Fallback for logo
  jsonLd.image = `${SITE_URL}/placeholder-logo.png`; 

  return jsonLd;
};
