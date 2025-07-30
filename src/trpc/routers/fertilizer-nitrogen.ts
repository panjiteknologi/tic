import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { fertilizerNitrogen } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const fertilizerNitrogenSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  ammoniumNitrate: z.string().optional(),
  urea: z.string().optional(),
  appliedManure: z.string().optional(),
  nContentCropResidue: z.string().optional(),
  totalNSyntheticFertilizer: z.string().optional(),
  emissionFactorAmmoniumNitrate: z.string().optional(),
  emissionFactorUrea: z.string().optional(),
  emissionFactorDirectN2O: z.string().optional(),
  fractionNVolatilizedSynthetic: z.string().optional(),
  fractionNVolatilizedOrganic: z.string().optional(),
  emissionFactorAtmosphericDeposition: z.string().optional(),
  fractionNLostRunoff: z.string().optional(),
  emissionFactorLeachingRunoff: z.string().optional(),
  directN2OEmissions: z.string().optional(),
  indirectN2OEmissionsNH3NOx: z.string().optional(),
  indirectN2OEmissionsNLeachingRunoff: z.string().optional(),
  co2eqEmissionsNitrogenFertilizersHaYr: z.string().optional(),
  co2eqEmissionsNitrogenFertilizersFieldN20HaYr: z.string().optional(),
  co2eqEmissionsNitrogenFertilizersFieldN20TFFB: z.string().optional(),
});

const updateFertilizerNitrogenSchema = z.object({
  id: z.string().uuid(),
  ammoniumNitrate: z.string().optional(),
  urea: z.string().optional(),
  appliedManure: z.string().optional(),
  nContentCropResidue: z.string().optional(),
  totalNSyntheticFertilizer: z.string().optional(),
  emissionFactorAmmoniumNitrate: z.string().optional(),
  emissionFactorUrea: z.string().optional(),
  emissionFactorDirectN2O: z.string().optional(),
  fractionNVolatilizedSynthetic: z.string().optional(),
  fractionNVolatilizedOrganic: z.string().optional(),
  emissionFactorAtmosphericDeposition: z.string().optional(),
  fractionNLostRunoff: z.string().optional(),
  emissionFactorLeachingRunoff: z.string().optional(),
  directN2OEmissions: z.string().optional(),
  indirectN2OEmissionsNH3NOx: z.string().optional(),
  indirectN2OEmissionsNLeachingRunoff: z.string().optional(),
  co2eqEmissionsNitrogenFertilizersHaYr: z.string().optional(),
  co2eqEmissionsNitrogenFertilizersFieldN20HaYr: z.string().optional(),
  co2eqEmissionsNitrogenFertilizersFieldN20TFFB: z.string().optional(),
});

