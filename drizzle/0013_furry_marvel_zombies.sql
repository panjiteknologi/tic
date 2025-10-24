CREATE TABLE "defra_carbon_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"defra_project_id" uuid NOT NULL,
	"defra_emission_factor_id" uuid NOT NULL,
	"activity_date" timestamp NOT NULL,
	"quantity" numeric(20, 6) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"co2_emissions" numeric(20, 6) NOT NULL,
	"ch4_emissions" numeric(20, 6) NOT NULL,
	"n2o_emissions" numeric(20, 6) NOT NULL,
	"total_co2e" numeric(20, 6) NOT NULL,
	"description" text,
	"location" text,
	"evidence" text,
	"category" varchar(100) NOT NULL,
	"scope" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_electricity_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" varchar(10) NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_emission_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" varchar(4) NOT NULL,
	"level1_category" text NOT NULL,
	"level2_category" text NOT NULL,
	"level3_category" text,
	"level4_category" text,
	"activity_name" text NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_type" varchar(50) NOT NULL,
	"co2_factor" numeric(20, 10) NOT NULL,
	"ch4_factor" numeric(20, 10) NOT NULL,
	"n2o_factor" numeric(20, 10) NOT NULL,
	"co2e_factor" numeric(20, 10) NOT NULL,
	"scope" varchar(20),
	"source" text DEFAULT 'DEFRA',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_flight_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" varchar(100) NOT NULL,
	"destination" varchar(100) NOT NULL,
	"origin_iata" varchar(3),
	"destination_iata" varchar(3),
	"distance_km" numeric(10, 2) NOT NULL,
	"flight_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_fuel_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"default_unit" varchar(20) NOT NULL,
	"conversion_factor" numeric(10, 6),
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_material_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"default_unit" varchar(20) DEFAULT 'tonnes' NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_name" varchar(255),
	"reporting_period_start" timestamp NOT NULL,
	"reporting_period_end" timestamp NOT NULL,
	"defra_year" varchar(4) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_vehicle_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"fuel_type" varchar(50) NOT NULL,
	"vehicle_size" varchar(50),
	"engine_size" varchar(50),
	"category" varchar(50) NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defra_waste_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"disposal_method" varchar(50) NOT NULL,
	"default_unit" varchar(20) DEFAULT 'tonnes' NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "defra_carbon_calculations" ADD CONSTRAINT "defra_carbon_calculations_defra_project_id_defra_projects_id_fk" FOREIGN KEY ("defra_project_id") REFERENCES "public"."defra_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "defra_carbon_calculations" ADD CONSTRAINT "defra_carbon_calculations_defra_emission_factor_id_defra_emission_factors_id_fk" FOREIGN KEY ("defra_emission_factor_id") REFERENCES "public"."defra_emission_factors"("id") ON DELETE no action ON UPDATE no action;