import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenant } from './tenant-schema';

// ============================================
// ENUMS
// ============================================

export const projectStatusEnum = pgEnum('ghg_protocol_project_status', [
  'draft',
  'active',
  'completed',
  'archived'
]);

export const scopeEnum = pgEnum('ghg_protocol_scope', [
  'Scope1',
  'Scope2',
  'Scope3'
]);

export const gasTypeEnum = pgEnum('ghg_protocol_gas_type', [
  'CO2',
  'CH4',
  'N2O',
  'HFCs',
  'PFCs',
  'SF6',
  'NF3'
]);

export const calculationStatusEnum = pgEnum('ghg_protocol_calculation_status', [
  'draft',
  'calculated',
  'verified',
  'approved'
]);

export const scope1CategoryEnum = pgEnum('ghg_protocol_scope1_category', [
  'StationaryCombustion',
  'MobileCombustion',
  'FugitiveEmissions',
  'ProcessEmissions'
]);

export const scope2CategoryEnum = pgEnum('ghg_protocol_scope2_category', [
  'PurchasedElectricity',
  'PurchasedSteam',
  'PurchasedHeating',
  'PurchasedCooling'
]);

export const scope3CategoryEnum = pgEnum('ghg_protocol_scope3_category', [
  'PurchasedGoods',
  'CapitalGoods',
  'FuelEnergy',
  'UpstreamTransport',
  'WasteOperations',
  'BusinessTravel',
  'EmployeeCommuting',
  'UpstreamLeased',
  'DownstreamTransport',
  'ProcessingSold',
  'UseSold',
  'EndOfLifeSold',
  'DownstreamLeased',
  'Franchises',
  'Investments'
]);

export const boundaryTypeEnum = pgEnum('ghg_protocol_boundary_type', [
  'operational',
  'financial',
  'other'
]);

// ============================================
// MAIN TABLES
// ============================================

