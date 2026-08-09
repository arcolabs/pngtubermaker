CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text NOT NULL,
	"width" integer DEFAULT 200 NOT NULL,
	"height" integer DEFAULT 54 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avatars" ADD COLUMN "original_base_image_url" text;--> statement-breakpoint
ALTER TABLE "avatars" ADD COLUMN "original_base_image_r2_key" text;