import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  jsonb,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenant } from './tenant-schema';

// ==================== ENUMS ====================

export const productTypeEnum = pgEnum('product_type', [
  'biodiesel',
  'bioethanol',
  'biomass',
  'biomethane',
  'bio_jet_fuel',
  'other'
]);

export const feedstockTypeEnum = pgEnum('feedstock_type', [
  'palm_oil',
  'corn',
  'sugarcane',
  'used_cooking_oil',
  'wheat',
  'rapeseed',
  'soybean',
  'waste',
  'other'
]);

export const transportModeEnum = pgEnum('transport_mode', [
  'truck',
  'ship',
  'rail',
  'pipeline'
]);

export const calculationStatusEnum = pgEnum('calculation_status', [
  'draft',
  'calculated',
  'verified',
  'approved'
]);

// ==================== MAIN TABLES ====================

// Parent: ISCC Project
export const isccProject = pgTable('iscc_project', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id, { onDelete: 'cascade' }),

  // Project info
  name: text('name').notNull(),
  description: text('description'),
  productType: productTypeEnum('product_type').notNull(),
  feedstockType: feedstockTypeEnum('feedstock_type').notNull(),
  productionVolume: decimal('production_volume', { precision: 12, scale: 2 }), // ton/year

  lhv: decimal('lhv', { precision: 10, scale: 4 }), // MJ/kg
  lhvUnit: text('lhv_unit').default('MJ/kg'), // MJ/kg or MJ/liter

  // Metadata
  status: calculationStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Child: Cultivation Data (eec)
export const isccCultivation = pgTable('iscc_cultivation', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => isccProject.id, { onDelete: 'cascade' }),

  // Land & Yield
  landArea: decimal('land_area', { precision: 10, scale: 2 }), // hectare
  yield: decimal('yield', { precision: 10, scale: 2 }), // ton/ha

  // Fertilizers (kg/ha)
  nitrogenFertilizer: decimal('nitrogen_fertilizer', {
    precision: 10,
    scale: 2
  }),
  phosphateFertilizer: decimal('phosphate_fertilizer', {
    precision: 10,
    scale: 2
  }),
  potassiumFertilizer: decimal('potassium_fertilizer', {
    precision: 10,
    scale: 2
  }),
  organicFertilizer: decimal('organic_fertilizer', { precision: 10, scale: 2 }),

  // Energy use
  dieselConsumption: decimal('diesel_consumption', { precision: 10, scale: 2 }), // liter/ha
  electricityUse: decimal('electricity_use', { precision: 10, scale: 2 }), // kWh/ha

  // Pesticides (optional)
  pesticides: decimal('pesticides', { precision: 10, scale: 2 }), // kg/ha

  // Additional data (flexible JSON for extra inputs)
  additionalData: jsonb('additional_data'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Child: Processing Data (ep)
export const isccProcessing = pgTable('iscc_processing', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => isccProject.id, { onDelete: 'cascade' }),

  // Energy consumption (total)
  electricityUse: decimal('electricity_use', { precision: 12, scale: 2 }), // kWh
  steamUse: decimal('steam_use', { precision: 12, scale: 2 }), // ton
  naturalGasUse: decimal('natural_gas_use', { precision: 12, scale: 2 }), // m3
  dieselUse: decimal('diesel_use', { precision: 12, scale: 2 }), // liter

  // Chemicals (for biodiesel/bioethanol)
  methanol: decimal('methanol', { precision: 10, scale: 2 }), // kg
  catalyst: decimal('catalyst', { precision: 10, scale: 2 }), // kg
  acid: decimal('acid', { precision: 10, scale: 2 }), // kg (for pretreatment)

  // Water usage
  waterConsumption: decimal('water_consumption', { precision: 12, scale: 2 }), // m3

  // Additional data (flexible JSON)
  additionalData: jsonb('additional_data'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Child: Transport Data (etd)
export const isccTransport = pgTable('iscc_transport', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => isccProject.id, { onDelete: 'cascade' }),

  // Feedstock transport
  feedstockDistance: decimal('feedstock_distance', { precision: 10, scale: 2 }), // km
  feedstockMode: transportModeEnum('feedstock_mode'),
  feedstockWeight: decimal('feedstock_weight', { precision: 12, scale: 2 }), // ton

  // Product distribution
  productDistance: decimal('product_distance', { precision: 10, scale: 2 }), // km
  productMode: transportModeEnum('product_mode'),
  productWeight: decimal('product_weight', { precision: 12, scale: 2 }), // ton

  // Additional transport steps (flexible JSON)
  additionalTransport: jsonb('additional_transport'), // array of transport steps

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Calculation Result (updated)
export const isccCalculation = pgTable('iscc_calculation', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => isccProject.id, { onDelete: 'cascade' }),

  // Input snapshot
  inputSnapshot: jsonb('input_snapshot').notNull(),

  // Intermediate results (kg CO2)
  eecKg: decimal('eec_kg', { precision: 12, scale: 2 }), // kg CO2
  epKg: decimal('ep_kg', { precision: 12, scale: 2 }),
  etdKg: decimal('etd_kg', { precision: 12, scale: 2 }),
  totalKg: decimal('total_kg', { precision: 12, scale: 2 }), // kg CO2

  // 🔥 Final results (g CO2eq/MJ) - STANDARD ISCC FORMAT
  eec: decimal('eec', { precision: 10, scale: 4 }), // g CO2eq/MJ
  ep: decimal('ep', { precision: 10, scale: 4 }),
  etd: decimal('etd', { precision: 10, scale: 4 }),
  el: decimal('el', { precision: 10, scale: 4 }),
  eccr: decimal('eccr', { precision: 10, scale: 4 }),

  totalEmissions: decimal('total_emissions', {
    precision: 10,
    scale: 4
  }).notNull(), // g CO2eq/MJ

  // GHG Savings
  fossilFuelBaseline: decimal('fossil_fuel_baseline', {
    precision: 10,
    scale: 4
  }), // g CO2eq/MJ
  ghgSavings: decimal('ghg_savings', { precision: 5, scale: 2 }), // percentage

  // Breakdown
  breakdown: jsonb('breakdown'),

  // LLM metadata
  llmModel: text('llm_model'),
  llmPrompt: text('llm_prompt'),
  llmResponse: text('llm_response'),

  // Status
  status: calculationStatusEnum('status').default('calculated').notNull(),
  notes: text('notes'),

  calculatedAt: timestamp('calculated_at').defaultNow().notNull()
});

