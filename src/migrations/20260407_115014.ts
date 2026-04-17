import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "manual_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "manual" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"aside" varchar NOT NULL,
  	"mobile_toc" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'manual_sections_parent_id_fk'
        AND table_name = 'manual_sections'
    ) THEN
      ALTER TABLE "manual_sections" ADD CONSTRAINT "manual_sections_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."manual"("id")
        ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "manual_sections_order_idx" ON "manual_sections" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "manual_sections_parent_id_idx" ON "manual_sections" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "manual_sections" CASCADE;
  DROP TABLE "manual" CASCADE;`)
}
