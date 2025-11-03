import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const gasTypeEnum = pgEnum("gas_type", [
  "CO2",
  "CH4",
  "N2O",
  "HFCs",
  "PFCs",
  "SF6",
  "NF3",
]);

export const sectorEnum = pgEnum("sector", [
  "ENERGY",
  "IPPU",
  "AFOLU",
  "WASTE",
  "OTHER",
]);

export const tierEnum = pgEnum("tier", ["TIER_1", "TIER_2", "TIER_3"]);

export const projectStatusEnum = pgEnum("project_status", [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
]);

// ============================================
// MAIN TABLES
// ============================================

// Project IPCC (parent dari semua data)
export const ipccProjects = pgTable("ipcc_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  year: integer("year").notNull(), // tahun inventarisasi
  status: projectStatusEnum("status").notNull().default("DRAFT"),

  // Metadata
  organizationName: varchar("organization_name", { length: 255 }),
  location: varchar("location", { length: 255 }), // country/region

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
});

// Kategori Emisi
export const emissionCategories = pgTable("ipcc_emission_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull(), // e.g., "1.A.1" (IPCC code)
  name: varchar("name", { length: 255 }).notNull(),
  sector: sectorEnum("sector").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Faktor Emisi
export const emissionFactors = pgTable("ipcc_emission_factors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),

  gasType: gasTypeEnum("gas_type").notNull(),
  tier: tierEnum("tier").notNull(),

  // Nilai faktor emisi
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  unit: varchar("unit", { length: 100 }).notNull(), // e.g., "kg_CO2/liter"

  // Category linkage for intelligent selection
  applicableCategories: varchar("applicable_categories", { length: 1000 }), // JSON array of category codes ["1.A.1", "1.A.2"]
  fuelType: varchar("fuel_type", { length: 100 }), // e.g., "Coal", "Natural Gas", "Diesel"
  activityType: varchar("activity_type", { length: 200 }), // e.g., "Power Generation", "Road Transport"
  
  // Heating value for energy sector (for unit conversion)
  heatingValue: decimal("heating_value", { precision: 10, scale: 3 }), // GJ/ton, GJ/liter, etc.
  heatingValueUnit: varchar("heating_value_unit", { length: 50 }), // e.g., "GJ/ton", "GJ/liter"

  // Source
  source: varchar("source", { length: 500 }), // e.g., "IPCC 2006 Guidelines"

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GWP Values (untuk konversi ke CO2-eq)
export const gwpValues = pgTable("ipcc_gwp_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  gasType: gasTypeEnum("gas_type").notNull().unique(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // e.g., CH4 = 28
  assessmentReport: varchar("assessment_report", { length: 50 }).default("AR5"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Data Aktivitas (misal: konsumsi bahan bakar, jumlah ternak, dll)
export const activityData = pgTable("ipcc_activity_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => ipccProjects.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => emissionCategories.id),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Nilai aktivitas
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "liter", "ton", "head"

  // Source/referensi data
  source: varchar("source", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
});

// Hasil Perhitungan Emisi
export const emissionCalculations = pgTable("ipcc_emission_calculations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => ipccProjects.id, { onDelete: "cascade" }),
  activityDataId: uuid("activity_data_id")
    .notNull()
    .references(() => activityData.id, { onDelete: "cascade" }),
  emissionFactorId: uuid("emission_factor_id")
    .references(() => emissionFactors.id),

  tier: tierEnum("tier").notNull(),
  gasType: gasTypeEnum("gas_type").notNull(),

  // Hasil perhitungan
  emissionValue: decimal("emission_value", {
    precision: 20,
    scale: 6,
  }).notNull(), // dalam kg gas
  emissionUnit: varchar("emission_unit", { length: 50 })
    .notNull()
    .default("kg"),

  // Konversi CO2-eq
  co2Equivalent: decimal("co2_equivalent", {
    precision: 20,
    scale: 6,
  }).notNull(), // dalam kg CO2-eq

  // Formula sederhana: activity_value × emission_factor × gwp
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Summary per Project (untuk dashboard/reporting)
export const projectSummaries = pgTable("ipcc_project_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => ipccProjects.id, { onDelete: "cascade" }),
  sector: sectorEnum("sector").notNull(),

  // Total per gas (dalam kg)
  totalCO2: decimal("total_co2", { precision: 20, scale: 6 }).default("0"),
  totalCH4: decimal("total_ch4", { precision: 20, scale: 6 }).default("0"),
  totalN2O: decimal("total_n2o", { precision: 20, scale: 6 }).default("0"),
  totalOtherGases: decimal("total_other_gases", {
    precision: 20,
    scale: 6,
  }).default("0"),

  // Total CO2-equivalent (dalam ton)
  totalCO2Equivalent: decimal("total_co2_equivalent", {
    precision: 20,
    scale: 6,
  }).notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tambah junction table untuk project-category relationship
export const projectCategories = pgTable("ipcc_project_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => ipccProjects.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => emissionCategories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const ipccProjectsRelations = relations(ipccProjects, ({ many }) => ({
  activityData: many(activityData),
  calculations: many(emissionCalculations),
  summaries: many(projectSummaries),
  projectCategories: many(projectCategories),
}));

export const emissionCategoriesRelations = relations(
  emissionCategories,
  ({ many }) => ({
    activityData: many(activityData),
    projectCategories: many(projectCategories),
  })
);

export const emissionFactorsRelations = relations(
  emissionFactors,
  ({ many }) => ({
    calculations: many(emissionCalculations),
  })
);

export const activityDataRelations = relations(
  activityData,
  ({ one, many }) => ({
    project: one(ipccProjects, {
      fields: [activityData.projectId],
      references: [ipccProjects.id],
    }),
    category: one(emissionCategories, {
      fields: [activityData.categoryId],
      references: [emissionCategories.id],
    }),
    calculations: many(emissionCalculations),
  })
);

export const emissionCalculationsRelations = relations(
  emissionCalculations,
  ({ one }) => ({
    project: one(ipccProjects, {
      fields: [emissionCalculations.projectId],
      references: [ipccProjects.id],
    }),
    activityData: one(activityData, {
      fields: [emissionCalculations.activityDataId],
      references: [activityData.id],
    }),
    emissionFactor: one(emissionFactors, {
      fields: [emissionCalculations.emissionFactorId],
      references: [emissionFactors.id],
    }),
  })
);

export const projectSummariesRelations = relations(
  projectSummaries,
  ({ one }) => ({
    project: one(ipccProjects, {
      fields: [projectSummaries.projectId],
      references: [ipccProjects.id],
    }),
  })
);

export const projectCategoriesRelations = relations(
  projectCategories,
  ({ one }) => ({
    project: one(ipccProjects, {
      fields: [projectCategories.projectId],
      references: [ipccProjects.id],
    }),
    category: one(emissionCategories, {
      fields: [projectCategories.categoryId],
      references: [emissionCategories.id],
    }),
  })
);
