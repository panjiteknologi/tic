CREATE TYPE "public"."calculation_status" AS ENUM('draft', 'calculated', 'verified', 'approved');--> statement-breakpoint
CREATE TYPE "public"."feedstock_type" AS ENUM('palm_oil', 'corn', 'sugarcane', 'used_cooking_oil', 'wheat', 'rapeseed', 'soybean', 'waste', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('biodiesel', 'bioethanol', 'biomass', 'biomethane', 'bio_jet_fuel', 'other');--> statement-breakpoint
CREATE TYPE "public"."transport_mode" AS ENUM('truck', 'ship', 'rail', 'pipeline');--> statement-breakpoint
CREATE TABLE "iscc_calculation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"input_snapshot" jsonb NOT NULL,
	"eec_kg" numeric(12, 2),
	"ep_kg" numeric(12, 2),
	"etd_kg" numeric(12, 2),
	"total_kg" numeric(12, 2),
	"eec" numeric(10, 4),
	"ep" numeric(10, 4),
	"etd" numeric(10, 4),
	"el" numeric(10, 4),
	"eccr" numeric(10, 4),
	"total_emissions" numeric(10, 4) NOT NULL,
	"fossil_fuel_baseline" numeric(10, 4),
	"ghg_savings" numeric(5, 2),
	"breakdown" jsonb,
	"llm_model" text,
	"llm_prompt" text,
	"llm_response" text,
	"status" "calculation_status" DEFAULT 'calculated' NOT NULL,
	"notes" text,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iscc_cultivation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"land_area" numeric(10, 2),
	"yield" numeric(10, 2),
	"nitrogen_fertilizer" numeric(10, 2),
	"phosphate_fertilizer" numeric(10, 2),
	"potassium_fertilizer" numeric(10, 2),
	"organic_fertilizer" numeric(10, 2),
	"diesel_consumption" numeric(10, 2),
	"electricity_use" numeric(10, 2),
	"pesticides" numeric(10, 2),
	"additional_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iscc_processing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"electricity_use" numeric(12, 2),
	"steam_use" numeric(12, 2),
	"natural_gas_use" numeric(12, 2),
	"diesel_use" numeric(12, 2),
	"methanol" numeric(10, 2),
	"catalyst" numeric(10, 2),
	"acid" numeric(10, 2),
	"water_consumption" numeric(12, 2),
	"additional_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iscc_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"product_type" "product_type" NOT NULL,
	"feedstock_type" "feedstock_type" NOT NULL,
	"production_volume" numeric(12, 2),
	"lhv" numeric(10, 4),
	"lhv_unit" text DEFAULT 'MJ/kg',
	"status" "calculation_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iscc_transport" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"feedstock_distance" numeric(10, 2),
	"feedstock_mode" "transport_mode",
	"feedstock_weight" numeric(12, 2),
	"product_distance" numeric(10, 2),
	"product_mode" "transport_mode",
	"product_weight" numeric(12, 2),
	"additional_transport" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iscc_calculation" ADD CONSTRAINT "iscc_calculation_project_id_iscc_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."iscc_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iscc_cultivation" ADD CONSTRAINT "iscc_cultivation_project_id_iscc_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."iscc_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iscc_processing" ADD CONSTRAINT "iscc_processing_project_id_iscc_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."iscc_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iscc_project" ADD CONSTRAINT "iscc_project_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iscc_transport" ADD CONSTRAINT "iscc_transport_project_id_iscc_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."iscc_project"("id") ON DELETE cascade ON UPDATE no action;