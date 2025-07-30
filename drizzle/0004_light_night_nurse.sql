CREATE TABLE "carbon_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actual_carbon" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cultivation" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "energy_diesel" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "energy_electricity" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "fertilizer_nitrogen" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "herbicides" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "raws" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reference_carbon" ADD COLUMN "carbon_project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "actual_carbon" ADD CONSTRAINT "actual_carbon_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultivation" ADD CONSTRAINT "cultivation_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_diesel" ADD CONSTRAINT "energy_diesel_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_electricity" ADD CONSTRAINT "energy_electricity_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fertilizer_nitrogen" ADD CONSTRAINT "fertilizer_nitrogen_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "herbicides" ADD CONSTRAINT "herbicides_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raws" ADD CONSTRAINT "raws_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_carbon" ADD CONSTRAINT "reference_carbon_carbon_project_id_carbon_project_id_fk" FOREIGN KEY ("carbon_project_id") REFERENCES "public"."carbon_project"("id") ON DELETE cascade ON UPDATE no action;