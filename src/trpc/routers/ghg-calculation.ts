import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { stepDuaGhgCalculation, carbonProject } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const stepDuaGhgCalculationSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const updateStepDuaGhgCalculationSchema = z.object({
  id: z.number(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const bulkAddStepDuaGhgCalculationSchema = z.object({
  carbonProjectId: z.string().uuid(),
  items: z.array(z.object({
    keterangan: z.string().min(1, "Keterangan is required"),
    nilaiInt: z.number().optional(),
    nilaiString: z.string().optional(),
    satuan: z.string().optional(),
    source: z.string().optional(),
  })).min(1, "At least one item is required"),
});

export const ghgCalculationRouter = createTRPCRouter({
  // Bulk add step dua ghg calculations
  bulkAdd: protectedProcedure
    .input(bulkAddStepDuaGhgCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the carbon project to check tenant ownership
        const project = await db
          .select()
          .from(carbonProject)
          .where(eq(carbonProject.id, input.carbonProjectId))
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Carbon project not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, project[0].tenantId),
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

        // Prepare bulk insert data
        const insertData = input.items.map(item => ({
          carbonProjectId: input.carbonProjectId,
          keterangan: item.keterangan,
          nilaiInt: item.nilaiInt,
          nilaiString: item.nilaiString,
          satuan: item.satuan,
          source: item.source,
        }));

        // Bulk insert step dua ghg calculations
        const newStepDuaGhgCalculations = await db
          .insert(stepDuaGhgCalculation)
          .values(insertData)
          .returning();

        return {
          success: true,
          stepDuaGhgCalculations: newStepDuaGhgCalculations,
          count: newStepDuaGhgCalculations.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk create step dua ghg calculations",
        });
      }
    }),

  // Add new step dua ghg calculation
  add: protectedProcedure
    .input(stepDuaGhgCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the carbon project to check tenant ownership
        const project = await db
          .select()
          .from(carbonProject)
          .where(eq(carbonProject.id, input.carbonProjectId))
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Carbon project not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, project[0].tenantId),
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

        // Create step dua ghg calculation
        const [newStepDuaGhgCalculation] = await db
          .insert(stepDuaGhgCalculation)
          .values({
            carbonProjectId: input.carbonProjectId,
            keterangan: input.keterangan,
            nilaiInt: input.nilaiInt,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .returning();

        return {
          success: true,
          stepDuaGhgCalculation: newStepDuaGhgCalculation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create step dua ghg calculation",
        });
      }
    }),

  // Update step dua ghg calculation
  update: protectedProcedure
    .input(updateStepDuaGhgCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step dua ghg calculation to check carbon project ownership
        const calculation = await db
          .select({
            id: stepDuaGhgCalculation.id,
            carbonProjectId: stepDuaGhgCalculation.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepDuaGhgCalculation)
          .innerJoin(carbonProject, eq(stepDuaGhgCalculation.carbonProjectId, carbonProject.id))
          .where(eq(stepDuaGhgCalculation.id, input.id))
          .limit(1);

        if (calculation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step dua ghg calculation not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, calculation[0].tenantId),
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

        // Update step dua ghg calculation
        const [updatedStepDuaGhgCalculation] = await db
          .update(stepDuaGhgCalculation)
          .set({
            keterangan: input.keterangan,
            nilaiInt: input.nilaiInt,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .where(eq(stepDuaGhgCalculation.id, input.id))
          .returning();

        return {
          success: true,
          stepDuaGhgCalculation: updatedStepDuaGhgCalculation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update step dua ghg calculation",
        });
      }
    }),

  // Delete step dua ghg calculation
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step dua ghg calculation to check carbon project ownership
        const calculation = await db
          .select({
            id: stepDuaGhgCalculation.id,
            carbonProjectId: stepDuaGhgCalculation.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepDuaGhgCalculation)
          .innerJoin(carbonProject, eq(stepDuaGhgCalculation.carbonProjectId, carbonProject.id))
          .where(eq(stepDuaGhgCalculation.id, input.id))
          .limit(1);

        if (calculation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step dua ghg calculation not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, calculation[0].tenantId),
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

        // Delete step dua ghg calculation
        await db.delete(stepDuaGhgCalculation).where(eq(stepDuaGhgCalculation.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete step dua ghg calculation",
        });
      }
    }),

  // Get step dua ghg calculation by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const calculation = await db
        .select({
          id: stepDuaGhgCalculation.id,
          carbonProjectId: stepDuaGhgCalculation.carbonProjectId,
          keterangan: stepDuaGhgCalculation.keterangan,
          nilaiInt: stepDuaGhgCalculation.nilaiInt,
          nilaiString: stepDuaGhgCalculation.nilaiString,
          satuan: stepDuaGhgCalculation.satuan,
          source: stepDuaGhgCalculation.source,
          tenantId: carbonProject.tenantId,
        })
        .from(stepDuaGhgCalculation)
        .innerJoin(carbonProject, eq(stepDuaGhgCalculation.carbonProjectId, carbonProject.id))
        .where(eq(stepDuaGhgCalculation.id, input.id))
        .limit(1);

      if (calculation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step dua ghg calculation not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, calculation[0].tenantId),
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

      return { stepDuaGhgCalculation: calculation[0] };
    }),

  // Get step dua ghg calculations by carbon project ID
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get the carbon project to check tenant ownership
      const project = await db
        .select()
        .from(carbonProject)
        .where(eq(carbonProject.id, input.carbonProjectId))
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Carbon project not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, project[0].tenantId),
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

      // Get all step dua ghg calculations that belong to this carbon project
      const projectCalculations = await db
        .select({
          id: stepDuaGhgCalculation.id,
          carbonProjectId: stepDuaGhgCalculation.carbonProjectId,
          keterangan: stepDuaGhgCalculation.keterangan,
          nilaiInt: stepDuaGhgCalculation.nilaiInt,
          nilaiString: stepDuaGhgCalculation.nilaiString,
          satuan: stepDuaGhgCalculation.satuan,
          source: stepDuaGhgCalculation.source,
        })
        .from(stepDuaGhgCalculation)
        .where(eq(stepDuaGhgCalculation.carbonProjectId, input.carbonProjectId));

      return { stepDuaGhgCalculations: projectCalculations };
    }),
});