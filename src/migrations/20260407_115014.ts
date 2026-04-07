import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "manual_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar NOT NULL
  );
  
  CREATE TABLE "manual" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"aside" varchar NOT NULL,
  	"mobile_toc" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "manual_sections" ADD CONSTRAINT "manual_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."manual"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "manual_sections_order_idx" ON "manual_sections" USING btree ("_order");
  CREATE INDEX "manual_sections_parent_id_idx" ON "manual_sections" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "manual_sections" CASCADE;
  DROP TABLE "manual" CASCADE;`)
}
