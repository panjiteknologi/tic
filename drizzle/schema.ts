import { pgTable, text, timestamp, unique, boolean, foreignKey, uuid, varchar, numeric, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const gasType = pgEnum("gas_type", ['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3'])
export const projectStatus = pgEnum("project_status", ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
export const sector = pgEnum("sector", ['ENERGY', 'IPPU', 'AFOLU', 'WASTE', 'OTHER'])
export const tier = pgEnum("tier", ['TIER_1', 'TIER_2', 'TIER_3'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const ipccProjectCategories = pgTable("ipcc_project_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [ipccProjects.id],
			name: "ipcc_project_categories_project_id_ipcc_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [ipccEmissionCategories.id],
			name: "ipcc_project_categories_category_id_ipcc_emission_categories_id"
		}),
]);

export const defraFlightRoutes = pgTable("defra_flight_routes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	origin: varchar({ length: 100 }).notNull(),
	destination: varchar({ length: 100 }).notNull(),
	originIata: varchar("origin_iata", { length: 3 }),
	destinationIata: varchar("destination_iata", { length: 3 }),
	distanceKm: numeric("distance_km", { precision: 10, scale:  2 }).notNull(),
	flightType: varchar("flight_type", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const defraFuelTypes = pgTable("defra_fuel_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	category: varchar({ length: 50 }).notNull(),
	defaultUnit: varchar("default_unit", { length: 20 }).notNull(),
	conversionFactor: numeric("conversion_factor", { precision: 10, scale:  6 }),
	isActive: varchar("is_active", { length: 10 }).default('true').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const defraMaterialTypes = pgTable("defra_material_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	category: varchar({ length: 50 }).notNull(),
	defaultUnit: varchar("default_unit", { length: 20 }).default('tonnes').notNull(),
	isActive: varchar("is_active", { length: 10 }).default('true').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tenant = pgTable("tenant", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	domain: text(),
	logo: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("tenant_slug_unique").on(table.slug),
	unique("tenant_domain_unique").on(table.domain),
]);

export const tenantUser = pgTable("tenant_user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	userId: text("user_id").notNull(),
	role: text().default('member').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenant.id],
			name: "tenant_user_tenant_id_tenant_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "tenant_user_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const stepDuaGhgCalculation = pgTable("step_dua_ghg_calculation", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "step_dua_ghg_calculation_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	carbonProjectId: uuid("carbon_project_id").notNull(),
	keterangan: text().notNull(),
	nilaiInt: numeric("nilai_int"),
	nilaiString: text("nilai_string"),
	satuan: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.carbonProjectId],
			foreignColumns: [carbonProject.id],
			name: "step_dua_ghg_calculation_carbon_project_id_carbon_project_id_fk"
		}).onDelete("cascade"),
]);

export const tenantInvitation = pgTable("tenant_invitation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	email: text().notNull(),
	role: text().default('member').notNull(),
	invitedBy: text("invited_by").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenant.id],
			name: "tenant_invitation_tenant_id_tenant_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [user.id],
			name: "tenant_invitation_invited_by_user_id_fk"
		}).onDelete("cascade"),
	unique("tenant_invitation_token_unique").on(table.token),
]);

export const stepTigaGhgCalculationProcess = pgTable("step_tiga_ghg_calculation_process", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "step_tiga_ghg_calculation_process_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	carbonProjectId: uuid("carbon_project_id").notNull(),
	keterangan: text().notNull(),
	nilaiInt: numeric("nilai_int"),
	nilaiString: text("nilai_string"),
	satuan: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.carbonProjectId],
			foreignColumns: [carbonProject.id],
			name: "step_tiga_ghg_calculation_process_carbon_project_id_carbon_proj"
		}).onDelete("cascade"),
]);

export const stepTigaAdditional = pgTable("step_tiga_additional", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "step_tiga_additional_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	carbonProjectId: uuid("carbon_project_id").notNull(),
	keterangan: text().notNull(),
	nilaiInt: numeric("nilai_int"),
	nilaiString: text("nilai_string"),
	satuan: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.carbonProjectId],
			foreignColumns: [carbonProject.id],
			name: "step_tiga_additional_carbon_project_id_carbon_project_id_fk"
		}).onDelete("cascade"),
]);

