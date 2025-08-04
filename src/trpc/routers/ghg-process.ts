import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { stepTigaGhgCalculationProcess, carbonProject } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const stepTigaGhgCalculationProcessSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const updateStepTigaGhgCalculationProcessSchema = z.object({
  id: z.number(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

export const ghgProcessRouter = createTRPCRouter({
  // Add new step tiga ghg calculation process
  add: protectedProcedure
    .input(stepTigaGhgCalculationProcessSchema)
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

        // Create step tiga ghg calculation process
        const [newStepTigaGhgCalculationProcess] = await db
          .insert(stepTigaGhgCalculationProcess)
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
          stepTigaGhgCalculationProcess: newStepTigaGhgCalculationProcess,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create step tiga ghg calculation process",
        });
      }
    }),

  // Update step tiga ghg calculation process
  update: protectedProcedure
    .input(updateStepTigaGhgCalculationProcessSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step tiga ghg calculation process to check carbon project ownership
        const process = await db
          .select({
            id: stepTigaGhgCalculationProcess.id,
            carbonProjectId: stepTigaGhgCalculationProcess.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepTigaGhgCalculationProcess)
          .innerJoin(carbonProject, eq(stepTigaGhgCalculationProcess.carbonProjectId, carbonProject.id))
          .where(eq(stepTigaGhgCalculationProcess.id, input.id))
          .limit(1);

        if (process.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step tiga ghg calculation process not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, process[0].tenantId),
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

        // Update step tiga ghg calculation process
        const [updatedStepTigaGhgCalculationProcess] = await db
          .update(stepTigaGhgCalculationProcess)
          .set({
            keterangan: input.keterangan,
            nilaiInt: input.nilaiInt,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .where(eq(stepTigaGhgCalculationProcess.id, input.id))
          .returning();

        return {
          success: true,
          stepTigaGhgCalculationProcess: updatedStepTigaGhgCalculationProcess,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update step tiga ghg calculation process",
        });
      }
    }),

  // Delete step tiga ghg calculation process
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step tiga ghg calculation process to check carbon project ownership
        const process = await db
          .select({
            id: stepTigaGhgCalculationProcess.id,
            carbonProjectId: stepTigaGhgCalculationProcess.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepTigaGhgCalculationProcess)
          .innerJoin(carbonProject, eq(stepTigaGhgCalculationProcess.carbonProjectId, carbonProject.id))
          .where(eq(stepTigaGhgCalculationProcess.id, input.id))
          .limit(1);

        if (process.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step tiga ghg calculation process not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, process[0].tenantId),
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

        // Delete step tiga ghg calculation process
        await db.delete(stepTigaGhgCalculationProcess).where(eq(stepTigaGhgCalculationProcess.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete step tiga ghg calculation process",
        });
      }
    }),

  // Get step tiga ghg calculation process by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const process = await db
        .select({
          id: stepTigaGhgCalculationProcess.id,
          carbonProjectId: stepTigaGhgCalculationProcess.carbonProjectId,
          keterangan: stepTigaGhgCalculationProcess.keterangan,
          nilaiInt: stepTigaGhgCalculationProcess.nilaiInt,
          nilaiString: stepTigaGhgCalculationProcess.nilaiString,
          satuan: stepTigaGhgCalculationProcess.satuan,
          source: stepTigaGhgCalculationProcess.source,
          tenantId: carbonProject.tenantId,
        })
        .from(stepTigaGhgCalculationProcess)
        .innerJoin(carbonProject, eq(stepTigaGhgCalculationProcess.carbonProjectId, carbonProject.id))
        .where(eq(stepTigaGhgCalculationProcess.id, input.id))
        .limit(1);

      if (process.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step tiga ghg calculation process not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, process[0].tenantId),
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

      return { stepTigaGhgCalculationProcess: process[0] };
    }),

  // Get step tiga ghg calculation processes by carbon project ID
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

      // Get all step tiga ghg calculation processes that belong to this carbon project
      const projectProcesses = await db
        .select({
          id: stepTigaGhgCalculationProcess.id,
          carbonProjectId: stepTigaGhgCalculationProcess.carbonProjectId,
          keterangan: stepTigaGhgCalculationProcess.keterangan,
          nilaiInt: stepTigaGhgCalculationProcess.nilaiInt,
          nilaiString: stepTigaGhgCalculationProcess.nilaiString,
          satuan: stepTigaGhgCalculationProcess.satuan,
          source: stepTigaGhgCalculationProcess.source,
        })
        .from(stepTigaGhgCalculationProcess)
        .where(eq(stepTigaGhgCalculationProcess.carbonProjectId, input.carbonProjectId));

      return { stepTigaGhgCalculationProcesses: projectProcesses };
    }),
});