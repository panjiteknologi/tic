CREATE TABLE "ipcc_project_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ipcc_project_categories" ADD CONSTRAINT "ipcc_project_categories_project_id_ipcc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ipcc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_project_categories" ADD CONSTRAINT "ipcc_project_categories_category_id_ipcc_emission_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ipcc_emission_categories"("id") ON DELETE no action ON UPDATE no action;