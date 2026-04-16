CREATE TYPE "audit_action" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "check_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "flag_condition" AS ENUM('GOOD', 'DAMAGED', 'NEEDS_REPLACEMENT');--> statement-breakpoint
CREATE TYPE "session_status" AS ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"field_name" text,
	"old_value" text,
	"new_value" text,
	"changed_by" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"item_id" text,
	"container_id" text,
	"parent_id" text,
	"text" text NOT NULL,
	"created_by" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	CONSTRAINT "comment_target_exclusivity" CHECK (NOT ("item_id" IS NOT NULL AND "container_id" IS NOT NULL)),
	CONSTRAINT "comment_must_have_target_or_parent" CHECK (("item_id" IS NOT NULL OR "container_id" IS NOT NULL OR "parent_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "container" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"custom_id" text UNIQUE,
	"type_id" text,
	"label" text,
	"description" text,
	"location_id" text,
	"location_detail" text,
	"qr_code" text UNIQUE,
	"is_temporarily_moved" boolean DEFAULT false NOT NULL,
	"temporary_location" text,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "container_type" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "flag" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"country_code" text NOT NULL,
	"country_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"container_id" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "flag_check" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"session_id" text NOT NULL,
	"flag_id" text NOT NULL,
	"found" boolean DEFAULT false NOT NULL,
	"condition" "flag_condition",
	"notes" text,
	"checked_by" text
);
--> statement-breakpoint
CREATE TABLE "flag_inventory_session" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"status" "session_status" DEFAULT 'PLANNED'::"session_status" NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "inventory_check" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"session_id" text NOT NULL,
	"container_id" text NOT NULL,
	"checked_by" text,
	"status" "check_status" DEFAULT 'PENDING'::"check_status" NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventory_check_item" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"check_id" text NOT NULL,
	"item_id" text NOT NULL,
	"found" boolean DEFAULT false NOT NULL,
	"notes" text,
	"moved_to_container_id" text
);
--> statement-breakpoint
CREATE TABLE "inventory_session" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"status" "session_status" DEFAULT 'PLANNED'::"session_status" NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"custom_id" text UNIQUE,
	"name" text NOT NULL,
	"type_id" text,
	"description" text,
	"photo" text,
	"serial_number" text,
	"value" integer,
	"qr_code" text UNIQUE,
	"quantity" integer,
	"quantity_description" text,
	"container_id" text,
	"location_id" text,
	"location_detail" text,
	"is_temporarily_moved" boolean DEFAULT false NOT NULL,
	"temporary_location" text,
	"is_damaged" boolean DEFAULT false NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"is_missing" boolean DEFAULT false NOT NULL,
	"aliases" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "item_location_exclusivity" CHECK (NOT ("container_id" IS NOT NULL AND "location_id" IS NOT NULL)),
	CONSTRAINT "item_quantity_exclusivity" CHECK (NOT ("quantity" IS NOT NULL AND "quantity_description" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "item_type" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"email" text NOT NULL UNIQUE,
	"family_name" text NOT NULL,
	"given_name" text NOT NULL,
	"locale" text,
	"preferred_username" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_changed_by_user_id_fkey" FOREIGN KEY ("changed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_item_id_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_container_id_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "container"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "container" ADD CONSTRAINT "container_type_id_container_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "container_type"("id");--> statement-breakpoint
ALTER TABLE "container" ADD CONSTRAINT "container_location_id_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id");--> statement-breakpoint
ALTER TABLE "container" ADD CONSTRAINT "container_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "container_type" ADD CONSTRAINT "container_type_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "flag" ADD CONSTRAINT "flag_container_id_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "container"("id");--> statement-breakpoint
ALTER TABLE "flag_check" ADD CONSTRAINT "flag_check_session_id_flag_inventory_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "flag_inventory_session"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flag_check" ADD CONSTRAINT "flag_check_flag_id_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "flag"("id");--> statement-breakpoint
ALTER TABLE "flag_check" ADD CONSTRAINT "flag_check_checked_by_user_id_fkey" FOREIGN KEY ("checked_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "flag_inventory_session" ADD CONSTRAINT "flag_inventory_session_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "inventory_check" ADD CONSTRAINT "inventory_check_session_id_inventory_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "inventory_session"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inventory_check" ADD CONSTRAINT "inventory_check_container_id_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "container"("id");--> statement-breakpoint
ALTER TABLE "inventory_check" ADD CONSTRAINT "inventory_check_checked_by_user_id_fkey" FOREIGN KEY ("checked_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "inventory_check_item" ADD CONSTRAINT "inventory_check_item_check_id_inventory_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "inventory_check"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inventory_check_item" ADD CONSTRAINT "inventory_check_item_item_id_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id");--> statement-breakpoint
ALTER TABLE "inventory_check_item" ADD CONSTRAINT "inventory_check_item_moved_to_container_id_container_id_fkey" FOREIGN KEY ("moved_to_container_id") REFERENCES "container"("id");--> statement-breakpoint
ALTER TABLE "inventory_session" ADD CONSTRAINT "inventory_session_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_type_id_item_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "item_type"("id");--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_container_id_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "container"("id");--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_location_id_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id");--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "item_type" ADD CONSTRAINT "item_type_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");