import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
} from "drizzle-orm/pg-core";
import { tenant } from "./tenant-schema";

// Carbon Project
export const carbonProject = pgTable("carbon_project", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Products
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  cornWet: decimal("corn_wet", { precision: 10, scale: 2 }),
  moistureContent: decimal("moisture_content", { precision: 10, scale: 2 }),
  cornDry: decimal("corn_dry", { precision: 10, scale: 2 }),
  cultivationArea: decimal("cultivation_area", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Raws
export const raws = pgTable("raws", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  cornSeedsAmount: decimal("corn_seeds_amount", { precision: 10, scale: 2 }),
  emissionFactorCornSeeds: decimal("emission_factor_corn_seeds", { precision: 10, scale: 2 }),
  co2eqEmissionsRawMaterialInputHaYr: decimal("co2eq_emissions_raw_material_input_ha_yr", { precision: 10, scale: 2 }),
  co2eqEmissionsRawMaterialInputTFFB: decimal("co2eq_emissions_raw_material_input_tffb", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Fertilizer - Nitrogen
export const fertilizerNitrogen = pgTable("fertilizer_nitrogen", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  ammoniumNitrate: decimal("ammonium_nitrate", { precision: 10, scale: 2 }),
  urea: decimal("urea", { precision: 10, scale: 2 }),
  appliedManure: decimal("applied_manure", { precision: 10, scale: 2 }),
  nContentCropResidue: decimal("n_content_crop_residue", { precision: 10, scale: 2 }),
  totalNSyntheticFertilizer: decimal("total_n_synthetic_fertilizer", { precision: 10, scale: 2 }),
  emissionFactorAmmoniumNitrate: decimal("emission_factor_ammonium_nitrate", { precision: 10, scale: 2 }),
  emissionFactorUrea: decimal("emission_factor_urea", { precision: 10, scale: 2 }),
  emissionFactorDirectN2O: decimal("emission_factor_direct_n2o", { precision: 10, scale: 2 }),
  fractionNVolatilizedSynthetic: decimal("fraction_n_volatilized_synthetic", { precision: 10, scale: 2 }),
  fractionNVolatilizedOrganic: decimal("fraction_n_volatilized_organic", { precision: 10, scale: 2 }),
  emissionFactorAtmosphericDeposition: decimal("emission_factor_atmospheric_deposition", { precision: 10, scale: 2 }),
  fractionNLostRunoff: decimal("fraction_n_lost_runoff", { precision: 10, scale: 2 }),
  emissionFactorLeachingRunoff: decimal("emission_factor_leaching_runoff", { precision: 10, scale: 2 }),
  directN2OEmissions: decimal("direct_n2o_emissions", { precision: 10, scale: 2 }),
  indirectN2OEmissionsNH3NOx: decimal("indirect_n2o_emissions_nh3_nox", { precision: 10, scale: 2 }),
  indirectN2OEmissionsNLeachingRunoff: decimal("indirect_n2o_emissions_n_leaching_runoff", { precision: 10, scale: 2 }),
  co2eqEmissionsNitrogenFertilizersHaYr: decimal("co2eq_emissions_nitrogen_fertilizers_ha_yr", { precision: 10, scale: 2 }),
  co2eqEmissionsNitrogenFertilizersFieldN20HaYr: decimal("co2eq_emissions_nitrogen_fertilizers_field_n20_ha_yr", { precision: 10, scale: 2 }),
  co2eqEmissionsNitrogenFertilizersFieldN20TFFB: decimal("co2eq_emissions_nitrogen_fertilizers_field_n20_tffb", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Herbicides
export const herbicides = pgTable("herbicides", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  acetochlor: decimal("acetochlor", { precision: 10, scale: 2 }),
  emissionFactorPesticides: decimal("emission_factor_pesticides", { precision: 10, scale: 2 }),
  co2eqEmissionsHerbicidesPesticidesHaYr: decimal("co2eq_emissions_herbicides_pesticides_ha_yr", { precision: 10, scale: 2 }),
  co2eqEmissionsHerbicidesPesticidesTFFB: decimal("co2eq_emissions_herbicides_pesticides_tffb", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Energy - Electricity
export const energyElectricity = pgTable("energy_electricity", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  electricityConsumptionSoilPrep: decimal("electricity_consumption_soil_prep", { precision: 10, scale: 2 }),
  emissionFactorElectricity: decimal("emission_factor_electricity", { precision: 10, scale: 2 }),
  co2eEmissionsElectricityYr: decimal("co2e_emissions_electricity_yr", { precision: 10, scale: 2 }),
  co2eEmissionsElectricityTFFB: decimal("co2e_emissions_electricity_tffb", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Energy - Diesel
export const energyDiesel = pgTable("energy_diesel", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  dieselConsumed: decimal("diesel_consumed", { precision: 10, scale: 2 }),
  emissionFactorDiesel: decimal("emission_factor_diesel", { precision: 10, scale: 2 }),
  co2eEmissionsDieselYr: decimal("co2e_emissions_diesel_yr", { precision: 10, scale: 2 }),
  co2eEmissionsDieselTFFB: decimal("co2e_emissions_diesel_tffb", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Cultivation
export const cultivation = pgTable("cultivation", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  ghgEmissionsRawMaterialInput: decimal("ghg_emissions_raw_material_input", { precision: 10, scale: 2 }),
  ghgEmissionsFertilizers: decimal("ghg_emissions_fertilizers", { precision: 10, scale: 2 }),
  ghgEmissionsHerbicidesPesticides: decimal("ghg_emissions_herbicides_pesticides", { precision: 10, scale: 2 }),
  ghgEmissionsEnergy: decimal("ghg_emissions_energy", { precision: 10, scale: 2 }),
  totalEmissionsCorn: decimal("total_emissions_corn", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Actual Carbon
export const actualCarbon = pgTable("actual_carbon", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  actualLandUse: text("actual_land_use"),
  climateRegionActual: text("climate_region_actual"),
  soilTypeActual: text("soil_type_actual"),
  currentSoilManagementActual: text("current_soil_management_actual"),
  currentInputToSoilActual: text("current_input_to_soil_actual"),
  socstActual: decimal("socst_actual", { precision: 10, scale: 2 }),
  fluActual: decimal("flu_actual", { precision: 10, scale: 2 }),
  fmgActual: decimal("fmg_actual", { precision: 10, scale: 2 }),
  fiActual: decimal("fi_actual", { precision: 10, scale: 2 }),
  cvegActual: decimal("cveg_actual", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Reference Carbon
export const referenceCarbon = pgTable("reference_carbon", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  carbonProjectId: uuid("carbon_project_id")
    .notNull()
    .references(() => carbonProject.id, { onDelete: "cascade" }),
  referenceLandUse: text("reference_land_use"),
  climateRegionReference: text("climate_region_reference"),
  soilTypeReference: text("soil_type_reference"),
  currentSoilManagementReference: text("current_soil_management_reference"),
  currentInputToSoilReference: text("current_input_to_soil_reference"),
  socstReference: decimal("socst_reference", { precision: 10, scale: 2 }),
  fluReference: decimal("flu_reference", { precision: 10, scale: 2 }),
  fmgReference: decimal("fmg_reference", { precision: 10, scale: 2 }),
  fiReference: decimal("fi_reference", { precision: 10, scale: 2 }),
  cvegReference: decimal("cveg_reference", { precision: 10, scale: 2 }),
  soilOrganicCarbonActual: decimal("soil_organic_carbon_actual", { precision: 10, scale: 2 }),
  soilOrganicCarbonReference: decimal("soil_organic_carbon_reference", { precision: 10, scale: 2 }),
  accumulatedSoilCarbon: decimal("accumulated_soil_carbon", { precision: 10, scale: 2 }),
  lucCarbonEmissionsPerKgCorn: decimal("luc_carbon_emissions_per_kg_corn", { precision: 10, scale: 2 }),
  totalLUCCO2EmissionsHaYr: decimal("total_luc_co2_emissions_ha_yr", { precision: 10, scale: 2 }),
  totalLUCCO2EmissionsTDryCorn: decimal("total_luc_co2_emissions_t_dry_corn", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});