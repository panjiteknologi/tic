CREATE TYPE "public"."iso14064_boundary_type" AS ENUM('operational', 'financial', 'other');--> statement-breakpoint
CREATE TYPE "public"."iso14064_calculation_status" AS ENUM('draft', 'calculated', 'verified', 'approved');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_boundary_type" AS ENUM('operational', 'financial', 'other');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_calculation_status" AS ENUM('draft', 'calculated', 'verified', 'approved');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_gas_type" AS ENUM('CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_project_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_scope" AS ENUM('Scope1', 'Scope2', 'Scope3');--> statement-breakpoint
CREATE TYPE "public"."iso14064_gas_type" AS ENUM('CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3');--> statement-breakpoint
CREATE TYPE "public"."iso14064_project_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_scope1_category" AS ENUM('StationaryCombustion', 'MobileCombustion', 'FugitiveEmissions', 'ProcessEmissions');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_scope2_category" AS ENUM('PurchasedElectricity', 'PurchasedSteam', 'PurchasedHeating', 'PurchasedCooling');--> statement-breakpoint
CREATE TYPE "public"."ghg_protocol_scope3_category" AS ENUM('PurchasedGoods', 'CapitalGoods', 'FuelEnergy', 'UpstreamTransport', 'WasteOperations', 'BusinessTravel', 'EmployeeCommuting', 'UpstreamLeased', 'DownstreamTransport', 'ProcessingSold', 'UseSold', 'EndOfLifeSold', 'DownstreamLeased', 'Franchises', 'Investments');--> statement-breakpoint
CREATE TYPE "public"."iso14064_scope" AS ENUM('Scope1', 'Scope2', 'Scope3');--> statement-breakpoint
CREATE TABLE "ghg_protocol_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"emission_factor_id" uuid,
	"scope" "ghg_protocol_scope" NOT NULL,
	"category" text NOT NULL,
	"activity_data" jsonb NOT NULL,
	"emission_factor" jsonb NOT NULL,
	"gas_type" "ghg_protocol_gas_type" NOT NULL,
	"emission_value" numeric(20, 6) NOT NULL,
	"co2_equivalent" numeric(20, 6) NOT NULL,
	"gwp_value" numeric(10, 2) NOT NULL,
	"calculation_method" varchar(50),
	"uncertainty" numeric(10, 2),
	"notes" text,
	"evidence" text,
	"status" "ghg_protocol_calculation_status" DEFAULT 'draft' NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghg_protocol_emission_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" varchar(4) NOT NULL,
	"scope" "ghg_protocol_scope" NOT NULL,
	"category" text NOT NULL,
	"activity_name" text NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_type" varchar(50) NOT NULL,
	"co2_factor" numeric(20, 10) NOT NULL,
	"ch4_factor" numeric(20, 10) NOT NULL,
	"n2o_factor" numeric(20, 10) NOT NULL,
	"co2e_factor" numeric(20, 10) NOT NULL,
	"fuel_type" varchar(100),
	"activity_type" varchar(200),
	"heating_value" numeric(10, 3),
	"heating_value_unit" varchar(50),
	"source" text DEFAULT 'GHG Protocol',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghg_protocol_project_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scope1_total" numeric(20, 6) DEFAULT '0',
	"scope2_total" numeric(20, 6) DEFAULT '0',
	"scope3_total" numeric(20, 6) DEFAULT '0',
	"total_co2e" numeric(20, 6) DEFAULT '0' NOT NULL,
	"breakdown_by_gas" jsonb,
	"breakdown_by_category" jsonb,
	"scope3_breakdown" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghg_protocol_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_name" varchar(255),
	"location" varchar(255),
	"reporting_period_start" timestamp NOT NULL,
	"reporting_period_end" timestamp NOT NULL,
	"reporting_year" varchar(4) NOT NULL,
	"status" "ghg_protocol_project_status" DEFAULT 'draft' NOT NULL,
	"boundary_type" "ghg_protocol_boundary_type" DEFAULT 'operational' NOT NULL,
	"standard_version" varchar(100) DEFAULT 'GHG Protocol Corporate Standard' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iso14064_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scope" "iso14064_scope" NOT NULL,
	"category" varchar(255) NOT NULL,
	"activity_data" jsonb NOT NULL,
	"emission_factor_id" uuid,
	"emission_factor" jsonb NOT NULL,
	"gas_type" "iso14064_gas_type" NOT NULL,
	"emission_value" numeric(20, 6) NOT NULL,
	"co2_equivalent" numeric(20, 6) NOT NULL,
	"gwp_value" numeric(10, 2) NOT NULL,
	"calculation_method" varchar(50),
	"uncertainty" numeric(10, 2),
	"notes" text,
	"evidence" text,
	"status" "iso14064_calculation_status" DEFAULT 'draft' NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iso14064_project_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scope1_total" numeric(20, 6) DEFAULT '0',
	"scope2_total" numeric(20, 6) DEFAULT '0',
	"scope3_total" numeric(20, 6) DEFAULT '0',
	"total_co2e" numeric(20, 6) DEFAULT '0' NOT NULL,
	"breakdown_by_gas" jsonb,
	"breakdown_by_category" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iso14064_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_name" varchar(255),
	"reporting_period_start" timestamp NOT NULL,
	"reporting_period_end" timestamp NOT NULL,
	"reporting_year" varchar(4) NOT NULL,
	"status" "iso14064_project_status" DEFAULT 'draft' NOT NULL,
	"boundary_type" "iso14064_boundary_type" DEFAULT 'operational' NOT NULL,
	"standard_version" varchar(50) DEFAULT '14064-1:2018' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ghg_protocol_calculations" ADD CONSTRAINT "ghg_protocol_calculations_project_id_ghg_protocol_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghg_protocol_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghg_protocol_calculations" ADD CONSTRAINT "ghg_protocol_calculations_emission_factor_id_ghg_protocol_emission_factors_id_fk" FOREIGN KEY ("emission_factor_id") REFERENCES "public"."ghg_protocol_emission_factors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghg_protocol_project_summaries" ADD CONSTRAINT "ghg_protocol_project_summaries_project_id_ghg_protocol_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ghg_protocol_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghg_protocol_projects" ADD CONSTRAINT "ghg_protocol_projects_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iso14064_calculations" ADD CONSTRAINT "iso14064_calculations_project_id_iso14064_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."iso14064_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iso14064_project_summaries" ADD CONSTRAINT "iso14064_project_summaries_project_id_iso14064_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."iso14064_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iso14064_projects" ADD CONSTRAINT "iso14064_projects_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."calculation_status";