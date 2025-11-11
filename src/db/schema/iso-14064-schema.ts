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

export const projectStatusEnum = pgEnum('iso14064_project_status', [
  'draft',
  'active',
  'completed',
  'archived'
]);

export const scopeEnum = pgEnum('iso14064_scope', [
  'Scope1',
  'Scope2',
  'Scope3'
]);

export const gasTypeEnum = pgEnum('iso14064_gas_type', [
  'CO2',
  'CH4',
  'N2O',
  'HFCs',
  'PFCs',
  'SF6',
  'NF3'
]);

export const calculationStatusEnum = pgEnum('iso14064_calculation_status', [
  'draft',
  'calculated',
  'verified',
  'approved'
]);

export const boundaryTypeEnum = pgEnum('iso14064_boundary_type', [
  'operational',
  'financial',
  'other'
]);

// ============================================
// MAIN TABLES
// ============================================

// Project ISO 14064 (parent dari semua data)
export const iso14064Projects = pgTable('iso14064_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),

  // Organization info
  organizationName: varchar('organization_name', { length: 255 }),

  // Reporting period
  reportingPeriodStart: timestamp('reporting_period_start').notNull(),
  reportingPeriodEnd: timestamp('reporting_period_end').notNull(),
  reportingYear: varchar('reporting_year', { length: 4 }).notNull(), // e.g., "2024"

  // Project settings
  status: projectStatusEnum('status').default('draft').notNull(),
  boundaryType: boundaryTypeEnum('boundary_type')
    .default('operational')
    .notNull(),
  standardVersion: varchar('standard_version', { length: 50 })
    .default('14064-1:2018')
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User's carbon footprint calculations
export const iso14064Calculations = pgTable('iso14064_calculations', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Relation to project
  projectId: uuid('project_id')
    .notNull()
    .references(() => iso14064Projects.id, { onDelete: 'cascade' }),

  // Scope and category
  scope: scopeEnum('scope').notNull(),
  category: varchar('category', { length: 255 }).notNull(), // e.g., "Stationary Combustion", "Mobile Combustion", "Purchased Electricity"

  // Activity data (stored as JSONB for flexibility)
  activityData: jsonb('activity_data').notNull(), // { quantity: number, unit: string, description: string, ... }

  // Emission factor (snapshot for historical accuracy)
  emissionFactorId: uuid('emission_factor_id'), // Optional reference if master data exists
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
export const iso14064ProjectSummaries = pgTable('iso14064_project_summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => iso14064Projects.id, { onDelete: 'cascade' }),

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
  breakdownByCategory: jsonb('breakdown_by_category'), // { "Stationary Combustion": number, ... }

  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ============================================
// RELATIONS
// ============================================

export const iso14064ProjectsRelations = relations(
  iso14064Projects,
  ({ one, many }) => ({
    tenant: one(tenant, {
      fields: [iso14064Projects.tenantId],
      references: [tenant.id]
    }),
    calculations: many(iso14064Calculations),
    summaries: many(iso14064ProjectSummaries)
  })
);

export const iso14064CalculationsRelations = relations(
  iso14064Calculations,
  ({ one }) => ({
    project: one(iso14064Projects, {
      fields: [iso14064Calculations.projectId],
      references: [iso14064Projects.id]
    })
  })
);

export const iso14064ProjectSummariesRelations = relations(
  iso14064ProjectSummaries,
  ({ one }) => ({
    project: one(iso14064Projects, {
      fields: [iso14064ProjectSummaries.projectId],
      references: [iso14064Projects.id]
    })
  })
);

// ==================== TYPES ====================

export type Iso14064Project = typeof iso14064Projects.$inferSelect;
export type NewIso14064Project = typeof iso14064Projects.$inferInsert;

export type Iso14064Calculation = typeof iso14064Calculations.$inferSelect;
export type NewIso14064Calculation = typeof iso14064Calculations.$inferInsert;

export type Iso14064ProjectSummary =
  typeof iso14064ProjectSummaries.$inferSelect;
export type NewIso14064ProjectSummary =
  typeof iso14064ProjectSummaries.$inferInsert;
