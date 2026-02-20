CREATE TABLE "avatar_expressions" (
	"id" text PRIMARY KEY NOT NULL,
	"avatar_id" text NOT NULL,
	"pack_id" text,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"image_url" text,
	"image_r2_key" text,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatars" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'My PNGTuber' NOT NULL,
	"slug" text,
	"prompt" text NOT NULL,
	"style" text NOT NULL,
	"aspect_ratio" text DEFAULT '1:1',
	"status" text NOT NULL,
	"candidate_images" jsonb,
	"base_image_url" text,
	"base_image_r2_key" text,
	"thumbnail_url" text,
	"thumbnail_r2_key" text,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"transaction_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "avatars_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expression_packs" (
	"id" text PRIMARY KEY NOT NULL,
	"avatar_id" text NOT NULL,
	"pack_type" text NOT NULL,
	"subtype" text,
	"status" text NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_avatars" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_image_id" text,
	"prompt" text,
	"result_image_id" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"logo_url" text,
	"logo_r2_key" text,
	"badge_html" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "generated_thumbnails" CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "monthly_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "subscription_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "subscription_credits_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "purchased_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "avatar_expressions" ADD CONSTRAINT "avatar_expressions_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_expressions" ADD CONSTRAINT "avatar_expressions_pack_id_expression_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."expression_packs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatars" ADD CONSTRAINT "avatars_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expression_packs" ADD CONSTRAINT "expression_packs_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_avatars" ADD CONSTRAINT "generated_avatars_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_avatars" ADD CONSTRAINT "generated_avatars_source_image_id_images_id_fk" FOREIGN KEY ("source_image_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_avatars" ADD CONSTRAINT "generated_avatars_result_image_id_images_id_fk" FOREIGN KEY ("result_image_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "balance";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "currency";