export const fertilizerNitrogenRouter = createTRPCRouter({
  // Add new fertilizer nitrogen data
  add: protectedProcedure
    .input(fertilizerNitrogenSchema)
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

        // Create fertilizer nitrogen data
        const [newFertilizerNitrogen] = await db
          .insert(fertilizerNitrogen)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            ammoniumNitrate: input.ammoniumNitrate,
            urea: input.urea,
            appliedManure: input.appliedManure,
            nContentCropResidue: input.nContentCropResidue,
            totalNSyntheticFertilizer: input.totalNSyntheticFertilizer,
            emissionFactorAmmoniumNitrate: input.emissionFactorAmmoniumNitrate,
            emissionFactorUrea: input.emissionFactorUrea,
            emissionFactorDirectN2O: input.emissionFactorDirectN2O,
            fractionNVolatilizedSynthetic: input.fractionNVolatilizedSynthetic,
            fractionNVolatilizedOrganic: input.fractionNVolatilizedOrganic,
            emissionFactorAtmosphericDeposition: input.emissionFactorAtmosphericDeposition,
            fractionNLostRunoff: input.fractionNLostRunoff,
            emissionFactorLeachingRunoff: input.emissionFactorLeachingRunoff,
            directN2OEmissions: input.directN2OEmissions,
            indirectN2OEmissionsNH3NOx: input.indirectN2OEmissionsNH3NOx,
            indirectN2OEmissionsNLeachingRunoff: input.indirectN2OEmissionsNLeachingRunoff,
            co2eqEmissionsNitrogenFertilizersHaYr: input.co2eqEmissionsNitrogenFertilizersHaYr,
            co2eqEmissionsNitrogenFertilizersFieldN20HaYr: input.co2eqEmissionsNitrogenFertilizersFieldN20HaYr,
            co2eqEmissionsNitrogenFertilizersFieldN20TFFB: input.co2eqEmissionsNitrogenFertilizersFieldN20TFFB,
          })
          .returning();

        return {
          success: true,
          fertilizerNitrogen: newFertilizerNitrogen,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create fertilizer nitrogen data",
        });
      }
    }),

  // Update fertilizer nitrogen data
  update: protectedProcedure
    .input(updateFertilizerNitrogenSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the fertilizer nitrogen to check tenant ownership
        const existingFertilizerNitrogen = await db
          .select()
          .from(fertilizerNitrogen)
          .where(eq(fertilizerNitrogen.id, input.id))
          .limit(1);

        if (existingFertilizerNitrogen.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Fertilizer nitrogen data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingFertilizerNitrogen[0].tenantId),
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

        // Update fertilizer nitrogen data
        const [updatedFertilizerNitrogen] = await db
          .update(fertilizerNitrogen)
          .set({
            ammoniumNitrate: input.ammoniumNitrate,
            urea: input.urea,
            appliedManure: input.appliedManure,
            nContentCropResidue: input.nContentCropResidue,
            totalNSyntheticFertilizer: input.totalNSyntheticFertilizer,
            emissionFactorAmmoniumNitrate: input.emissionFactorAmmoniumNitrate,
            emissionFactorUrea: input.emissionFactorUrea,
            emissionFactorDirectN2O: input.emissionFactorDirectN2O,
            fractionNVolatilizedSynthetic: input.fractionNVolatilizedSynthetic,
            fractionNVolatilizedOrganic: input.fractionNVolatilizedOrganic,
            emissionFactorAtmosphericDeposition: input.emissionFactorAtmosphericDeposition,
            fractionNLostRunoff: input.fractionNLostRunoff,
            emissionFactorLeachingRunoff: input.emissionFactorLeachingRunoff,
            directN2OEmissions: input.directN2OEmissions,
            indirectN2OEmissionsNH3NOx: input.indirectN2OEmissionsNH3NOx,
            indirectN2OEmissionsNLeachingRunoff: input.indirectN2OEmissionsNLeachingRunoff,
            co2eqEmissionsNitrogenFertilizersHaYr: input.co2eqEmissionsNitrogenFertilizersHaYr,
            co2eqEmissionsNitrogenFertilizersFieldN20HaYr: input.co2eqEmissionsNitrogenFertilizersFieldN20HaYr,
            co2eqEmissionsNitrogenFertilizersFieldN20TFFB: input.co2eqEmissionsNitrogenFertilizersFieldN20TFFB,
            updatedAt: new Date(),
          })
          .where(eq(fertilizerNitrogen.id, input.id))
          .returning();

        return {
          success: true,
          fertilizerNitrogen: updatedFertilizerNitrogen,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update fertilizer nitrogen data",
        });
      }
    }),

  // Delete fertilizer nitrogen data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the fertilizer nitrogen to check tenant ownership
        const existingFertilizerNitrogen = await db
          .select()
          .from(fertilizerNitrogen)
          .where(eq(fertilizerNitrogen.id, input.id))
          .limit(1);

        if (existingFertilizerNitrogen.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Fertilizer nitrogen data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingFertilizerNitrogen[0].tenantId),
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

        // Delete fertilizer nitrogen data
        await db.delete(fertilizerNitrogen).where(eq(fertilizerNitrogen.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete fertilizer nitrogen data",
        });
      }
    }),

  // Get fertilizer nitrogen data by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectFertilizerNitrogen = await db
        .select()
        .from(fertilizerNitrogen)
        .where(eq(fertilizerNitrogen.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectFertilizerNitrogen.length === 0) {
        return { fertilizerNitrogen: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectFertilizerNitrogen[0].tenantId),
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

      const carbonProjectFertilizerNitrogen = await db
        .select()
        .from(fertilizerNitrogen)
        .where(eq(fertilizerNitrogen.carbonProjectId, input.carbonProjectId));

      return { fertilizerNitrogen: carbonProjectFertilizerNitrogen };
    }),

  // Get fertilizer nitrogen data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const fertilizerNitrogenData = await db
        .select()
        .from(fertilizerNitrogen)
        .where(eq(fertilizerNitrogen.id, input.id))
        .limit(1);

      if (fertilizerNitrogenData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fertilizer nitrogen data not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, fertilizerNitrogenData[0].tenantId),
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

      return { fertilizerNitrogen: fertilizerNitrogenData[0] };
    }),

  // Get fertilizer nitrogen data by tenant
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

      const tenantFertilizerNitrogen = await db
        .select()
        .from(fertilizerNitrogen)
        .where(eq(fertilizerNitrogen.tenantId, input.tenantId));

      return { fertilizerNitrogen: tenantFertilizerNitrogen };
    }),
});