export const stepTigaOtherCase = pgTable("step_tiga_other_case", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "step_tiga_other_case_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	carbonProjectId: uuid("carbon_project_id").notNull(),
	keterangan: text().notNull(),
	nilaiInt: numeric("nilai_int"),
	nilaiString: text("nilai_string"),
	satuan: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.carbonProjectId],
			foreignColumns: [carbonProject.id],
			name: "step_tiga_other_case_carbon_project_id_carbon_project_id_fk"
		}).onDelete("cascade"),
]);

export const stepEmpatGhgAudit = pgTable("step_empat_ghg_audit", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "step_empat_ghg_audit_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	carbonProjectId: uuid("carbon_project_id").notNull(),
	keterangan: text().notNull(),
	nilaiInt: numeric("nilai_int"),
	nilaiString: text("nilai_string"),
	satuan: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.carbonProjectId],
			foreignColumns: [carbonProject.id],
			name: "step_empat_ghg_audit_carbon_project_id_carbon_project_id_fk"
		}).onDelete("cascade"),
]);

export const stepSatuGhgVerification = pgTable("step_satu_ghg_verification", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "step_satu_ghg_verification_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	carbonProjectId: uuid("carbon_project_id").notNull(),
	keterangan: text().notNull(),
	nilaiInt: numeric("nilai_int"),
	nilaiString: text("nilai_string"),
	satuan: text(),
	source: text(),
}, (table) => [
	foreignKey({
			columns: [table.carbonProjectId],
			foreignColumns: [carbonProject.id],
			name: "step_satu_ghg_verification_carbon_project_id_carbon_project_id_"
		}).onDelete("cascade"),
]);

export const ipccEmissionCategories = pgTable("ipcc_emission_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	sector: sector().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const ipccEmissionFactors = pgTable("ipcc_emission_factors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	gasType: gasType("gas_type").notNull(),
	tier: tier().notNull(),
	value: numeric({ precision: 20, scale:  6 }).notNull(),
	unit: varchar({ length: 100 }).notNull(),
	source: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	applicableCategories: varchar("applicable_categories", { length: 1000 }),
	fuelType: varchar("fuel_type", { length: 100 }),
	activityType: varchar("activity_type", { length: 200 }),
	heatingValue: numeric("heating_value", { precision: 10, scale:  3 }),
	heatingValueUnit: varchar("heating_value_unit", { length: 50 }),
});

export const ipccActivityData = pgTable("ipcc_activity_data", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	value: numeric({ precision: 20, scale:  6 }).notNull(),
	unit: varchar({ length: 50 }).notNull(),
	source: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [ipccProjects.id],
			name: "ipcc_activity_data_project_id_ipcc_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [ipccEmissionCategories.id],
			name: "ipcc_activity_data_category_id_ipcc_emission_categories_id_fk"
		}),
]);

export const ipccEmissionCalculations = pgTable("ipcc_emission_calculations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	activityDataId: uuid("activity_data_id").notNull(),
	emissionFactorId: uuid("emission_factor_id"),
	tier: tier().notNull(),
	gasType: gasType("gas_type").notNull(),
	emissionValue: numeric("emission_value", { precision: 20, scale:  6 }).notNull(),
	emissionUnit: varchar("emission_unit", { length: 50 }).default('kg').notNull(),
	co2Equivalent: numeric("co2_equivalent", { precision: 20, scale:  6 }).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [ipccProjects.id],
			name: "ipcc_emission_calculations_project_id_ipcc_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.activityDataId],
			foreignColumns: [ipccActivityData.id],
			name: "ipcc_emission_calculations_activity_data_id_ipcc_activity_data_"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.emissionFactorId],
			foreignColumns: [ipccEmissionFactors.id],
			name: "ipcc_emission_calculations_emission_factor_id_ipcc_emission_fac"
		}),
]);

export const standard = pgTable("standard", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("standard_code_unique").on(table.code),
]);

export const certification = pgTable("certification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	standardId: uuid("standard_id").notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.standardId],
			foreignColumns: [standard.id],
			name: "certification_standard_id_standard_id_fk"
		}).onDelete("cascade"),
]);

export const ipccGwpValues = pgTable("ipcc_gwp_values", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	gasType: gasType("gas_type").notNull(),
	value: numeric({ precision: 10, scale:  2 }).notNull(),
	assessmentReport: varchar("assessment_report", { length: 50 }).default('AR5'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("ipcc_gwp_values_gas_type_unique").on(table.gasType),
]);

export const ipccProjects = pgTable("ipcc_projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	year: integer().notNull(),
	status: projectStatus().default('DRAFT').notNull(),
	organizationName: varchar("organization_name", { length: 255 }),
	location: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
});

