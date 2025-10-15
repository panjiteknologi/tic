ALTER TABLE "ipcc_emission_factors" DROP CONSTRAINT "ipcc_emission_factors_category_id_ipcc_emission_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "ipcc_emission_factors" DROP COLUMN "category_id";