CREATE TYPE "public"."gas_type" AS ENUM('CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."sector" AS ENUM('ENERGY', 'IPPU', 'AFOLU', 'WASTE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('TIER_1', 'TIER_2', 'TIER_3');--> statement-breakpoint
CREATE TABLE "ipcc_activity_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"value" numeric(20, 6) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"source" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "ipcc_emission_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"activity_data_id" uuid NOT NULL,
	"emission_factor_id" uuid NOT NULL,
	"tier" "tier" NOT NULL,
	"gas_type" "gas_type" NOT NULL,
	"emission_value" numeric(20, 6) NOT NULL,
	"emission_unit" varchar(50) DEFAULT 'kg' NOT NULL,
	"co2_equivalent" numeric(20, 6) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ipcc_emission_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"sector" "sector" NOT NULL,
	"ipcc_project_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ipcc_emission_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"gas_type" "gas_type" NOT NULL,
	"tier" "tier" NOT NULL,
	"value" numeric(20, 6) NOT NULL,
	"unit" varchar(100) NOT NULL,
	"source" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ipcc_gwp_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gas_type" "gas_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"assessment_report" varchar(50) DEFAULT 'AR5',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ipcc_gwp_values_gas_type_unique" UNIQUE("gas_type")
);
--> statement-breakpoint
CREATE TABLE "ipcc_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"year" integer NOT NULL,
	"status" "project_status" DEFAULT 'DRAFT' NOT NULL,
	"organization_name" varchar(255),
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "ipcc_project_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sector" "sector" NOT NULL,
	"total_co2" numeric(20, 6) DEFAULT '0',
	"total_ch4" numeric(20, 6) DEFAULT '0',
	"total_n2o" numeric(20, 6) DEFAULT '0',
	"total_other_gases" numeric(20, 6) DEFAULT '0',
	"total_co2_equivalent" numeric(20, 6) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ipcc_activity_data" ADD CONSTRAINT "ipcc_activity_data_project_id_ipcc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ipcc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_activity_data" ADD CONSTRAINT "ipcc_activity_data_category_id_ipcc_emission_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ipcc_emission_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_emission_calculations" ADD CONSTRAINT "ipcc_emission_calculations_project_id_ipcc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ipcc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_emission_calculations" ADD CONSTRAINT "ipcc_emission_calculations_activity_data_id_ipcc_activity_data_id_fk" FOREIGN KEY ("activity_data_id") REFERENCES "public"."ipcc_activity_data"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_emission_calculations" ADD CONSTRAINT "ipcc_emission_calculations_emission_factor_id_ipcc_emission_factors_id_fk" FOREIGN KEY ("emission_factor_id") REFERENCES "public"."ipcc_emission_factors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_emission_categories" ADD CONSTRAINT "ipcc_emission_categories_ipcc_project_id_ipcc_projects_id_fk" FOREIGN KEY ("ipcc_project_id") REFERENCES "public"."ipcc_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_emission_factors" ADD CONSTRAINT "ipcc_emission_factors_category_id_ipcc_emission_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ipcc_emission_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipcc_project_summaries" ADD CONSTRAINT "ipcc_project_summaries_project_id_ipcc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ipcc_projects"("id") ON DELETE cascade ON UPDATE no action;