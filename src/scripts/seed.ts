import { seedMetadata } from "../lib/data-connect/seed/seeder";

async function main() {
  console.log("Starting database seed script...");
  const result = await seedMetadata();
  if (result.success) {
    console.log("SUCCESS:", result.message);
    process.exit(0);
  } else {
    console.error("FAILED:", result.message);
    if (result.details) {
      console.error(JSON.stringify(result.details, null, 2));
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error during seeding:", err);
  process.exit(1);
});
