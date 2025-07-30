CREATE TABLE "actual_carbon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actual_land_use" text,
	"climate_region_actual" text,
	"soil_type_actual" text,
	"current_soil_management_actual" text,
	"current_input_to_soil_actual" text,
	"socst_actual" numeric(10, 2),
	"flu_actual" numeric(10, 2),
	"fmg_actual" numeric(10, 2),
	"fi_actual" numeric(10, 2),
	"cveg_actual" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cultivation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ghg_emissions_raw_material_input" numeric(10, 2),
	"ghg_emissions_fertilizers" numeric(10, 2),
	"ghg_emissions_herbicides_pesticides" numeric(10, 2),
	"ghg_emissions_energy" numeric(10, 2),
	"total_emissions_corn" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "energy_diesel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"diesel_consumed" numeric(10, 2),
	"emission_factor_diesel" numeric(10, 2),
	"co2e_emissions_diesel_yr" numeric(10, 2),
	"co2e_emissions_diesel_tffb" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "energy_electricity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"electricity_consumption_soil_prep" numeric(10, 2),
	"emission_factor_electricity" numeric(10, 2),
	"co2e_emissions_electricity_yr" numeric(10, 2),
	"co2e_emissions_electricity_tffb" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fertilizer_nitrogen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ammonium_nitrate" numeric(10, 2),
	"urea" numeric(10, 2),
	"applied_manure" numeric(10, 2),
	"n_content_crop_residue" numeric(10, 2),
	"total_n_synthetic_fertilizer" numeric(10, 2),
	"emission_factor_ammonium_nitrate" numeric(10, 2),
	"emission_factor_urea" numeric(10, 2),
	"emission_factor_direct_n2o" numeric(10, 2),
	"fraction_n_volatilized_synthetic" numeric(10, 2),
	"fraction_n_volatilized_organic" numeric(10, 2),
	"emission_factor_atmospheric_deposition" numeric(10, 2),
	"fraction_n_lost_runoff" numeric(10, 2),
	"emission_factor_leaching_runoff" numeric(10, 2),
	"direct_n2o_emissions" numeric(10, 2),
	"indirect_n2o_emissions_nh3_nox" numeric(10, 2),
	"indirect_n2o_emissions_n_leaching_runoff" numeric(10, 2),
	"co2eq_emissions_nitrogen_fertilizers_ha_yr" numeric(10, 2),
	"co2eq_emissions_nitrogen_fertilizers_field_n20_ha_yr" numeric(10, 2),
	"co2eq_emissions_nitrogen_fertilizers_field_n20_tffb" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "herbicides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"acetochlor" numeric(10, 2),
	"emission_factor_pesticides" numeric(10, 2),
	"co2eq_emissions_herbicides_pesticides_ha_yr" numeric(10, 2),
	"co2eq_emissions_herbicides_pesticides_tffb" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"corn_wet" numeric(10, 2),
	"moisture_content" numeric(10, 2),
	"corn_dry" numeric(10, 2),
	"cultivation_area" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"corn_seeds_amount" numeric(10, 2),
	"emission_factor_corn_seeds" numeric(10, 2),
	"co2eq_emissions_raw_material_input_ha_yr" numeric(10, 2),
	"co2eq_emissions_raw_material_input_tffb" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reference_carbon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reference_land_use" text,
	"climate_region_reference" text,
	"soil_type_reference" text,
	"current_soil_management_reference" text,
	"current_input_to_soil_reference" text,
	"socst_reference" numeric(10, 2),
	"flu_reference" numeric(10, 2),
	"fmg_reference" numeric(10, 2),
	"fi_reference" numeric(10, 2),
	"cveg_reference" numeric(10, 2),
	"soil_organic_carbon_actual" numeric(10, 2),
	"soil_organic_carbon_reference" numeric(10, 2),
	"accumulated_soil_carbon" numeric(10, 2),
	"luc_carbon_emissions_per_kg_corn" numeric(10, 2),
	"total_luc_co2_emissions_ha_yr" numeric(10, 2),
	"total_luc_co2_emissions_t_dry_corn" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actual_carbon" ADD CONSTRAINT "actual_carbon_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultivation" ADD CONSTRAINT "cultivation_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_diesel" ADD CONSTRAINT "energy_diesel_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_electricity" ADD CONSTRAINT "energy_electricity_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fertilizer_nitrogen" ADD CONSTRAINT "fertilizer_nitrogen_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herbicides" ADD CONSTRAINT "herbicides_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raws" ADD CONSTRAINT "raws_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_carbon" ADD CONSTRAINT "reference_carbon_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;