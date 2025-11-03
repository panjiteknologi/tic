import { relations } from "drizzle-orm/relations";
import { user, account, session, ipccProjects, ipccProjectCategories, ipccEmissionCategories, tenant, tenantUser, carbonProject, stepDuaGhgCalculation, tenantInvitation, stepTigaGhgCalculationProcess, stepTigaAdditional, stepTigaOtherCase, stepEmpatGhgAudit, stepSatuGhgVerification, ipccActivityData, ipccEmissionCalculations, ipccEmissionFactors, standard, certification, ipccProjectSummaries, defraProjects, defraCarbonCalculations, defraEmissionFactors } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	tenantUsers: many(tenantUser),
	tenantInvitations: many(tenantInvitation),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const ipccProjectCategoriesRelations = relations(ipccProjectCategories, ({one}) => ({
	ipccProject: one(ipccProjects, {
		fields: [ipccProjectCategories.projectId],
		references: [ipccProjects.id]
	}),
	ipccEmissionCategory: one(ipccEmissionCategories, {
		fields: [ipccProjectCategories.categoryId],
		references: [ipccEmissionCategories.id]
	}),
}));

export const ipccProjectsRelations = relations(ipccProjects, ({many}) => ({
	ipccProjectCategories: many(ipccProjectCategories),
	ipccActivityData: many(ipccActivityData),
	ipccEmissionCalculations: many(ipccEmissionCalculations),
	ipccProjectSummaries: many(ipccProjectSummaries),
}));

export const ipccEmissionCategoriesRelations = relations(ipccEmissionCategories, ({many}) => ({
	ipccProjectCategories: many(ipccProjectCategories),
	ipccActivityData: many(ipccActivityData),
}));

export const tenantUserRelations = relations(tenantUser, ({one}) => ({
	tenant: one(tenant, {
		fields: [tenantUser.tenantId],
		references: [tenant.id]
	}),
	user: one(user, {
		fields: [tenantUser.userId],
		references: [user.id]
	}),
}));

export const tenantRelations = relations(tenant, ({many}) => ({
	tenantUsers: many(tenantUser),
	tenantInvitations: many(tenantInvitation),
	carbonProjects: many(carbonProject),
}));

export const stepDuaGhgCalculationRelations = relations(stepDuaGhgCalculation, ({one}) => ({
	carbonProject: one(carbonProject, {
		fields: [stepDuaGhgCalculation.carbonProjectId],
		references: [carbonProject.id]
	}),
}));

export const carbonProjectRelations = relations(carbonProject, ({one, many}) => ({
	stepDuaGhgCalculations: many(stepDuaGhgCalculation),
	stepTigaGhgCalculationProcesses: many(stepTigaGhgCalculationProcess),
	stepTigaAdditionals: many(stepTigaAdditional),
	stepTigaOtherCases: many(stepTigaOtherCase),
	stepEmpatGhgAudits: many(stepEmpatGhgAudit),
	stepSatuGhgVerifications: many(stepSatuGhgVerification),
	tenant: one(tenant, {
		fields: [carbonProject.tenantId],
		references: [tenant.id]
	}),
}));

export const tenantInvitationRelations = relations(tenantInvitation, ({one}) => ({
	tenant: one(tenant, {
		fields: [tenantInvitation.tenantId],
		references: [tenant.id]
	}),
	user: one(user, {
		fields: [tenantInvitation.invitedBy],
		references: [user.id]
	}),
}));

export const stepTigaGhgCalculationProcessRelations = relations(stepTigaGhgCalculationProcess, ({one}) => ({
	carbonProject: one(carbonProject, {
		fields: [stepTigaGhgCalculationProcess.carbonProjectId],
		references: [carbonProject.id]
	}),
}));

export const stepTigaAdditionalRelations = relations(stepTigaAdditional, ({one}) => ({
	carbonProject: one(carbonProject, {
		fields: [stepTigaAdditional.carbonProjectId],
		references: [carbonProject.id]
	}),
}));

export const stepTigaOtherCaseRelations = relations(stepTigaOtherCase, ({one}) => ({
	carbonProject: one(carbonProject, {
		fields: [stepTigaOtherCase.carbonProjectId],
		references: [carbonProject.id]
	}),
}));

export const stepEmpatGhgAuditRelations = relations(stepEmpatGhgAudit, ({one}) => ({
	carbonProject: one(carbonProject, {
		fields: [stepEmpatGhgAudit.carbonProjectId],
		references: [carbonProject.id]
	}),
}));

export const stepSatuGhgVerificationRelations = relations(stepSatuGhgVerification, ({one}) => ({
	carbonProject: one(carbonProject, {
		fields: [stepSatuGhgVerification.carbonProjectId],
		references: [carbonProject.id]
	}),
}));

export const ipccActivityDataRelations = relations(ipccActivityData, ({one, many}) => ({
	ipccProject: one(ipccProjects, {
		fields: [ipccActivityData.projectId],
		references: [ipccProjects.id]
	}),
	ipccEmissionCategory: one(ipccEmissionCategories, {
		fields: [ipccActivityData.categoryId],
		references: [ipccEmissionCategories.id]
	}),
	ipccEmissionCalculations: many(ipccEmissionCalculations),
}));

export const ipccEmissionCalculationsRelations = relations(ipccEmissionCalculations, ({one}) => ({
	ipccProject: one(ipccProjects, {
		fields: [ipccEmissionCalculations.projectId],
		references: [ipccProjects.id]
	}),
	ipccActivityDatum: one(ipccActivityData, {
		fields: [ipccEmissionCalculations.activityDataId],
		references: [ipccActivityData.id]
	}),
	ipccEmissionFactor: one(ipccEmissionFactors, {
		fields: [ipccEmissionCalculations.emissionFactorId],
		references: [ipccEmissionFactors.id]
	}),
}));

export const ipccEmissionFactorsRelations = relations(ipccEmissionFactors, ({many}) => ({
	ipccEmissionCalculations: many(ipccEmissionCalculations),
}));

export const certificationRelations = relations(certification, ({one}) => ({
	standard: one(standard, {
		fields: [certification.standardId],
		references: [standard.id]
	}),
}));

export const standardRelations = relations(standard, ({many}) => ({
	certifications: many(certification),
}));

export const ipccProjectSummariesRelations = relations(ipccProjectSummaries, ({one}) => ({
	ipccProject: one(ipccProjects, {
		fields: [ipccProjectSummaries.projectId],
		references: [ipccProjects.id]
	}),
}));

export const defraCarbonCalculationsRelations = relations(defraCarbonCalculations, ({one}) => ({
	defraProject: one(defraProjects, {
		fields: [defraCarbonCalculations.defraProjectId],
		references: [defraProjects.id]
	}),
	defraEmissionFactor: one(defraEmissionFactors, {
		fields: [defraCarbonCalculations.defraEmissionFactorId],
		references: [defraEmissionFactors.id]
	}),
}));

export const defraProjectsRelations = relations(defraProjects, ({many}) => ({
	defraCarbonCalculations: many(defraCarbonCalculations),
}));

export const defraEmissionFactorsRelations = relations(defraEmissionFactors, ({many}) => ({
	defraCarbonCalculations: many(defraCarbonCalculations),
}));