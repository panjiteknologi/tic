import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { raws } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const rawSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  cornSeedsAmount: z.string().optional(),
  emissionFactorCornSeeds: z.string().optional(),
  co2eqEmissionsRawMaterialInputHaYr: z.string().optional(),
  co2eqEmissionsRawMaterialInputTFFB: z.string().optional(),
});

const updateRawSchema = z.object({
  id: z.string().uuid(),
  cornSeedsAmount: z.string().optional(),
  emissionFactorCornSeeds: z.string().optional(),
  co2eqEmissionsRawMaterialInputHaYr: z.string().optional(),
  co2eqEmissionsRawMaterialInputTFFB: z.string().optional(),
});

export const rawsRouter = createTRPCRouter({
  // Add new raw
  add: protectedProcedure.input(rawSchema).mutation(async ({ ctx, input }) => {
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

      // Create raw
      const [newRaw] = await db
        .insert(raws)
        .values({
          tenantId: input.tenantId,
          carbonProjectId: input.carbonProjectId,
          cornSeedsAmount: input.cornSeedsAmount,
          emissionFactorCornSeeds: input.emissionFactorCornSeeds,
          co2eqEmissionsRawMaterialInputHaYr:
            input.co2eqEmissionsRawMaterialInputHaYr,
          co2eqEmissionsRawMaterialInputTFFB:
            input.co2eqEmissionsRawMaterialInputTFFB,
        })
        .returning();

      return {
        success: true,
        raw: newRaw,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create raw",
      });
    }
  }),

  // Update raw
  update: protectedProcedure
    .input(updateRawSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the raw to check tenant ownership
        const existingRaw = await db
          .select()
          .from(raws)
          .where(eq(raws.id, input.id))
          .limit(1);

        if (existingRaw.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Raw not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingRaw[0].tenantId),
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

        // Update raw
        const [updatedRaw] = await db
          .update(raws)
          .set({
            cornSeedsAmount: input.cornSeedsAmount,
            emissionFactorCornSeeds: input.emissionFactorCornSeeds,
            co2eqEmissionsRawMaterialInputHaYr:
              input.co2eqEmissionsRawMaterialInputHaYr,
            co2eqEmissionsRawMaterialInputTFFB:
              input.co2eqEmissionsRawMaterialInputTFFB,
            updatedAt: new Date(),
          })
          .where(eq(raws.id, input.id))
          .returning();

        return {
          success: true,
          raw: updatedRaw,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update raw",
        });
      }
    }),

  // Get raw by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const raw = await db
        .select()
        .from(raws)
        .where(eq(raws.id, input.id))
        .limit(1);

      if (raw.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Raw not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, raw[0].tenantId),
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

      return { raw: raw[0] };
    }),

  // Delete raw
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the raw to check tenant ownership
        const existingRaw = await db
          .select()
          .from(raws)
          .where(eq(raws.id, input.id))
          .limit(1);

        if (existingRaw.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Raw not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingRaw[0].tenantId),
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

        // Delete raw
        await db.delete(raws).where(eq(raws.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete raw",
        });
      }
    }),

  // Get all raws by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectRaws = await db
        .select()
        .from(raws)
        .where(eq(raws.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectRaws.length === 0) {
        return { raws: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectRaws[0].tenantId),
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

      const carbonProjectRaws = await db
        .select()
        .from(raws)
        .where(eq(raws.carbonProjectId, input.carbonProjectId));

      return { raws: carbonProjectRaws };
    }),
});
