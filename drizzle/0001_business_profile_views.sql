CREATE TABLE IF NOT EXISTS "business_profile_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "visitor_key" text NOT NULL,
  "first_viewed_at" timestamp DEFAULT now() NOT NULL,
  "last_viewed_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "business_profile_views"
    ADD CONSTRAINT "business_profile_views_business_id_businesses_id_fk"
    FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "business_profile_views_business_id_idx"
  ON "business_profile_views" ("business_id");

CREATE UNIQUE INDEX IF NOT EXISTS "business_profile_views_business_visitor_idx"
  ON "business_profile_views" ("business_id", "visitor_key");
