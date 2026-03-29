CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'read', 'resolved');--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid,
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"admin_reply" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;