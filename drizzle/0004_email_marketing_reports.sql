CREATE TABLE IF NOT EXISTS "email_campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "target_roles" text,
  "target_user_ids" text,
  "from_email" text DEFAULT 'support@localpages.ph' NOT NULL,
  "reply_to_email" text DEFAULT 'support@localpages.ph' NOT NULL,
  "interval_seconds" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'SENDING' NOT NULL,
  "total_recipients" integer DEFAULT 0 NOT NULL,
  "sent_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "opened_count" integer DEFAULT 0 NOT NULL,
  "created_by_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "email_campaigns"
    ADD CONSTRAINT "email_campaigns_created_by_id_users_id_fk"
    FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id")
    ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "email_campaigns_created_at_idx"
  ON "email_campaigns" ("created_at");

CREATE INDEX IF NOT EXISTS "email_campaigns_status_idx"
  ON "email_campaigns" ("status");

CREATE TABLE IF NOT EXISTS "email_campaign_recipients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid NOT NULL,
  "user_id" text,
  "email" text NOT NULL,
  "name" text,
  "role" text,
  "status" text DEFAULT 'PENDING' NOT NULL,
  "smtp_message_id" text,
  "error_message" text,
  "sent_at" timestamp,
  "first_opened_at" timestamp,
  "last_opened_at" timestamp,
  "open_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "email_campaign_recipients"
    ADD CONSTRAINT "email_campaign_recipients_campaign_id_email_campaigns_id_fk"
    FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE "email_campaign_recipients"
    ADD CONSTRAINT "email_campaign_recipients_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "email_campaign_recipients_campaign_id_idx"
  ON "email_campaign_recipients" ("campaign_id");

CREATE INDEX IF NOT EXISTS "email_campaign_recipients_user_id_idx"
  ON "email_campaign_recipients" ("user_id");

CREATE INDEX IF NOT EXISTS "email_campaign_recipients_email_idx"
  ON "email_campaign_recipients" ("email");
