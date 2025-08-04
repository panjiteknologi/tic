import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { stepTigaOtherCase, carbonProject } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const stepTigaOtherCaseSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const updateStepTigaOtherCaseSchema = z.object({
  id: z.number(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

export const ghgOtherCaseRouter = createTRPCRouter({
  // Add new step tiga other case
  add: protectedProcedure
    .input(stepTigaOtherCaseSchema)
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

        // Create step tiga other case
        const [newStepTigaOtherCase] = await db
          .insert(stepTigaOtherCase)
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
          stepTigaOtherCase: newStepTigaOtherCase,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create step tiga other case",
        });
      }
    }),

  // Update step tiga other case
  update: protectedProcedure
    .input(updateStepTigaOtherCaseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step tiga other case to check carbon project ownership
        const otherCase = await db
          .select({
            id: stepTigaOtherCase.id,
            carbonProjectId: stepTigaOtherCase.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepTigaOtherCase)
          .innerJoin(carbonProject, eq(stepTigaOtherCase.carbonProjectId, carbonProject.id))
          .where(eq(stepTigaOtherCase.id, input.id))
          .limit(1);

        if (otherCase.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step tiga other case not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, otherCase[0].tenantId),
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

        // Update step tiga other case
        const [updatedStepTigaOtherCase] = await db
          .update(stepTigaOtherCase)
          .set({
            keterangan: input.keterangan,
            nilaiInt: input.nilaiInt,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .where(eq(stepTigaOtherCase.id, input.id))
          .returning();

        return {
          success: true,
          stepTigaOtherCase: updatedStepTigaOtherCase,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update step tiga other case",
        });
      }
    }),

  // Delete step tiga other case
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step tiga other case to check carbon project ownership
        const otherCase = await db
          .select({
            id: stepTigaOtherCase.id,
            carbonProjectId: stepTigaOtherCase.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepTigaOtherCase)
          .innerJoin(carbonProject, eq(stepTigaOtherCase.carbonProjectId, carbonProject.id))
          .where(eq(stepTigaOtherCase.id, input.id))
          .limit(1);

        if (otherCase.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step tiga other case not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, otherCase[0].tenantId),
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

        // Delete step tiga other case
        await db.delete(stepTigaOtherCase).where(eq(stepTigaOtherCase.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete step tiga other case",
        });
      }
    }),

  // Get step tiga other case by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const otherCase = await db
        .select({
          id: stepTigaOtherCase.id,
          carbonProjectId: stepTigaOtherCase.carbonProjectId,
          keterangan: stepTigaOtherCase.keterangan,
          nilaiInt: stepTigaOtherCase.nilaiInt,
          nilaiString: stepTigaOtherCase.nilaiString,
          satuan: stepTigaOtherCase.satuan,
          source: stepTigaOtherCase.source,
          tenantId: carbonProject.tenantId,
        })
        .from(stepTigaOtherCase)
        .innerJoin(carbonProject, eq(stepTigaOtherCase.carbonProjectId, carbonProject.id))
        .where(eq(stepTigaOtherCase.id, input.id))
        .limit(1);

      if (otherCase.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step tiga other case not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, otherCase[0].tenantId),
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

      return { stepTigaOtherCase: otherCase[0] };
    }),

  // Get step tiga other cases by carbon project ID
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

      // Get all step tiga other cases that belong to this carbon project
      const projectOtherCases = await db
        .select({
          id: stepTigaOtherCase.id,
          carbonProjectId: stepTigaOtherCase.carbonProjectId,
          keterangan: stepTigaOtherCase.keterangan,
          nilaiInt: stepTigaOtherCase.nilaiInt,
          nilaiString: stepTigaOtherCase.nilaiString,
          satuan: stepTigaOtherCase.satuan,
          source: stepTigaOtherCase.source,
        })
        .from(stepTigaOtherCase)
        .where(eq(stepTigaOtherCase.carbonProjectId, input.carbonProjectId));

      return { stepTigaOtherCases: projectOtherCases };
    }),
});