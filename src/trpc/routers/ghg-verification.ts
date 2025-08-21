import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import {
  stepSatuGhgVerification,
  carbonProject,
} from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const stepSatuGhgVerificationSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const updateStepSatuGhgVerificationSchema = z.object({
  id: z.number(),
  keterangan: z.string().optional(),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const bulkAddStepSatuGhgVerificationSchema = z.object({
  carbonProjectId: z.string().uuid(),
  items: z
    .array(
      z.object({
        keterangan: z.string().min(1, "Keterangan is required"),
        nilaiInt: z.number().optional(),
        nilaiString: z.string().optional(),
        satuan: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
});

export const ghgVerificationRouter = createTRPCRouter({
  // Bulk add step satu ghg verifications
  bulkAdd: protectedProcedure
    .input(bulkAddStepSatuGhgVerificationSchema)
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
        const insertData = input.items.map((item) => ({
          carbonProjectId: input.carbonProjectId,
          keterangan: item.keterangan,
          nilaiInt:
            item.nilaiInt !== undefined && item.nilaiInt !== null
              ? String(item.nilaiInt)
              : null,
          nilaiString: item.nilaiString,
          satuan: item.satuan,
          source: item.source,
        }));

        // Bulk insert step satu ghg verifications
        const newStepSatuGhgVerifications = await db
          .insert(stepSatuGhgVerification)
          .values(insertData)
          .returning();

        return {
          success: true,
          stepSatuGhgVerifications: newStepSatuGhgVerifications,
          count: newStepSatuGhgVerifications.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk create step satu ghg verifications",
        });
      }
    }),

  // Add new step satu ghg verification
  add: protectedProcedure
    .input(stepSatuGhgVerificationSchema)
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

        // Create step satu ghg verification
        const [newStepSatuGhgVerification] = await db
          .insert(stepSatuGhgVerification)
          .values({
            carbonProjectId: input.carbonProjectId,
            keterangan: input.keterangan,
            nilaiInt:
              input.nilaiInt !== undefined && input.nilaiInt !== null
                ? String(input.nilaiInt)
                : null,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .returning();

        return {
          success: true,
          stepSatuGhgVerification: newStepSatuGhgVerification,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create step satu ghg verification",
        });
      }
    }),

  // Update step satu ghg verification
  update: protectedProcedure
    .input(updateStepSatuGhgVerificationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step satu ghg verification to check carbon project ownership
        const verification = await db
          .select({
            id: stepSatuGhgVerification.id,
            carbonProjectId: stepSatuGhgVerification.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepSatuGhgVerification)
          .innerJoin(
            carbonProject,
            eq(stepSatuGhgVerification.carbonProjectId, carbonProject.id)
          )
          .where(eq(stepSatuGhgVerification.id, input.id))
          .limit(1);

        if (verification.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step satu ghg verification not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, verification[0].tenantId),
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

        // Update step satu ghg verification
        const [updatedStepSatuGhgVerification] = await db
          .update(stepSatuGhgVerification)
          .set({
            keterangan: input.keterangan,
            nilaiInt:
              input.nilaiInt !== undefined && input.nilaiInt !== null
                ? String(input.nilaiInt)
                : null,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .where(eq(stepSatuGhgVerification.id, input.id))
          .returning();

        return {
          success: true,
          stepSatuGhgVerification: updatedStepSatuGhgVerification,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update step satu ghg verification",
        });
      }
    }),

  // Delete step satu ghg verification
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step satu ghg verification to check carbon project ownership
        const verification = await db
          .select({
            id: stepSatuGhgVerification.id,
            carbonProjectId: stepSatuGhgVerification.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepSatuGhgVerification)
          .innerJoin(
            carbonProject,
            eq(stepSatuGhgVerification.carbonProjectId, carbonProject.id)
          )
          .where(eq(stepSatuGhgVerification.id, input.id))
          .limit(1);

        if (verification.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step satu ghg verification not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, verification[0].tenantId),
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

        // Delete step satu ghg verification
        await db
          .delete(stepSatuGhgVerification)
          .where(eq(stepSatuGhgVerification.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete step satu ghg verification",
        });
      }
    }),

  // Get step satu ghg verification by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const verification = await db
        .select({
          id: stepSatuGhgVerification.id,
          carbonProjectId: stepSatuGhgVerification.carbonProjectId,
          keterangan: stepSatuGhgVerification.keterangan,
          nilaiInt: stepSatuGhgVerification.nilaiInt,
          nilaiString: stepSatuGhgVerification.nilaiString,
          satuan: stepSatuGhgVerification.satuan,
          source: stepSatuGhgVerification.source,
          tenantId: carbonProject.tenantId,
        })
        .from(stepSatuGhgVerification)
        .innerJoin(
          carbonProject,
          eq(stepSatuGhgVerification.carbonProjectId, carbonProject.id)
        )
        .where(eq(stepSatuGhgVerification.id, input.id))
        .limit(1);

      if (verification.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step satu ghg verification not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, verification[0].tenantId),
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

      return { stepSatuGhgVerification: verification[0] };
    }),

  // Get step satu ghg verifications by carbon project ID
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

      // Get all step satu ghg verifications that belong to this carbon project
      const projectVerifications = await db
        .select({
          id: stepSatuGhgVerification.id,
          carbonProjectId: stepSatuGhgVerification.carbonProjectId,
          keterangan: stepSatuGhgVerification.keterangan,
          nilaiInt: stepSatuGhgVerification.nilaiInt,
          nilaiString: stepSatuGhgVerification.nilaiString,
          satuan: stepSatuGhgVerification.satuan,
          source: stepSatuGhgVerification.source,
        })
        .from(stepSatuGhgVerification)
        .where(
          eq(stepSatuGhgVerification.carbonProjectId, input.carbonProjectId)
        )
        .orderBy(asc(stepSatuGhgVerification.keterangan));

      return { stepSatuGhgVerifications: projectVerifications };
    }),
});