// Project GHG Protocol (parent dari semua data)
export const ghgProtocolProjects = pgTable('ghg_protocol_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),

  // Organization info
  organizationName: varchar('organization_name', { length: 255 }),
  location: varchar('location', { length: 255 }), // country/region

  // Reporting period
  reportingPeriodStart: timestamp('reporting_period_start').notNull(),
  reportingPeriodEnd: timestamp('reporting_period_end').notNull(),
  reportingYear: varchar('reporting_year', { length: 4 }).notNull(), // e.g., "2024"

  // Project settings
  status: projectStatusEnum('status').default('draft').notNull(),
  boundaryType: boundaryTypeEnum('boundary_type')
    .default('operational')
    .notNull(),
  standardVersion: varchar('standard_version', { length: 100 })
    .default('GHG Protocol Corporate Standard')
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Master data: GHG Protocol Emission Factors
export const ghgProtocolEmissionFactors = pgTable(
  'ghg_protocol_emission_factors',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Versioning (factors updated annually)
    year: varchar('year', { length: 4 }).notNull(), // e.g., "2024"

    // Scope and category
    scope: scopeEnum('scope').notNull(),
    category: text('category').notNull(), // Flexible text field for all scope categories

    // Activity description
    activityName: text('activity_name').notNull(), // e.g., "Natural gas - combustion", "Electricity - grid"

    // Unit of measurement
    unit: varchar('unit', { length: 50 }).notNull(), // e.g., "kWh", "liter", "kg", "ton"
    unitType: varchar('unit_type', { length: 50 }).notNull(), // "energy", "volume", "mass", "distance", "currency"

    // Emission factors (kg CO2e per unit)
    co2Factor: decimal('co2_factor', { precision: 20, scale: 10 }).notNull(), // kg CO2 per unit
    ch4Factor: decimal('ch4_factor', { precision: 20, scale: 10 }).notNull(), // kg CH4 per unit
    n2oFactor: decimal('n2o_factor', { precision: 20, scale: 10 }).notNull(), // kg N2O per unit
    co2eFactor: decimal('co2e_factor', { precision: 20, scale: 10 }).notNull(), // kg CO2e per unit (total)

    // Additional metadata
    fuelType: varchar('fuel_type', { length: 100 }), // e.g., "Natural Gas", "Diesel", "Coal"
    activityType: varchar('activity_type', { length: 200 }), // e.g., "Power Generation", "Road Transport"

    // Heating value for energy sector (for unit conversion)
    heatingValue: decimal('heating_value', { precision: 10, scale: 3 }), // GJ/ton, GJ/liter, etc.
    heatingValueUnit: varchar('heating_value_unit', { length: 50 }), // e.g., "GJ/ton", "GJ/liter"

    // Source
    source: text('source').default('GHG Protocol'), // e.g., "GHG Protocol", "EPA", "IPCC", "Custom"
    notes: text('notes'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  }
);

// User's carbon footprint calculations
export const ghgProtocolCalculations = pgTable('ghg_protocol_calculations', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Relation to project
  projectId: uuid('project_id')
    .notNull()
    .references(() => ghgProtocolProjects.id, { onDelete: 'cascade' }),

  // Reference to emission factor (optional - snapshot stored in emissionFactor field)
  emissionFactorId: uuid('emission_factor_id').references(
    () => ghgProtocolEmissionFactors.id
  ),

  // Scope and category
  scope: scopeEnum('scope').notNull(),
  category: text('category').notNull(), // Matches scope category (flexible text)

  // Activity data (stored as JSONB for flexibility)
  activityData: jsonb('activity_data').notNull(), // { quantity: number, unit: string, description: string, activityDate: date, location: string, ... }

  // Emission factor (snapshot for historical accuracy)
  emissionFactor: jsonb('emission_factor').notNull(), // Snapshot of emission factor used

  // Gas type and emissions
  gasType: gasTypeEnum('gas_type').notNull(),
  emissionValue: decimal('emission_value', {
    precision: 20,
    scale: 6
  }).notNull(), // kg gas
  co2Equivalent: decimal('co2_equivalent', {
    precision: 20,
    scale: 6
  }).notNull(), // kg CO2-eq
  gwpValue: decimal('gwp_value', { precision: 10, scale: 2 }).notNull(), // GWP value used for conversion

  // Calculation method
  calculationMethod: varchar('calculation_method', { length: 50 }), // "tier1", "tier2", "tier3", "custom"

  // Uncertainty (optional)
  uncertainty: decimal('uncertainty', { precision: 10, scale: 2 }), // percentage or absolute value

  // Metadata
  notes: text('notes'),
  evidence: text('evidence'), // URL or path to supporting document

  // Status
  status: calculationStatusEnum('status').default('draft').notNull(),

  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Summary per Project (untuk dashboard/reporting)
export const ghgProtocolProjectSummaries = pgTable(
  'ghg_protocol_project_summaries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => ghgProtocolProjects.id, { onDelete: 'cascade' }),

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

    // Total keseluruhan
    totalCo2e: decimal('total_co2e', { precision: 20, scale: 6 })
      .notNull()
      .default('0'), // kg CO2e

    // Breakdown data (stored as JSONB)
    breakdownByGas: jsonb('breakdown_by_gas'), // { CO2: number, CH4: number, N2O: number, ... }
    breakdownByCategory: jsonb('breakdown_by_category'), // { "Stationary Combustion": number, "Mobile Combustion": number, ... }
    scope3Breakdown: jsonb('scope3_breakdown'), // { "PurchasedGoods": number, "CapitalGoods": number, ... } - all 15 Scope 3 categories

    updatedAt: timestamp('updated_at').defaultNow().notNull()
  }
);

// ============================================
// RELATIONS
// ============================================

export const ghgProtocolProjectsRelations = relations(
  ghgProtocolProjects,
  ({ one, many }) => ({
    tenant: one(tenant, {
      fields: [ghgProtocolProjects.tenantId],
      references: [tenant.id]
    }),
    calculations: many(ghgProtocolCalculations),
    summaries: many(ghgProtocolProjectSummaries)
  })
);

export const ghgProtocolEmissionFactorsRelations = relations(
  ghgProtocolEmissionFactors,
  ({ many }) => ({
    calculations: many(ghgProtocolCalculations)
  })
);

export const ghgProtocolCalculationsRelations = relations(
  ghgProtocolCalculations,
  ({ one }) => ({
    project: one(ghgProtocolProjects, {
      fields: [ghgProtocolCalculations.projectId],
      references: [ghgProtocolProjects.id]
    }),
    emissionFactor: one(ghgProtocolEmissionFactors, {
      fields: [ghgProtocolCalculations.emissionFactorId],
      references: [ghgProtocolEmissionFactors.id]
    })
  })
);

export const ghgProtocolProjectSummariesRelations = relations(
  ghgProtocolProjectSummaries,
  ({ one }) => ({
    project: one(ghgProtocolProjects, {
      fields: [ghgProtocolProjectSummaries.projectId],
      references: [ghgProtocolProjects.id]
    })
  })
);

// ==================== TYPES ====================

export type GhgProtocolProject = typeof ghgProtocolProjects.$inferSelect;
export type NewGhgProtocolProject = typeof ghgProtocolProjects.$inferInsert;

export type GhgProtocolEmissionFactor =
  typeof ghgProtocolEmissionFactors.$inferSelect;
export type NewGhgProtocolEmissionFactor =
  typeof ghgProtocolEmissionFactors.$inferInsert;

export type GhgProtocolCalculation =
  typeof ghgProtocolCalculations.$inferSelect;
export type NewGhgProtocolCalculation =
  typeof ghgProtocolCalculations.$inferInsert;

export type GhgProtocolProjectSummary =
  typeof ghgProtocolProjectSummaries.$inferSelect;
export type NewGhgProtocolProjectSummary =
  typeof ghgProtocolProjectSummaries.$inferInsert;
