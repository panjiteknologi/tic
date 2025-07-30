import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { cultivation } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const cultivationSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  ghgEmissionsRawMaterialInput: z.string().optional(),
  ghgEmissionsFertilizers: z.string().optional(),
  ghgEmissionsHerbicidesPesticides: z.string().optional(),
  ghgEmissionsEnergy: z.string().optional(),
  totalEmissionsCorn: z.string().optional(),
});

const updateCultivationSchema = z.object({
  id: z.string().uuid(),
  ghgEmissionsRawMaterialInput: z.string().optional(),
  ghgEmissionsFertilizers: z.string().optional(),
  ghgEmissionsHerbicidesPesticides: z.string().optional(),
  ghgEmissionsEnergy: z.string().optional(),
  totalEmissionsCorn: z.string().optional(),
});

export const cultivationRouter = createTRPCRouter({
  // Add new cultivation data
  add: protectedProcedure
    .input(cultivationSchema)
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

        // Create cultivation data
        const [newCultivation] = await db
          .insert(cultivation)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            ghgEmissionsRawMaterialInput: input.ghgEmissionsRawMaterialInput,
            ghgEmissionsFertilizers: input.ghgEmissionsFertilizers,
            ghgEmissionsHerbicidesPesticides: input.ghgEmissionsHerbicidesPesticides,
            ghgEmissionsEnergy: input.ghgEmissionsEnergy,
            totalEmissionsCorn: input.totalEmissionsCorn,
          })
          .returning();

        return {
          success: true,
          cultivation: newCultivation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create cultivation data",
        });
      }
    }),

  // Update cultivation data
  update: protectedProcedure
    .input(updateCultivationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the cultivation to check tenant ownership
        const existingCultivation = await db
          .select()
          .from(cultivation)
          .where(eq(cultivation.id, input.id))
          .limit(1);

        if (existingCultivation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cultivation data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingCultivation[0].tenantId),
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

        // Update cultivation data
        const [updatedCultivation] = await db
          .update(cultivation)
          .set({
            ghgEmissionsRawMaterialInput: input.ghgEmissionsRawMaterialInput,
            ghgEmissionsFertilizers: input.ghgEmissionsFertilizers,
            ghgEmissionsHerbicidesPesticides: input.ghgEmissionsHerbicidesPesticides,
            ghgEmissionsEnergy: input.ghgEmissionsEnergy,
            totalEmissionsCorn: input.totalEmissionsCorn,
            updatedAt: new Date(),
          })
          .where(eq(cultivation.id, input.id))
          .returning();

        return {
          success: true,
          cultivation: updatedCultivation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update cultivation data",
        });
      }
    }),

  // Delete cultivation data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the cultivation to check tenant ownership
        const existingCultivation = await db
          .select()
          .from(cultivation)
          .where(eq(cultivation.id, input.id))
          .limit(1);

        if (existingCultivation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cultivation data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingCultivation[0].tenantId),
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

        // Delete cultivation data
        await db.delete(cultivation).where(eq(cultivation.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete cultivation data",
        });
      }
    }),

  // Get cultivation data by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectCultivation = await db
        .select()
        .from(cultivation)
        .where(eq(cultivation.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectCultivation.length === 0) {
        return { cultivation: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectCultivation[0].tenantId),
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

      const carbonProjectCultivation = await db
        .select()
        .from(cultivation)
        .where(eq(cultivation.carbonProjectId, input.carbonProjectId));

      return { cultivation: carbonProjectCultivation };
    }),

  // Get cultivation data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const cultivationData = await db
        .select()
        .from(cultivation)
        .where(eq(cultivation.id, input.id))
        .limit(1);

      if (cultivationData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cultivation data not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, cultivationData[0].tenantId),
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

      return { cultivation: cultivationData[0] };
    }),

  // Get cultivation data by tenant
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

      const tenantCultivation = await db
        .select()
        .from(cultivation)
        .where(eq(cultivation.tenantId, input.tenantId));

      return { cultivation: tenantCultivation };
    }),
});