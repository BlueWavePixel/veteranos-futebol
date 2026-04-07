CREATE TABLE "security_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"email" text,
	"ip" text,
	"user_agent" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
