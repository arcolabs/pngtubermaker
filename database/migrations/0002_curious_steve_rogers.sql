ALTER TABLE "generated_avatars" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "images" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "generated_avatars" CASCADE;--> statement-breakpoint
DROP TABLE "images" CASCADE;--> statement-breakpoint
CREATE INDEX "expr_avatar_status_idx" ON "avatar_expressions" USING btree ("avatar_id","status");--> statement-breakpoint
CREATE INDEX "avatar_user_status_idx" ON "avatars" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "avatar_user_created_idx" ON "avatars" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credit_tx_user_created_idx" ON "credit_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "sub_user_status_idx" ON "subscriptions" USING btree ("user_id","status");