CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "category" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "status" text DEFAULT 'OPEN' NOT NULL,
  "admin_response" text,
  "responded_by_id" text,
  "responded_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "support_tickets"
    ADD CONSTRAINT "support_tickets_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE "support_tickets"
    ADD CONSTRAINT "support_tickets_responded_by_id_users_id_fk"
    FOREIGN KEY ("responded_by_id") REFERENCES "public"."users"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "support_tickets_user_id_idx"
  ON "support_tickets" ("user_id");

CREATE INDEX IF NOT EXISTS "support_tickets_status_idx"
  ON "support_tickets" ("status");

CREATE INDEX IF NOT EXISTS "support_tickets_created_at_idx"
  ON "support_tickets" ("created_at");
