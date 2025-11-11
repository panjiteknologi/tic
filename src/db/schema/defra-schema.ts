import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenant } from './tenant-schema';

// ============================================
// MAIN TABLES
// ============================================

// Project DEFRA (parent dari semua data)
export const defraProjects = pgTable('defra_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Q1 2024 Carbon Audit", "Annual Report 2024"
  description: text('description'),

  // Metadata
  organizationName: varchar('organization_name', { length: 255 }),

  // Project settings
  reportingPeriodStart: timestamp('reporting_period_start').notNull(),
  reportingPeriodEnd: timestamp('reporting_period_end').notNull(),
  defraYear: varchar('defra_year', { length: 4 }).notNull(), // DEFRA factor year to use (e.g., "2024")

  status: varchar('status', { length: 50 }).default('active').notNull(), // "active", "completed", "archived"

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Master data: DEFRA Emission Factors
export const defraEmissionFactors = pgTable('defra_emission_factors', {
  id: uuid('id').defaultRandom().primaryKey(),

  // DEFRA year (karena factors di-update tiap tahun)
  year: varchar('year', { length: 4 }).notNull(), // e.g., "2024"

  // Hierarchical categorization
  level1Category: text('level1_category').notNull(), // e.g., "Fuels", "Business travel", "Material use"
  level2Category: text('level2_category').notNull(), // e.g., "Gaseous fuels", "Road"
  level3Category: text('level3_category'), // e.g., "Natural gas"
  level4Category: text('level4_category'), // More specific if available

  // Activity description
  activityName: text('activity_name').notNull(), // e.g., "Petrol car - medium (up to 1.4L)"

  // Unit of measurement
  unit: varchar('unit', { length: 50 }).notNull(), // e.g., "kWh", "km", "kg", "litres", "passenger-km"
  unitType: varchar('unit_type', { length: 50 }).notNull(), // "distance", "energy", "volume", "mass", "currency"

  // Emission factors (decimal untuk presisi tinggi)
  co2Factor: decimal('co2_factor', { precision: 20, scale: 10 }).notNull(), // kg CO2 per unit
  ch4Factor: decimal('ch4_factor', { precision: 20, scale: 10 }).notNull(), // kg CH4 per unit
  n2oFactor: decimal('n2o_factor', { precision: 20, scale: 10 }).notNull(), // kg N2O per unit
  co2eFactor: decimal('co2e_factor', { precision: 20, scale: 10 }).notNull(), // kg CO2e per unit (total)

  // GHG Protocol Scope
  scope: varchar('scope', { length: 20 }), // "Scope 1", "Scope 2", "Scope 3"

  // Additional metadata
  source: text('source').default('DEFRA'), // "DEFRA", "Custom"
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User's carbon footprint calculations
export const defraCarbonCalculations = pgTable('defra_carbon_calculations', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Relation to project
  projectId: uuid('defra_project_id')
    .notNull()
    .references(() => defraProjects.id, { onDelete: 'cascade' }),

  // Reference to emission factor used
  emissionFactorId: uuid('defra_emission_factor_id')
    .notNull()
    .references(() => defraEmissionFactors.id),

  // Calculation data
  activityDate: timestamp('activity_date').notNull(), // When the activity occurred
  quantity: decimal('quantity', { precision: 20, scale: 6 }).notNull(), // Amount of activity
  unit: varchar('unit', { length: 50 }).notNull(), // Should match emission factor unit

  // Calculated emissions (stored untuk historical accuracy)
  co2Emissions: decimal('co2_emissions', { precision: 20, scale: 6 }).notNull(), // kg CO2
  ch4Emissions: decimal('ch4_emissions', { precision: 20, scale: 6 }).notNull(), // kg CH4
  n2oEmissions: decimal('n2o_emissions', { precision: 20, scale: 6 }).notNull(), // kg N2O
  totalCo2e: decimal('total_co2e', { precision: 20, scale: 6 }).notNull(), // kg CO2e (total)

  // Metadata
  description: text('description'), // User notes
  location: text('location'), // Where the activity happened
  evidence: text('evidence'), // URL to receipt/document if any

  // Categorization
  category: varchar('category', { length: 100 }).notNull(), // From emission factor
  scope: varchar('scope', { length: 20 }), // "Scope 1", "Scope 2", "Scope 3"

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Master data: Vehicle types (untuk dropdown/autocomplete)
export const defraVehicleTypes = pgTable('defra_vehicle_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // e.g., "Petrol Car - Small (up to 1.4L)"
  fuelType: varchar('fuel_type', { length: 50 }).notNull(), // "Petrol", "Diesel", "Electric", "Hybrid"
  vehicleSize: varchar('vehicle_size', { length: 50 }), // "Small", "Medium", "Large"
  engineSize: varchar('engine_size', { length: 50 }), // "Up to 1.4L", "1.4-2.0L", etc.
  category: varchar('category', { length: 50 }).notNull(), // "Car", "Van", "Motorcycle", "HGV"
  isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Master data: Fuel types
export const defraFuelTypes = pgTable('defra_fuel_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // "Natural Gas", "Electricity", "Petrol", "Diesel", "LPG"
  category: varchar('category', { length: 50 }).notNull(), // "Solid", "Liquid", "Gaseous", "Electricity"
  defaultUnit: varchar('default_unit', { length: 20 }).notNull(), // "kWh", "litres", "kg"
  conversionFactor: decimal('conversion_factor', { precision: 10, scale: 6 }), // untuk konversi unit
  isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Master data: Waste types
export const defraWasteTypes = pgTable('defra_waste_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // "Paper & Cardboard", "Plastic", "Organic", "E-waste"
  disposalMethod: varchar('disposal_method', { length: 50 }).notNull(), // "Landfill", "Recycling", "Incineration", "Composting"
  defaultUnit: varchar('default_unit', { length: 20 })
    .notNull()
    .default('tonnes'),
  isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Master data: Material types (untuk Material use category)
export const defraMaterialTypes = pgTable('defra_material_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // "Paper", "Plastic - PET", "Aluminium", "Steel"
  category: varchar('category', { length: 50 }).notNull(), // "Paper products", "Metals", "Plastics", "Textiles"
  defaultUnit: varchar('default_unit', { length: 20 })
    .notNull()
    .default('tonnes'),
  isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Master data: Flight distances/routes (helper)
export const defraFlightRoutes = pgTable('defra_flight_routes', {
  id: uuid('id').defaultRandom().primaryKey(),
  origin: varchar('origin', { length: 100 }).notNull(), // "London"
  destination: varchar('destination', { length: 100 }).notNull(), // "New York"
  originIATA: varchar('origin_iata', { length: 3 }), // "LHR"
  destinationIATA: varchar('destination_iata', { length: 3 }), // "JFK"
  distanceKm: decimal('distance_km', { precision: 10, scale: 2 }).notNull(),
  flightType: varchar('flight_type', { length: 50 }).notNull(), // "Domestic", "Short-haul", "Long-haul"
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Master data: UK Grid electricity region factors (jika perlu breakdown per region)
export const defraElectricityRegions = pgTable('defra_electricity_regions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // "UK", "England", "Scotland", "Wales", "Northern Ireland"
  code: varchar('code', { length: 10 }).notNull(), // "UK", "EN", "SC", "WA", "NI"
  isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Summary per Project (untuk dashboard/reporting)
export const defraProjectSummaries = pgTable('defra_project_summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => defraProjects.id, { onDelete: 'cascade' }),

  // Summary per scope
  scope1Total: decimal('scope1_total', { precision: 20, scale: 6 }).default(
    '0'
  ), // kg CO2e
  scope2Total: decimal('scope2_total', { precision: 20, scale: 6 }).default(
    '0'
  ), // kg CO2e
  scope3Total: decimal('scope3_total', { precision: 20, scale: 6 }).default(
    '0'
  ), // kg CO2e

  // Summary per kategori utama
  fuelsTotal: decimal('fuels_total', { precision: 20, scale: 6 }).default('0'), // kg CO2e
  businessTravelTotal: decimal('business_travel_total', {
    precision: 20,
    scale: 6
  }).default('0'), // kg CO2e
  materialUseTotal: decimal('material_use_total', {
    precision: 20,
    scale: 6
  }).default('0'), // kg CO2e
  wasteTotal: decimal('waste_total', { precision: 20, scale: 6 }).default('0'), // kg CO2e

  // Total keseluruhan
  totalCo2e: decimal('total_co2e', { precision: 20, scale: 6 })
    .notNull()
    .default('0'), // kg CO2e

  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ============================================
// RELATIONS
// ============================================

export const defraProjectsRelations = relations(
  defraProjects,
  ({ one, many }) => ({
    tenant: one(tenant, {
      fields: [defraProjects.tenantId],
      references: [tenant.id]
    }),
    calculations: many(defraCarbonCalculations),
    summaries: many(defraProjectSummaries)
  })
);

export const defraEmissionFactorsRelations = relations(
  defraEmissionFactors,
  ({ many }) => ({
    calculations: many(defraCarbonCalculations)
  })
);

export const defraCarbonCalculationsRelations = relations(
  defraCarbonCalculations,
  ({ one }) => ({
    project: one(defraProjects, {
      fields: [defraCarbonCalculations.projectId],
      references: [defraProjects.id]
    }),
    emissionFactor: one(defraEmissionFactors, {
      fields: [defraCarbonCalculations.emissionFactorId],
      references: [defraEmissionFactors.id]
    })
  })
);

export const defraProjectSummariesRelations = relations(
  defraProjectSummaries,
  ({ one }) => ({
    project: one(defraProjects, {
      fields: [defraProjectSummaries.projectId],
      references: [defraProjects.id]
    })
  })
);

// ==================== TYPES ====================

export type DefraProject = typeof defraProjects.$inferSelect;
export type NewDefraProject = typeof defraProjects.$inferInsert;

export type DefraEmissionFactor = typeof defraEmissionFactors.$inferSelect;
export type NewDefraEmissionFactor = typeof defraEmissionFactors.$inferInsert;

export type DefraCarbonCalculation =
  typeof defraCarbonCalculations.$inferSelect;
export type NewDefraCarbonCalculation =
  typeof defraCarbonCalculations.$inferInsert;

export type DefraProjectSummary = typeof defraProjectSummaries.$inferSelect;
export type NewDefraProjectSummary = typeof defraProjectSummaries.$inferInsert;
