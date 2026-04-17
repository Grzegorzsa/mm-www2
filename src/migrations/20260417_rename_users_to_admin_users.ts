import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      -- 1. Rename tables (only if not yet renamed)
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_sessions' AND table_schema = 'public') THEN
        ALTER TABLE "users_sessions" RENAME TO "admin_users_sessions";
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE "users" RENAME TO "admin_users";
      END IF;

      -- 2. Rename FK constraint on admin_users_sessions
      IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_sessions_parent_id_fk') THEN
        ALTER TABLE "admin_users_sessions" RENAME CONSTRAINT "users_sessions_parent_id_fk" TO "admin_users_sessions_parent_id_fk";
      END IF;

      -- 3. Rename indexes on admin_users_sessions
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_sessions_order_idx') THEN
        ALTER INDEX "users_sessions_order_idx" RENAME TO "admin_users_sessions_order_idx";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_sessions_parent_id_idx') THEN
        ALTER INDEX "users_sessions_parent_id_idx" RENAME TO "admin_users_sessions_parent_id_idx";
      END IF;

      -- 4. Rename indexes on admin_users
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_updated_at_idx') THEN
        ALTER INDEX "users_updated_at_idx" RENAME TO "admin_users_updated_at_idx";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_created_at_idx') THEN
        ALTER INDEX "users_created_at_idx" RENAME TO "admin_users_created_at_idx";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_idx') THEN
        ALTER INDEX "users_email_idx" RENAME TO "admin_users_email_idx";
      END IF;

      -- 5. Update payload_locked_documents_rels column
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'users_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_users_fk";
        DROP INDEX IF EXISTS "payload_locked_documents_rels_users_id_idx";
        ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "users_id" TO "admin_users_id";
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_admin_users_fk"
          FOREIGN KEY ("admin_users_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
        CREATE INDEX "payload_locked_documents_rels_admin_users_id_idx"
          ON "payload_locked_documents_rels" USING btree ("admin_users_id");
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'admin_users_id') THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_admin_users_fk";
        DROP INDEX IF EXISTS "payload_locked_documents_rels_admin_users_id_idx";
        ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "admin_users_id" TO "users_id";
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_users_fk"
          FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        CREATE INDEX "payload_locked_documents_rels_users_id_idx"
          ON "payload_locked_documents_rels" USING btree ("users_id");
      END IF;

      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'admin_users_updated_at_idx') THEN
        ALTER INDEX "admin_users_updated_at_idx" RENAME TO "users_updated_at_idx";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'admin_users_created_at_idx') THEN
        ALTER INDEX "admin_users_created_at_idx" RENAME TO "users_created_at_idx";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'admin_users_email_idx') THEN
        ALTER INDEX "admin_users_email_idx" RENAME TO "users_email_idx";
      END IF;

      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'admin_users_sessions_order_idx') THEN
        ALTER INDEX "admin_users_sessions_order_idx" RENAME TO "users_sessions_order_idx";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'admin_users_sessions_parent_id_idx') THEN
        ALTER INDEX "admin_users_sessions_parent_id_idx" RENAME TO "users_sessions_parent_id_idx";
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'admin_users_sessions_parent_id_fk') THEN
        ALTER TABLE "admin_users_sessions" RENAME CONSTRAINT "admin_users_sessions_parent_id_fk" TO "users_sessions_parent_id_fk";
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users_sessions' AND table_schema = 'public') THEN
        ALTER TABLE "admin_users_sessions" RENAME TO "users_sessions";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users' AND table_schema = 'public') THEN
        ALTER TABLE "admin_users" RENAME TO "users";
      END IF;
    END $$;
  `)
}
