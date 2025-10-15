ALTER TABLE "ipcc_emission_categories" DROP CONSTRAINT "ipcc_emission_categories_ipcc_project_id_ipcc_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "ipcc_emission_categories" DROP COLUMN "ipcc_project_id";