export const ipccProjectSummaries = pgTable("ipcc_project_summaries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	sector: sector().notNull(),
	totalCo2: numeric("total_co2", { precision: 20, scale:  6 }).default('0'),
	totalCh4: numeric("total_ch4", { precision: 20, scale:  6 }).default('0'),
	totalN2O: numeric("total_n2o", { precision: 20, scale:  6 }).default('0'),
	totalOtherGases: numeric("total_other_gases", { precision: 20, scale:  6 }).default('0'),
	totalCo2Equivalent: numeric("total_co2_equivalent", { precision: 20, scale:  6 }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [ipccProjects.id],
			name: "ipcc_project_summaries_project_id_ipcc_projects_id_fk"
		}).onDelete("cascade"),
]);

export const defraEmissionFactors = pgTable("defra_emission_factors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	year: varchar({ length: 4 }).notNull(),
	level1Category: text("level1_category").notNull(),
	level2Category: text("level2_category").notNull(),
	level3Category: text("level3_category"),
	level4Category: text("level4_category"),
	activityName: text("activity_name").notNull(),
	unit: varchar({ length: 50 }).notNull(),
	unitType: varchar("unit_type", { length: 50 }).notNull(),
	co2Factor: numeric("co2_factor", { precision: 20, scale:  10 }).notNull(),
	ch4Factor: numeric("ch4_factor", { precision: 20, scale:  10 }).notNull(),
	n2OFactor: numeric("n2o_factor", { precision: 20, scale:  10 }).notNull(),
	co2EFactor: numeric("co2e_factor", { precision: 20, scale:  10 }).notNull(),
	scope: varchar({ length: 20 }),
	source: text().default('DEFRA'),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const defraElectricityRegions = pgTable("defra_electricity_regions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: varchar({ length: 10 }).notNull(),
	isActive: varchar("is_active", { length: 10 }).default('true').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const defraCarbonCalculations = pgTable("defra_carbon_calculations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	defraProjectId: uuid("defra_project_id").notNull(),
	defraEmissionFactorId: uuid("defra_emission_factor_id").notNull(),
	activityDate: timestamp("activity_date", { mode: 'string' }).notNull(),
	quantity: numeric({ precision: 20, scale:  6 }).notNull(),
	unit: varchar({ length: 50 }).notNull(),
	co2Emissions: numeric("co2_emissions", { precision: 20, scale:  6 }).notNull(),
	ch4Emissions: numeric("ch4_emissions", { precision: 20, scale:  6 }).notNull(),
	n2OEmissions: numeric("n2o_emissions", { precision: 20, scale:  6 }).notNull(),
	totalCo2E: numeric("total_co2e", { precision: 20, scale:  6 }).notNull(),
	description: text(),
	location: text(),
	evidence: text(),
	category: varchar({ length: 100 }).notNull(),
	scope: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.defraProjectId],
			foreignColumns: [defraProjects.id],
			name: "defra_carbon_calculations_defra_project_id_defra_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.defraEmissionFactorId],
			foreignColumns: [defraEmissionFactors.id],
			name: "defra_carbon_calculations_defra_emission_factor_id_defra_emissi"
		}),
]);

export const carbonProject = pgTable("carbon_project", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	tenantId: uuid("tenant_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenant.id],
			name: "carbon_project_tenant_id_tenant_id_fk"
		}).onDelete("cascade"),
]);

export const defraVehicleTypes = pgTable("defra_vehicle_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	fuelType: varchar("fuel_type", { length: 50 }).notNull(),
	vehicleSize: varchar("vehicle_size", { length: 50 }),
	engineSize: varchar("engine_size", { length: 50 }),
	category: varchar({ length: 50 }).notNull(),
	isActive: varchar("is_active", { length: 10 }).default('true').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const defraWasteTypes = pgTable("defra_waste_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	disposalMethod: varchar("disposal_method", { length: 50 }).notNull(),
	defaultUnit: varchar("default_unit", { length: 20 }).default('tonnes').notNull(),
	isActive: varchar("is_active", { length: 10 }).default('true').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const defraProjects = pgTable("defra_projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	organizationName: varchar("organization_name", { length: 255 }),
	reportingPeriodStart: timestamp("reporting_period_start", { mode: 'string' }).notNull(),
	reportingPeriodEnd: timestamp("reporting_period_end", { mode: 'string' }).notNull(),
	defraYear: varchar("defra_year", { length: 4 }).notNull(),
	status: varchar({ length: 50 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
