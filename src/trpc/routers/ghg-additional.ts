import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { stepTigaAdditional, carbonProject } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const stepTigaAdditionalSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const updateStepTigaAdditionalSchema = z.object({
  id: z.number(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const bulkAddStepTigaAdditionalSchema = z.object({
  carbonProjectId: z.string().uuid(),
  items: z.array(z.object({
    keterangan: z.string().min(1, "Keterangan is required"),
    nilaiInt: z.number().optional(),
    nilaiString: z.string().optional(),
    satuan: z.string().optional(),
    source: z.string().optional(),
  })).min(1, "At least one item is required"),
});

export const ghgAdditionalRouter = createTRPCRouter({
  // Bulk add step tiga additionals
  bulkAdd: protectedProcedure
    .input(bulkAddStepTigaAdditionalSchema)
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

        // Bulk insert step tiga additionals
        const newStepTigaAdditionals = await db
          .insert(stepTigaAdditional)
          .values(insertData)
          .returning();

        return {
          success: true,
          stepTigaAdditionals: newStepTigaAdditionals,
          count: newStepTigaAdditionals.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk create step tiga additionals",
        });
      }
    }),

  // Add new step tiga additional
  add: protectedProcedure
    .input(stepTigaAdditionalSchema)
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

        // Create step tiga additional
        const [newStepTigaAdditional] = await db
          .insert(stepTigaAdditional)
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
          stepTigaAdditional: newStepTigaAdditional,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create step tiga additional",
        });
      }
    }),

  // Update step tiga additional
  update: protectedProcedure
    .input(updateStepTigaAdditionalSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step tiga additional to check carbon project ownership
        const additional = await db
          .select({
            id: stepTigaAdditional.id,
            carbonProjectId: stepTigaAdditional.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepTigaAdditional)
          .innerJoin(carbonProject, eq(stepTigaAdditional.carbonProjectId, carbonProject.id))
          .where(eq(stepTigaAdditional.id, input.id))
          .limit(1);

        if (additional.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step tiga additional not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, additional[0].tenantId),
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

        // Update step tiga additional
        const [updatedStepTigaAdditional] = await db
          .update(stepTigaAdditional)
          .set({
            keterangan: input.keterangan,
            nilaiInt: input.nilaiInt,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .where(eq(stepTigaAdditional.id, input.id))
          .returning();

        return {
          success: true,
          stepTigaAdditional: updatedStepTigaAdditional,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update step tiga additional",
        });
      }
    }),

  // Delete step tiga additional
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step tiga additional to check carbon project ownership
        const additional = await db
          .select({
            id: stepTigaAdditional.id,
            carbonProjectId: stepTigaAdditional.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepTigaAdditional)
          .innerJoin(carbonProject, eq(stepTigaAdditional.carbonProjectId, carbonProject.id))
          .where(eq(stepTigaAdditional.id, input.id))
          .limit(1);

        if (additional.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step tiga additional not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, additional[0].tenantId),
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

        // Delete step tiga additional
        await db.delete(stepTigaAdditional).where(eq(stepTigaAdditional.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete step tiga additional",
        });
      }
    }),

  // Get step tiga additional by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const additional = await db
        .select({
          id: stepTigaAdditional.id,
          carbonProjectId: stepTigaAdditional.carbonProjectId,
          keterangan: stepTigaAdditional.keterangan,
          nilaiInt: stepTigaAdditional.nilaiInt,
          nilaiString: stepTigaAdditional.nilaiString,
          satuan: stepTigaAdditional.satuan,
          source: stepTigaAdditional.source,
          tenantId: carbonProject.tenantId,
        })
        .from(stepTigaAdditional)
        .innerJoin(carbonProject, eq(stepTigaAdditional.carbonProjectId, carbonProject.id))
        .where(eq(stepTigaAdditional.id, input.id))
        .limit(1);

      if (additional.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step tiga additional not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, additional[0].tenantId),
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

      return { stepTigaAdditional: additional[0] };
    }),

  // Get step tiga additionals by carbon project ID
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

      // Get all step tiga additionals that belong to this carbon project
      const projectAdditionals = await db
        .select({
          id: stepTigaAdditional.id,
          carbonProjectId: stepTigaAdditional.carbonProjectId,
          keterangan: stepTigaAdditional.keterangan,
          nilaiInt: stepTigaAdditional.nilaiInt,
          nilaiString: stepTigaAdditional.nilaiString,
          satuan: stepTigaAdditional.satuan,
          source: stepTigaAdditional.source,
        })
        .from(stepTigaAdditional)
        .where(eq(stepTigaAdditional.carbonProjectId, input.carbonProjectId));

      return { stepTigaAdditionals: projectAdditionals };
    }),
});