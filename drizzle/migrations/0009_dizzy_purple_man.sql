CREATE TYPE "public"."duplicate_pair_status" AS ENUM('pending', 'confirmed_duplicate', 'not_duplicate', 'merged');--> statement-breakpoint
CREATE TABLE "duplicate_pairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_a_id" uuid NOT NULL,
	"team_b_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"similarity_score" real DEFAULT 0.5 NOT NULL,
	"status" "duplicate_pair_status" DEFAULT 'pending' NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "duplicate_pairs" ADD CONSTRAINT "duplicate_pairs_team_a_id_teams_id_fk" FOREIGN KEY ("team_a_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_pairs" ADD CONSTRAINT "duplicate_pairs_team_b_id_teams_id_fk" FOREIGN KEY ("team_b_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_pairs" ADD CONSTRAINT "duplicate_pairs_resolved_by_admins_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;