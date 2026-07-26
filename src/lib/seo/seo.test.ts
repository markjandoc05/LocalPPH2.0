import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBusinessMetaDescription,
  buildBusinessSeoTitle,
  generateBusinessMetadata,
} from './metadata';
import {
  generateLocalBusinessJsonLd,
  getBusinessSchemaType,
  serializeJsonLd,
} from './jsonld';
import { BusinessListing } from '@/types/business';

const baseBusiness: BusinessListing = {
  id: 'business-id',
  ownerId: 'owner-id',
  name: 'Coffee Blanc',
  slug: 'coffee-blanc',
  description: JSON.stringify({
    short: 'Coffee Shop',
    full: 'Coffee Blanc is a neighborhood coffee shop.',
  }),
  categoryId: 'category-id',
  categoryName: 'Food & Dining',
  categorySlug: 'food-dining',
  subcategoryName: 'Coffee Shops',
  subcategorySlug: 'coffee-shops',
  regionId: 'region-id',
  regionName: 'National Capital Region',
  regionSlug: 'ncr',
  provinceId: 'province-id',
  provinceName: 'Metro Manila',
  provinceSlug: 'metro-manila',
  cityId: 'city-id',
  cityName: 'Mandaluyong City',
  citySlug: 'mandaluyong-city',
  addressLine1: '123 Example Street',
  contactMobile: '09171234567',
  businessHours: 'Monday-Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM',
  status: 'APPROVED',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z',
};

test('business metadata stays concise and adds factual context to a sparse description', () => {
  const title = buildBusinessSeoTitle(baseBusiness);
  const description = buildBusinessMetaDescription(baseBusiness);
  const metadata = generateBusinessMetadata(baseBusiness);

  assert.ok(title.length <= 65);
  assert.match(title, /Coffee Blanc/);
  assert.match(description, /Food & Dining/);
  assert.match(description, /Mandaluyong City/);
  assert.ok(description.length <= 160);
  assert.equal(metadata.alternates?.canonical, 'https://localpages.ph/business/coffee-blanc');
  assert.equal(metadata.robots.index, true);
});

test('business schema uses category and subcategory-specific LocalBusiness types', () => {
  assert.equal(getBusinessSchemaType(baseBusiness), 'CafeOrCoffeeShop');
  assert.equal(getBusinessSchemaType({
    categoryName: 'Beauty & Wellness',
    categorySlug: 'beauty-wellness',
    subcategoryName: 'Gyms & Fitness Centers',
    subcategorySlug: 'gyms-fitness-centers',
  }), 'HealthClub');
  assert.equal(getBusinessSchemaType({
    categoryName: 'Government & Public Services',
    categorySlug: 'government-public-services',
    subcategoryName: undefined,
    subcategorySlug: undefined,
  }), 'LocalBusiness');
});

test('business schema emits parsed hours instead of unstructured user text', () => {
  const schema = generateLocalBusinessJsonLd(baseBusiness) as Record<string, any>;

  assert.equal(schema['@type'], 'CafeOrCoffeeShop');
  assert.equal(schema.openingHours, undefined);
  assert.deepEqual(schema.openingHoursSpecification, [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '16:00',
    },
  ]);
});

test('business schema handles common hour ranges and excludes explicitly closed days', () => {
  const compactHoursSchema = generateLocalBusinessJsonLd({
    ...baseBusiness,
    businessHours: 'Monday – Saturday: 5:30 AM – 9:00 PM Sunday: Closed',
  }) as Record<string, any>;
  const naturalLanguageSchema = generateLocalBusinessJsonLd({
    ...baseBusiness,
    businessHours: 'Monday to Friday, 9:00AM to 6:00PM',
  }) as Record<string, any>;

  assert.deepEqual(compactHoursSchema.openingHoursSpecification[0].dayOfWeek, [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);
  assert.deepEqual(naturalLanguageSchema.openingHoursSpecification[0], {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  });
});

test('JSON-LD serialization cannot close the script element', () => {
  const serialized = serializeJsonLd({
    name: '</script><script>alert("xss")</script>',
  });

  assert.equal(serialized.includes('</script>'), false);
  assert.equal(JSON.parse(serialized).name, '</script><script>alert("xss")</script>');
});
