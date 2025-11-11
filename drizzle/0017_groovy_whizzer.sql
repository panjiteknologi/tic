CREATE TABLE "defra_project_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scope1_total" numeric(20, 6) DEFAULT '0',
	"scope2_total" numeric(20, 6) DEFAULT '0',
	"scope3_total" numeric(20, 6) DEFAULT '0',
	"fuels_total" numeric(20, 6) DEFAULT '0',
	"business_travel_total" numeric(20, 6) DEFAULT '0',
	"material_use_total" numeric(20, 6) DEFAULT '0',
	"waste_total" numeric(20, 6) DEFAULT '0',
	"total_co2e" numeric(20, 6) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "defra_projects" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "defra_project_summaries" ADD CONSTRAINT "defra_project_summaries_project_id_defra_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."defra_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "defra_projects" ADD CONSTRAINT "defra_projects_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;