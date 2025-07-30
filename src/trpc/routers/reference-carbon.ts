import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { referenceCarbon } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const referenceCarbonSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  referenceLandUse: z.string().optional(),
  climateRegionReference: z.string().optional(),
  soilTypeReference: z.string().optional(),
  currentSoilManagementReference: z.string().optional(),
  currentInputToSoilReference: z.string().optional(),
  socstReference: z.string().optional(),
  fluReference: z.string().optional(),
  fmgReference: z.string().optional(),
  fiReference: z.string().optional(),
  cvegReference: z.string().optional(),
  soilOrganicCarbonActual: z.string().optional(),
  soilOrganicCarbonReference: z.string().optional(),
  accumulatedSoilCarbon: z.string().optional(),
  lucCarbonEmissionsPerKgCorn: z.string().optional(),
  totalLUCCO2EmissionsHaYr: z.string().optional(),
  totalLUCCO2EmissionsTDryCorn: z.string().optional(),
});

const updateReferenceCarbonSchema = z.object({
  id: z.string().uuid(),
  referenceLandUse: z.string().optional(),
  climateRegionReference: z.string().optional(),
  soilTypeReference: z.string().optional(),
  currentSoilManagementReference: z.string().optional(),
  currentInputToSoilReference: z.string().optional(),
  socstReference: z.string().optional(),
  fluReference: z.string().optional(),
  fmgReference: z.string().optional(),
  fiReference: z.string().optional(),
  cvegReference: z.string().optional(),
  soilOrganicCarbonActual: z.string().optional(),
  soilOrganicCarbonReference: z.string().optional(),
  accumulatedSoilCarbon: z.string().optional(),
  lucCarbonEmissionsPerKgCorn: z.string().optional(),
  totalLUCCO2EmissionsHaYr: z.string().optional(),
  totalLUCCO2EmissionsTDryCorn: z.string().optional(),
});

export const referenceCarbonRouter = createTRPCRouter({
  // Add new reference carbon data
  add: protectedProcedure
    .input(referenceCarbonSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, input.tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to this tenant",
          });
        }

        // Create reference carbon data
        const [newReferenceCarbon] = await db
          .insert(referenceCarbon)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            referenceLandUse: input.referenceLandUse,
            climateRegionReference: input.climateRegionReference,
            soilTypeReference: input.soilTypeReference,
            currentSoilManagementReference: input.currentSoilManagementReference,
            currentInputToSoilReference: input.currentInputToSoilReference,
            socstReference: input.socstReference,
            fluReference: input.fluReference,
            fmgReference: input.fmgReference,
            fiReference: input.fiReference,
            cvegReference: input.cvegReference,
            soilOrganicCarbonActual: input.soilOrganicCarbonActual,
            soilOrganicCarbonReference: input.soilOrganicCarbonReference,
            accumulatedSoilCarbon: input.accumulatedSoilCarbon,
            lucCarbonEmissionsPerKgCorn: input.lucCarbonEmissionsPerKgCorn,
            totalLUCCO2EmissionsHaYr: input.totalLUCCO2EmissionsHaYr,
            totalLUCCO2EmissionsTDryCorn: input.totalLUCCO2EmissionsTDryCorn,
          })
          .returning();

        return {
          success: true,
          referenceCarbon: newReferenceCarbon,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reference carbon data",
        });
      }
    }),

  // Update reference carbon data
  update: protectedProcedure
    .input(updateReferenceCarbonSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the reference carbon to check tenant ownership
        const existingReferenceCarbon = await db
          .select()
          .from(referenceCarbon)
          .where(eq(referenceCarbon.id, input.id))
          .limit(1);

        if (existingReferenceCarbon.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reference carbon data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingReferenceCarbon[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to this tenant",
          });
        }

        // Update reference carbon data
        const [updatedReferenceCarbon] = await db
          .update(referenceCarbon)
          .set({
            referenceLandUse: input.referenceLandUse,
            climateRegionReference: input.climateRegionReference,
            soilTypeReference: input.soilTypeReference,
            currentSoilManagementReference: input.currentSoilManagementReference,
            currentInputToSoilReference: input.currentInputToSoilReference,
            socstReference: input.socstReference,
            fluReference: input.fluReference,
            fmgReference: input.fmgReference,
            fiReference: input.fiReference,
            cvegReference: input.cvegReference,
            soilOrganicCarbonActual: input.soilOrganicCarbonActual,
            soilOrganicCarbonReference: input.soilOrganicCarbonReference,
            accumulatedSoilCarbon: input.accumulatedSoilCarbon,
            lucCarbonEmissionsPerKgCorn: input.lucCarbonEmissionsPerKgCorn,
            totalLUCCO2EmissionsHaYr: input.totalLUCCO2EmissionsHaYr,
            totalLUCCO2EmissionsTDryCorn: input.totalLUCCO2EmissionsTDryCorn,
            updatedAt: new Date(),
          })
          .where(eq(referenceCarbon.id, input.id))
          .returning();

        return {
          success: true,
          referenceCarbon: updatedReferenceCarbon,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update reference carbon data",
        });
      }
    }),

  // Delete reference carbon data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the reference carbon to check tenant ownership
        const existingReferenceCarbon = await db
          .select()
          .from(referenceCarbon)
          .where(eq(referenceCarbon.id, input.id))
          .limit(1);

        if (existingReferenceCarbon.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reference carbon data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingReferenceCarbon[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to this tenant",
          });
        }

        // Delete reference carbon data
        await db.delete(referenceCarbon).where(eq(referenceCarbon.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete reference carbon data",
        });
      }
    }),

  // Get reference carbon data by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectReferenceCarbon = await db
        .select()
        .from(referenceCarbon)
        .where(eq(referenceCarbon.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectReferenceCarbon.length === 0) {
        return { referenceCarbon: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectReferenceCarbon[0].tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (userTenant.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied to this tenant",
        });
      }

      const carbonProjectReferenceCarbon = await db
        .select()
        .from(referenceCarbon)
        .where(eq(referenceCarbon.carbonProjectId, input.carbonProjectId));

      return { referenceCarbon: carbonProjectReferenceCarbon };
    }),

  // Get reference carbon data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const referenceCarbonData = await db
        .select()
        .from(referenceCarbon)
        .where(eq(referenceCarbon.id, input.id))
        .limit(1);

      if (referenceCarbonData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reference carbon data not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, referenceCarbonData[0].tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (userTenant.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied to this tenant",
        });
      }

      return { referenceCarbon: referenceCarbonData[0] };
    }),

  // Get reference carbon data by tenant
  getByTenantId: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, input.tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (userTenant.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied to this tenant",
        });
      }

      const tenantReferenceCarbon = await db
        .select()
        .from(referenceCarbon)
        .where(eq(referenceCarbon.tenantId, input.tenantId));

      return { referenceCarbon: tenantReferenceCarbon };
    }),
});