// ==================== RELATIONS ====================

// ISCC Project Relations
export const isccProjectRelations = relations(isccProject, ({ one, many }) => ({
  // Parent
  tenant: one(tenant, {
    fields: [isccProject.tenantId],
    references: [tenant.id]
  }),

  // Children
  cultivation: one(isccCultivation, {
    fields: [isccProject.id],
    references: [isccCultivation.projectId]
  }),
  processing: one(isccProcessing, {
    fields: [isccProject.id],
    references: [isccProcessing.projectId]
  }),
  transport: one(isccTransport, {
    fields: [isccProject.id],
    references: [isccTransport.projectId]
  }),
  calculations: many(isccCalculation) // bisa multiple calculations
}));

// Cultivation Relations
export const isccCultivationRelations = relations(
  isccCultivation,
  ({ one }) => ({
    project: one(isccProject, {
      fields: [isccCultivation.projectId],
      references: [isccProject.id]
    })
  })
);

// Processing Relations
export const isccProcessingRelations = relations(isccProcessing, ({ one }) => ({
  project: one(isccProject, {
    fields: [isccProcessing.projectId],
    references: [isccProject.id]
  })
}));

// Transport Relations
export const isccTransportRelations = relations(isccTransport, ({ one }) => ({
  project: one(isccProject, {
    fields: [isccTransport.projectId],
    references: [isccProject.id]
  })
}));

// Calculation Relations
export const isccCalculationRelations = relations(
  isccCalculation,
  ({ one }) => ({
    project: one(isccProject, {
      fields: [isccCalculation.projectId],
      references: [isccProject.id]
    })
  })
);

// ==================== TYPES ====================

export type IsccProject = typeof isccProject.$inferSelect;
export type NewIsccProject = typeof isccProject.$inferInsert;

export type IsccCultivation = typeof isccCultivation.$inferSelect;
export type NewIsccCultivation = typeof isccCultivation.$inferInsert;

export type IsccProcessing = typeof isccProcessing.$inferSelect;
export type NewIsccProcessing = typeof isccProcessing.$inferInsert;

export type IsccTransport = typeof isccTransport.$inferSelect;
export type NewIsccTransport = typeof isccTransport.$inferInsert;

export type IsccCalculation = typeof isccCalculation.$inferSelect;
export type NewIsccCalculation = typeof isccCalculation.$inferInsert;
