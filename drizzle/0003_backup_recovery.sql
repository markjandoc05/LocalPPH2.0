CREATE TABLE IF NOT EXISTS "backup_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "label" text,
  "backup_type" text DEFAULT 'MANUAL' NOT NULL,
  "scope" text NOT NULL,
  "status" text DEFAULT 'COMPLETED' NOT NULL,
  "record_count" integer DEFAULT 0 NOT NULL,
  "payload" text NOT NULL,
  "error_message" text,
  "created_by_id" text REFERENCES "users"("id"),
  "restored_by_id" text REFERENCES "users"("id"),
  "restored_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "backup_snapshots_created_at_idx" ON "backup_snapshots" ("created_at");
CREATE INDEX IF NOT EXISTS "backup_snapshots_status_idx" ON "backup_snapshots" ("status");

CREATE TABLE IF NOT EXISTS "backup_schedules" (
  "id" text PRIMARY KEY NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "frequency" text DEFAULT 'WEEKLY' NOT NULL,
  "scope" text NOT NULL,
  "time_of_day" text DEFAULT '02:00' NOT NULL,
  "last_run_at" timestamp,
  "next_run_at" timestamp,
  "updated_by_id" text REFERENCES "users"("id"),
  "updated_at" timestamp DEFAULT now() NOT NULL
);
