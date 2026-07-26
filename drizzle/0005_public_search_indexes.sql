CREATE INDEX IF NOT EXISTS "businesses_owner_created_at_idx"
  ON "businesses" ("owner_id", "created_at");

CREATE INDEX IF NOT EXISTS "businesses_status_created_at_idx"
  ON "businesses" ("status", "created_at");

CREATE INDEX IF NOT EXISTS "businesses_category_status_created_at_idx"
  ON "businesses" ("category_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "businesses_subcategory_status_idx"
  ON "businesses" ("subcategory_id", "status");

CREATE INDEX IF NOT EXISTS "businesses_region_status_idx"
  ON "businesses" ("region_id", "status");

CREATE INDEX IF NOT EXISTS "businesses_province_status_idx"
  ON "businesses" ("province_id", "status");

CREATE INDEX IF NOT EXISTS "businesses_city_status_idx"
  ON "businesses" ("city_id", "status");

CREATE INDEX IF NOT EXISTS "businesses_featured_status_created_at_idx"
  ON "businesses" ("is_featured", "status", "created_at");
