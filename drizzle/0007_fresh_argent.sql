CREATE TABLE "certification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"standard_id" uuid NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "standard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "standard_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "certification" ADD CONSTRAINT "certification_standard_id_standard_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."standard"("id") ON DELETE cascade ON UPDATE no action;