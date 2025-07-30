import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { actualCarbon } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const actualCarbonSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  actualLandUse: z.string().optional(),
  climateRegionActual: z.string().optional(),
  soilTypeActual: z.string().optional(),
  currentSoilManagementActual: z.string().optional(),
  currentInputToSoilActual: z.string().optional(),
  socstActual: z.string().optional(),
  fluActual: z.string().optional(),
  fmgActual: z.string().optional(),
  fiActual: z.string().optional(),
  cvegActual: z.string().optional(),
});

const updateActualCarbonSchema = z.object({
  id: z.string().uuid(),
  actualLandUse: z.string().optional(),
  climateRegionActual: z.string().optional(),
  soilTypeActual: z.string().optional(),
  currentSoilManagementActual: z.string().optional(),
  currentInputToSoilActual: z.string().optional(),
  socstActual: z.string().optional(),
  fluActual: z.string().optional(),
  fmgActual: z.string().optional(),
  fiActual: z.string().optional(),
  cvegActual: z.string().optional(),
});

export const actualCarbonRouter = createTRPCRouter({
  // Add new actual carbon data
  add: protectedProcedure
    .input(actualCarbonSchema)
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

        // Create actual carbon data
        const [newActualCarbon] = await db
          .insert(actualCarbon)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            actualLandUse: input.actualLandUse,
            climateRegionActual: input.climateRegionActual,
            soilTypeActual: input.soilTypeActual,
            currentSoilManagementActual: input.currentSoilManagementActual,
            currentInputToSoilActual: input.currentInputToSoilActual,
            socstActual: input.socstActual,
            fluActual: input.fluActual,
            fmgActual: input.fmgActual,
            fiActual: input.fiActual,
            cvegActual: input.cvegActual,
          })
          .returning();

        return {
          success: true,
          actualCarbon: newActualCarbon,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create actual carbon data",
        });
      }
    }),

  // Update actual carbon data
  update: protectedProcedure
    .input(updateActualCarbonSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the actual carbon to check tenant ownership
        const existingActualCarbon = await db
          .select()
          .from(actualCarbon)
          .where(eq(actualCarbon.id, input.id))
          .limit(1);

        if (existingActualCarbon.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Actual carbon data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingActualCarbon[0].tenantId),
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

        // Update actual carbon data
        const [updatedActualCarbon] = await db
          .update(actualCarbon)
          .set({
            actualLandUse: input.actualLandUse,
            climateRegionActual: input.climateRegionActual,
            soilTypeActual: input.soilTypeActual,
            currentSoilManagementActual: input.currentSoilManagementActual,
            currentInputToSoilActual: input.currentInputToSoilActual,
            socstActual: input.socstActual,
            fluActual: input.fluActual,
            fmgActual: input.fmgActual,
            fiActual: input.fiActual,
            cvegActual: input.cvegActual,
            updatedAt: new Date(),
          })
          .where(eq(actualCarbon.id, input.id))
          .returning();

        return {
          success: true,
          actualCarbon: updatedActualCarbon,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update actual carbon data",
        });
      }
    }),

  // Delete actual carbon data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the actual carbon to check tenant ownership
        const existingActualCarbon = await db
          .select()
          .from(actualCarbon)
          .where(eq(actualCarbon.id, input.id))
          .limit(1);

        if (existingActualCarbon.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Actual carbon data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingActualCarbon[0].tenantId),
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

        // Delete actual carbon data
        await db.delete(actualCarbon).where(eq(actualCarbon.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete actual carbon data",
        });
      }
    }),

  // Get actual carbon data by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectActualCarbon = await db
        .select()
        .from(actualCarbon)
        .where(eq(actualCarbon.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectActualCarbon.length === 0) {
        return { actualCarbon: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectActualCarbon[0].tenantId),
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

      const carbonProjectActualCarbon = await db
        .select()
        .from(actualCarbon)
        .where(eq(actualCarbon.carbonProjectId, input.carbonProjectId));

      return { actualCarbon: carbonProjectActualCarbon };
    }),

  // Get actual carbon data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const actualCarbonData = await db
        .select()
        .from(actualCarbon)
        .where(eq(actualCarbon.id, input.id))
        .limit(1);

      if (actualCarbonData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Actual carbon data not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, actualCarbonData[0].tenantId),
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

      return { actualCarbon: actualCarbonData[0] };
    }),

  // Get actual carbon data by tenant
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

      const tenantActualCarbon = await db
        .select()
        .from(actualCarbon)
        .where(eq(actualCarbon.tenantId, input.tenantId));

      return { actualCarbon: tenantActualCarbon };
    }),
});