CREATE TABLE IF NOT EXISTS "listing_revision_reminders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "owner_id" text,
  "sent_by_id" text,
  "recipient_email" text NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "status" text DEFAULT 'PENDING' NOT NULL,
  "smtp_message_id" text,
  "error_message" text,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "listing_revision_reminders"
    ADD CONSTRAINT "listing_revision_reminders_business_id_businesses_id_fk"
    FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE "listing_revision_reminders"
    ADD CONSTRAINT "listing_revision_reminders_owner_id_users_id_fk"
    FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE "listing_revision_reminders"
    ADD CONSTRAINT "listing_revision_reminders_sent_by_id_users_id_fk"
    FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "listing_revision_reminders_business_created_at_idx"
  ON "listing_revision_reminders" ("business_id", "created_at");

CREATE INDEX IF NOT EXISTS "listing_revision_reminders_owner_created_at_idx"
  ON "listing_revision_reminders" ("owner_id", "created_at");

CREATE INDEX IF NOT EXISTS "listing_revision_reminders_status_idx"
  ON "listing_revision_reminders" ("status");
