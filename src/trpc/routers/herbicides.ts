import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { herbicides } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const herbicidesSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  acetochlor: z.string().optional(),
  emissionFactorPesticides: z.string().optional(),
  co2eqEmissionsHerbicidesPesticidesHaYr: z.string().optional(),
  co2eqEmissionsHerbicidesPesticidesTFFB: z.string().optional(),
});

const updateHerbicidesSchema = z.object({
  id: z.string().uuid(),
  acetochlor: z.string().optional(),
  emissionFactorPesticides: z.string().optional(),
  co2eqEmissionsHerbicidesPesticidesHaYr: z.string().optional(),
  co2eqEmissionsHerbicidesPesticidesTFFB: z.string().optional(),
});

export const herbicidesRouter = createTRPCRouter({
  // Add new herbicides data
  add: protectedProcedure
    .input(herbicidesSchema)
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

        // Create herbicides data
        const [newHerbicides] = await db
          .insert(herbicides)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            acetochlor: input.acetochlor,
            emissionFactorPesticides: input.emissionFactorPesticides,
            co2eqEmissionsHerbicidesPesticidesHaYr: input.co2eqEmissionsHerbicidesPesticidesHaYr,
            co2eqEmissionsHerbicidesPesticidesTFFB: input.co2eqEmissionsHerbicidesPesticidesTFFB,
          })
          .returning();

        return {
          success: true,
          herbicides: newHerbicides,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create herbicides data",
        });
      }
    }),

  // Update herbicides data
  update: protectedProcedure
    .input(updateHerbicidesSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the herbicides to check tenant ownership
        const existingHerbicides = await db
          .select()
          .from(herbicides)
          .where(eq(herbicides.id, input.id))
          .limit(1);

        if (existingHerbicides.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Herbicides data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingHerbicides[0].tenantId),
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

        // Update herbicides data
        const [updatedHerbicides] = await db
          .update(herbicides)
          .set({
            acetochlor: input.acetochlor,
            emissionFactorPesticides: input.emissionFactorPesticides,
            co2eqEmissionsHerbicidesPesticidesHaYr: input.co2eqEmissionsHerbicidesPesticidesHaYr,
            co2eqEmissionsHerbicidesPesticidesTFFB: input.co2eqEmissionsHerbicidesPesticidesTFFB,
            updatedAt: new Date(),
          })
          .where(eq(herbicides.id, input.id))
          .returning();

        return {
          success: true,
          herbicides: updatedHerbicides,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update herbicides data",
        });
      }
    }),

  // Delete herbicides data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the herbicides to check tenant ownership
        const existingHerbicides = await db
          .select()
          .from(herbicides)
          .where(eq(herbicides.id, input.id))
          .limit(1);

        if (existingHerbicides.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Herbicides data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingHerbicides[0].tenantId),
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

        // Delete herbicides data
        await db.delete(herbicides).where(eq(herbicides.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete herbicides data",
        });
      }
    }),

  // Get herbicides data by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectHerbicides = await db
        .select()
        .from(herbicides)
        .where(eq(herbicides.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectHerbicides.length === 0) {
        return { herbicides: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectHerbicides[0].tenantId),
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

      const carbonProjectHerbicides = await db
        .select()
        .from(herbicides)
        .where(eq(herbicides.carbonProjectId, input.carbonProjectId));

      return { herbicides: carbonProjectHerbicides };
    }),

  // Get herbicides data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const herbicidesData = await db
        .select()
        .from(herbicides)
        .where(eq(herbicides.id, input.id))
        .limit(1);

      if (herbicidesData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Herbicides data not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, herbicidesData[0].tenantId),
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

      return { herbicides: herbicidesData[0] };
    }),

  // Get herbicides data by tenant
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

      const tenantHerbicides = await db
        .select()
        .from(herbicides)
        .where(eq(herbicides.tenantId, input.tenantId));

      return { herbicides: tenantHerbicides };
    }),
});