import { db } from "../db/index";
import * as schema from "../db/schema";
import * as fs from "fs";
import * as path from "path";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function exportPostgres() {
  console.log("--- Starting PostgreSQL Export ---");
  const tables = {
    users: schema.users,
    categories: schema.categories,
    subcategories: schema.subcategories,
    regions: schema.regions,
    provinces: schema.provinces,
    cities: schema.cities,
    barangays: schema.barangays,
    businesses: schema.businesses,
    businessPhotos: schema.businessPhotos,
    siteSettings: schema.siteSettings,
  };

  const exportData: Record<string, any[]> = {};
  const outputDir = path.join(process.cwd(), "public", "exports");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [tableName, tableSchema] of Object.entries(tables)) {
    try {
      console.log(`Querying table: ${tableName}...`);
      const records = await db.select().from(tableSchema);
      console.log(`Retrieved ${records.length} records from table "${tableName}".`);
      exportData[tableName] = records;

      // Save individual table as JSON
      fs.writeFileSync(
        path.join(outputDir, `${tableName}.json`),
        JSON.stringify(records, null, 2)
      );
    } catch (err: any) {
      console.error(`Error exporting table ${tableName}:`, err.message);
    }
  }

  const allDataPath = path.join(outputDir, "all_tables.json");
  fs.writeFileSync(allDataPath, JSON.stringify(exportData, null, 2));
  console.log(`Successfully saved all PostgreSQL tables to ${allDataPath}`);
}

async function exportFirestore() {
  console.log("\n--- Starting Firestore Export ---");
  try {
    const blueprintPath = path.join(process.cwd(), "firebase-blueprint.json");
    const firebaseBlueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf-8"));
    
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    // Check if firebase admin has been initialized
    if (getApps().length === 0) {
      initializeApp({
        projectId: config.projectId,
      });
    }
    
    // In firebase-admin/firestore, getFirestore takes (databaseId) as an optional parameter
    const firestore = config.firestoreDatabaseId ? getFirestore(config.firestoreDatabaseId) : getFirestore();
    const collections = Object.keys(firebaseBlueprint.firestore || {});
    console.log(`Firestore collections defined in blueprint using DB "${config.firestoreDatabaseId || "default"}":`, collections);
    
    const outputDir = path.join(process.cwd(), "public", "exports", "firestore");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const firestoreData: Record<string, any[]> = {};
    
    for (const colPath of collections) {
      const normalizedPath = colPath.split("/").filter(p => p && !p.startsWith("{")).join("/");
      if (!normalizedPath) continue;
      
      try {
        console.log(`Querying Firestore collection: ${normalizedPath}...`);
        const snapshot = await firestore.collection(normalizedPath).get();
        const docs = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`Retrieved ${docs.length} documents from Firestore collection "${normalizedPath}".`);
        firestoreData[normalizedPath] = docs;
        
        fs.writeFileSync(
          path.join(outputDir, `${normalizedPath.replace(/\//g, "_")}.json`),
          JSON.stringify(docs, null, 2)
        );
      } catch (err: any) {
        console.error(`Error exporting Firestore path ${colPath}:`, err.message);
      }
    }
    
    const allFirestorePath = path.join(process.cwd(), "public", "exports", "all_firestore.json");
    fs.writeFileSync(allFirestorePath, JSON.stringify(firestoreData, null, 2));
    console.log(`Successfully saved all Firestore collections to ${allFirestorePath}`);
  } catch (err: any) {
    console.log("Firestore export skipped or not available:", err.message);
  }
}

async function main() {
  await exportPostgres();
  await exportFirestore();
  console.log("\nExport completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal export error:", err);
  process.exit(1);
});
