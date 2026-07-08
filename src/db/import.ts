import { db } from "./index";
import * as schema from "./schema";
import * as fs from "fs";
import * as path from "path";

// Helper to convert ISO-8601 string or numeric timestamp to a JavaScript Date object
function parseTimestamps(row: any, timestampKeys: string[]) {
  const result = { ...row };
  for (const key of timestampKeys) {
    if (result[key] !== undefined && result[key] !== null) {
      const parsed = new Date(result[key]);
      result[key] = isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  return result;
}

async function main() {
  console.log("=========================================");
  console.log("       STARTING DATABASE IMPORT          ");
  console.log("=========================================\n");

  const exportsDir = path.join(process.cwd(), "public", "exports");
  const allTablesPath = path.join(exportsDir, "all_tables.json");

  let importData: Record<string, any[]> = {};

  // 1. Load data from all_tables.json or individual fallback JSON files
  if (fs.existsSync(allTablesPath)) {
    try {
      console.log(`Loading export data from consolidated file: ${allTablesPath}`);
      const rawContent = fs.readFileSync(allTablesPath, "utf-8");
      importData = JSON.parse(rawContent);
    } catch (err: any) {
      console.error(`Error reading ${allTablesPath}:`, err.message);
    }
  } else {
    console.log("Consolidated export file not found. Attempting to load from individual table exports...");
  }

  // 2. Define tables in their precise dependency injection order
  const tableOrder = [
    {
      key: "users",
      table: schema.users,
      timestampFields: ["lastLoginAt", "createdAt", "updatedAt"],
    },
    {
      key: "categories",
      table: schema.categories,
      timestampFields: [],
    },
    {
      key: "subcategories",
      table: schema.subcategories,
      timestampFields: [],
    },
    {
      key: "regions",
      table: schema.regions,
      timestampFields: [],
    },
    {
      key: "provinces",
      table: schema.provinces,
      timestampFields: [],
    },
    {
      key: "cities",
      table: schema.cities,
      timestampFields: [],
    },
    {
      key: "barangays",
      table: schema.barangays,
      timestampFields: [],
    },
    {
      key: "businesses",
      table: schema.businesses,
      timestampFields: ["createdAt", "updatedAt"],
    },
    {
      key: "businessPhotos",
      table: schema.businessPhotos,
      timestampFields: ["uploadedAt"],
    },
    {
      key: "siteSettings",
      table: schema.siteSettings,
      timestampFields: ["updatedAt"],
    },
  ];

  // Try loading table data from individual files if not present in all_tables.json
  for (const item of tableOrder) {
    if (!importData[item.key] || !Array.isArray(importData[item.key])) {
      const individualPath = path.join(exportsDir, `${item.key}.json`);
      if (fs.existsSync(individualPath)) {
        try {
          console.log(`Loading individual table file: ${individualPath}`);
          const raw = fs.readFileSync(individualPath, "utf-8");
          importData[item.key] = JSON.parse(raw);
        } catch (err: any) {
          console.warn(`Could not read individual file for ${item.key}:`, err.message);
          importData[item.key] = [];
        }
      } else {
        importData[item.key] = [];
      }
    }
  }

  // 3. Perform the import in a single transaction
  try {
    console.log("\nStarting import transaction...");
    await db.transaction(async (tx) => {
      for (const item of tableOrder) {
        const records = importData[item.key];
        if (!records || records.length === 0) {
          console.log(`[SKIPPED] Table "${item.key}" has no records to import.`);
          continue;
        }

        console.log(`[IMPORTING] Table "${item.key}" with ${records.length} records...`);

        // Convert timestamps and clean data
        const processedRecords = records.map((record) =>
          parseTimestamps(record, item.timestampFields)
        );

        // Batch inserts are more efficient but Drizzle has limits or size boundaries.
        // We will insert them in chunks of 100 to stay safely under PostgreSQL parameter limit parameters.
        const chunkSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < processedRecords.length; i += chunkSize) {
          const chunk = processedRecords.slice(i, i + chunkSize);
          
          // Use .onConflictDoNothing() to skip duplicates cleanly
          await tx
            .insert(item.table)
            .values(chunk)
            .onConflictDoNothing();
            
          insertedCount += chunk.length;
        }

        console.log(`[SUCCESS] Table "${item.key}" imported successfully (processed ${insertedCount} records).`);
      }
    });

    console.log("\n=========================================");
    console.log("   DATABASE IMPORT COMPLETED SUCCESSFULLY ");
    console.log("=========================================");
  } catch (err: any) {
    console.error("\n=========================================");
    console.error("        FATAL IMPORT TRANSACTION ERROR    ");
    console.error("=========================================");
    console.error(err);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal uncaught error in main loop:", err);
  process.exit(1);
});
