import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { energyDiesel } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const energyDieselSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  dieselConsumed: z.string().optional(),
  emissionFactorDiesel: z.string().optional(),
  co2eEmissionsDieselYr: z.string().optional(),
  co2eEmissionsDieselTFFB: z.string().optional(),
});

const updateEnergyDieselSchema = z.object({
  id: z.string().uuid(),
  dieselConsumed: z.string().optional(),
  emissionFactorDiesel: z.string().optional(),
  co2eEmissionsDieselYr: z.string().optional(),
  co2eEmissionsDieselTFFB: z.string().optional(),
});

export const energyDieselRouter = createTRPCRouter({
  // Add new energy diesel data
  add: protectedProcedure
    .input(energyDieselSchema)
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

        // Create energy diesel data
        const [newEnergyDiesel] = await db
          .insert(energyDiesel)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            dieselConsumed: input.dieselConsumed,
            emissionFactorDiesel: input.emissionFactorDiesel,
            co2eEmissionsDieselYr: input.co2eEmissionsDieselYr,
            co2eEmissionsDieselTFFB: input.co2eEmissionsDieselTFFB,
          })
          .returning();

        return {
          success: true,
          energyDiesel: newEnergyDiesel,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create energy diesel data",
        });
      }
    }),

  // Update energy diesel data
  update: protectedProcedure
    .input(updateEnergyDieselSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the energy diesel to check tenant ownership
        const existingEnergyDiesel = await db
          .select()
          .from(energyDiesel)
          .where(eq(energyDiesel.id, input.id))
          .limit(1);

        if (existingEnergyDiesel.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Energy diesel data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingEnergyDiesel[0].tenantId),
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

        // Update energy diesel data
        const [updatedEnergyDiesel] = await db
          .update(energyDiesel)
          .set({
            dieselConsumed: input.dieselConsumed,
            emissionFactorDiesel: input.emissionFactorDiesel,
            co2eEmissionsDieselYr: input.co2eEmissionsDieselYr,
            co2eEmissionsDieselTFFB: input.co2eEmissionsDieselTFFB,
            updatedAt: new Date(),
          })
          .where(eq(energyDiesel.id, input.id))
          .returning();

        return {
          success: true,
          energyDiesel: updatedEnergyDiesel,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update energy diesel data",
        });
      }
    }),

  // Delete energy diesel data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the energy diesel to check tenant ownership
        const existingEnergyDiesel = await db
          .select()
          .from(energyDiesel)
          .where(eq(energyDiesel.id, input.id))
          .limit(1);

        if (existingEnergyDiesel.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Energy diesel data not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingEnergyDiesel[0].tenantId),
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

        // Delete energy diesel data
        await db.delete(energyDiesel).where(eq(energyDiesel.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete energy diesel data",
        });
      }
    }),

  // Get energy diesel data by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectEnergyDiesel = await db
        .select()
        .from(energyDiesel)
        .where(eq(energyDiesel.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectEnergyDiesel.length === 0) {
        return { energyDiesel: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectEnergyDiesel[0].tenantId),
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

      const carbonProjectEnergyDiesel = await db
        .select()
        .from(energyDiesel)
        .where(eq(energyDiesel.carbonProjectId, input.carbonProjectId));

      return { energyDiesel: carbonProjectEnergyDiesel };
    }),

  // Get energy diesel data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const energyDieselData = await db
        .select()
        .from(energyDiesel)
        .where(eq(energyDiesel.id, input.id))
        .limit(1);

      if (energyDieselData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Energy diesel data not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, energyDieselData[0].tenantId),
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

      return { energyDiesel: energyDieselData[0] };
    }),

  // Get energy diesel data by tenant
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

      const tenantEnergyDiesel = await db
        .select()
        .from(energyDiesel)
        .where(eq(energyDiesel.tenantId, input.tenantId));

      return { energyDiesel: tenantEnergyDiesel };
    }),
});