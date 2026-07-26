import { loadEnvConfig } from '@next/env';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import {
  businesses,
  categories as categoryTable,
  subcategories as subcategoryTable,
} from './schema';
import {
  categories as canonicalCategories,
  legacyCategoryAliases,
} from '../lib/data-connect/seed/categories';

loadEnvConfig(process.cwd());

const applyChanges = process.argv.includes('--apply');

const listingAssignments: Record<string, { category: string; subcategory: string }> = {
  'coffee-blanc': { category: 'food-dining', subcategory: 'coffee-shops' },
  'naimas-bagnet': { category: 'food-dining', subcategory: 'restaurants' },
  'mawaque-fitness-gym': { category: 'beauty-wellness', subcategory: 'gyms-fitness-centers' },
  doodlepress: { category: 'technology-digital-services', subcategory: 'web-development' },
  'core-ai-tech-solutions': { category: 'technology-digital-services', subcategory: 'ai-automation' },
  'the-rental-hub': { category: 'events-entertainment', subcategory: 'event-equipment-rental' },
  'fabricotti-mobili-trading-corp': { category: 'home-construction', subcategory: 'fire-safety-equipment' },
};

const main = async () => {
  const { db } = await import('./index');
  const [currentCategories, currentSubcategories, currentBusinesses] = await Promise.all([
    db.select().from(categoryTable),
    db.select().from(subcategoryTable),
    db.select().from(businesses),
  ]);

  const categoryBySlug = new Map(currentCategories.map((category) => [category.slug, category]));
  const businessBySlug = new Map(currentBusinesses.map((business) => [business.slug, business]));

  console.log(applyChanges ? 'Applying taxonomy migration.' : 'Taxonomy migration dry run.');
  console.log(`Canonical categories: ${canonicalCategories.length}`);
  console.log(`Subcategories to ensure: ${canonicalCategories.reduce((total, category) => total + category.subcategories.length, 0)}`);

  for (const category of canonicalCategories) {
    console.log(`${categoryBySlug.has(category.slug) ? 'UPDATE' : 'CREATE'} category: ${category.name} (${category.slug})`);
    for (const legacySlug of legacyCategoryAliases[category.slug] || []) {
      const legacyCategory = categoryBySlug.get(legacySlug);
      if (!legacyCategory) continue;
      const affectedListings = currentBusinesses.filter((business) => business.categoryId === legacyCategory.id).length;
      console.log(`MERGE legacy category: ${legacySlug} -> ${category.slug} (${affectedListings} listing(s))`);
    }
  }

  for (const [businessSlug, assignment] of Object.entries(listingAssignments)) {
    const business = businessBySlug.get(businessSlug);
    console.log(
      business
        ? `ASSIGN listing: ${businessSlug} -> ${assignment.category} / ${assignment.subcategory}`
        : `SKIP missing listing: ${businessSlug}`,
    );
  }

  if (!applyChanges) {
    console.log('Dry run complete. No database records were changed.');
    return;
  }

  const backupDirectory = path.join(process.cwd(), 'private', 'exports');
  await mkdir(backupDirectory, { recursive: true });
  const backupPath = path.join(
    backupDirectory,
    `taxonomy-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
  await writeFile(
    backupPath,
    JSON.stringify({
      createdAt: new Date().toISOString(),
      categories: currentCategories,
      subcategories: currentSubcategories,
      businesses: currentBusinesses.map((business) => ({
        id: business.id,
        slug: business.slug,
        categoryId: business.categoryId,
        subcategoryId: business.subcategoryId,
      })),
    }, null, 2),
    { mode: 0o600 },
  );

  await db.transaction(async (tx) => {
    const canonicalCategoryIds = new Map<string, string>();

    for (const category of canonicalCategories) {
      const [savedCategory] = await tx.insert(categoryTable)
        .values({
          name: category.name,
          slug: category.slug,
          description: category.description,
          status: true,
        })
        .onConflictDoUpdate({
          target: categoryTable.slug,
          set: {
            name: category.name,
            description: category.description,
            status: true,
          },
        })
        .returning({ id: categoryTable.id });
      canonicalCategoryIds.set(category.slug, savedCategory.id);
    }

    for (const [canonicalSlug, legacySlugs] of Object.entries(legacyCategoryAliases)) {
      const canonicalCategoryId = canonicalCategoryIds.get(canonicalSlug);
      if (!canonicalCategoryId) {
        throw new Error(`Canonical category was not created: ${canonicalSlug}`);
      }

      for (const legacySlug of legacySlugs) {
        const legacyCategory = categoryBySlug.get(legacySlug);
        if (!legacyCategory) continue;

        await tx.update(businesses)
          .set({
            categoryId: canonicalCategoryId,
            subcategoryId: null,
            updatedAt: new Date(),
          })
          .where(eq(businesses.categoryId, legacyCategory.id));
        await tx.update(subcategoryTable)
          .set({ categoryId: canonicalCategoryId })
          .where(eq(subcategoryTable.categoryId, legacyCategory.id));
        await tx.delete(categoryTable).where(eq(categoryTable.id, legacyCategory.id));
      }
    }

    const canonicalSubcategoryIds = new Map<string, string>();
    for (const category of canonicalCategories) {
      const categoryId = canonicalCategoryIds.get(category.slug);
      if (!categoryId) throw new Error(`Missing category ID for ${category.slug}`);

      for (const subcategory of category.subcategories) {
        const [savedSubcategory] = await tx.insert(subcategoryTable)
          .values({
            categoryId,
            name: subcategory.name,
            slug: subcategory.slug,
            status: true,
          })
          .onConflictDoUpdate({
            target: subcategoryTable.slug,
            set: {
              categoryId,
              name: subcategory.name,
              status: true,
            },
          })
          .returning({ id: subcategoryTable.id });
        canonicalSubcategoryIds.set(subcategory.slug, savedSubcategory.id);
      }
    }

    for (const [businessSlug, assignment] of Object.entries(listingAssignments)) {
      if (!businessBySlug.has(businessSlug)) continue;
      const categoryId = canonicalCategoryIds.get(assignment.category);
      const subcategoryId = canonicalSubcategoryIds.get(assignment.subcategory);
      if (!categoryId || !subcategoryId) {
        throw new Error(`Invalid assignment configured for ${businessSlug}`);
      }

      await tx.update(businesses)
        .set({
          categoryId,
          subcategoryId,
          updatedAt: new Date(),
        })
        .where(eq(businesses.slug, businessSlug));
    }
  });

  console.log(`Taxonomy migration complete. Backup: ${backupPath}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Taxonomy migration failed:', error);
    process.exit(1);
  });
