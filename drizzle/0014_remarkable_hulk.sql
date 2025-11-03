ALTER TABLE "ipcc_emission_factors" ADD COLUMN "applicable_categories" varchar(1000);--> statement-breakpoint
ALTER TABLE "ipcc_emission_factors" ADD COLUMN "fuel_type" varchar(100);--> statement-breakpoint
ALTER TABLE "ipcc_emission_factors" ADD COLUMN "activity_type" varchar(200);--> statement-breakpoint
ALTER TABLE "ipcc_emission_factors" ADD COLUMN "heating_value" numeric(10, 3);--> statement-breakpoint
ALTER TABLE "ipcc_emission_factors" ADD COLUMN "heating_value_unit" varchar(50);