import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import {
  stepEmpatGhgAudit,
  carbonProject,
} from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const stepEmpatGhgAuditSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Keterangan is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const updateStepEmpatGhgAuditSchema = z.object({
  id: z.number(),
  keterangan: z.string().optional(),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const bulkAddStepEmpatGhgAuditSchema = z.object({
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

export const ghgAuditRouter = createTRPCRouter({
  // Bulk add step empat ghg audits
  bulkAdd: protectedProcedure
    .input(bulkAddStepEmpatGhgAuditSchema)
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
          nilaiInt: item.nilaiInt,
          nilaiString: item.nilaiString,
          satuan: item.satuan,
          source: item.source,
        }));

        // Bulk insert step empat ghg audits
        const newStepEmpatGhgAudits = await db
          .insert(stepEmpatGhgAudit)
          .values(insertData)
          .returning();

        return {
          success: true,
          stepEmpatGhgAudits: newStepEmpatGhgAudits,
          count: newStepEmpatGhgAudits.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk create step empat ghg audits",
        });
      }
    }),

  // Add new step empat ghg audit
  add: protectedProcedure
    .input(stepEmpatGhgAuditSchema)
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

        // Create step empat ghg audit
        const [newStepEmpatGhgAudit] = await db
          .insert(stepEmpatGhgAudit)
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
          stepEmpatGhgAudit: newStepEmpatGhgAudit,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create step empat ghg audit",
        });
      }
    }),

  // Update step empat ghg audit
  update: protectedProcedure
    .input(updateStepEmpatGhgAuditSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step empat ghg audit to check carbon project ownership
        const audit = await db
          .select({
            id: stepEmpatGhgAudit.id,
            carbonProjectId: stepEmpatGhgAudit.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepEmpatGhgAudit)
          .innerJoin(
            carbonProject,
            eq(stepEmpatGhgAudit.carbonProjectId, carbonProject.id)
          )
          .where(eq(stepEmpatGhgAudit.id, input.id))
          .limit(1);

        if (audit.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step empat ghg audit not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, audit[0].tenantId),
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

        // Update step empat ghg audit
        const [updatedStepEmpatGhgAudit] = await db
          .update(stepEmpatGhgAudit)
          .set({
            keterangan: input.keterangan,
            nilaiInt: input.nilaiInt,
            nilaiString: input.nilaiString,
            satuan: input.satuan,
            source: input.source,
          })
          .where(eq(stepEmpatGhgAudit.id, input.id))
          .returning();

        return {
          success: true,
          stepEmpatGhgAudit: updatedStepEmpatGhgAudit,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update step empat ghg audit",
        });
      }
    }),

  // Delete step empat ghg audit
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the step empat ghg audit to check carbon project ownership
        const audit = await db
          .select({
            id: stepEmpatGhgAudit.id,
            carbonProjectId: stepEmpatGhgAudit.carbonProjectId,
            tenantId: carbonProject.tenantId,
          })
          .from(stepEmpatGhgAudit)
          .innerJoin(
            carbonProject,
            eq(stepEmpatGhgAudit.carbonProjectId, carbonProject.id)
          )
          .where(eq(stepEmpatGhgAudit.id, input.id))
          .limit(1);

        if (audit.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step empat ghg audit not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, audit[0].tenantId),
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

        // Delete step empat ghg audit
        await db
          .delete(stepEmpatGhgAudit)
          .where(eq(stepEmpatGhgAudit.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete step empat ghg audit",
        });
      }
    }),

  // Get step empat ghg audit by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const audit = await db
        .select({
          id: stepEmpatGhgAudit.id,
          carbonProjectId: stepEmpatGhgAudit.carbonProjectId,
          keterangan: stepEmpatGhgAudit.keterangan,
          nilaiInt: stepEmpatGhgAudit.nilaiInt,
          nilaiString: stepEmpatGhgAudit.nilaiString,
          satuan: stepEmpatGhgAudit.satuan,
          source: stepEmpatGhgAudit.source,
          tenantId: carbonProject.tenantId,
        })
        .from(stepEmpatGhgAudit)
        .innerJoin(
          carbonProject,
          eq(stepEmpatGhgAudit.carbonProjectId, carbonProject.id)
        )
        .where(eq(stepEmpatGhgAudit.id, input.id))
        .limit(1);

      if (audit.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Step empat ghg audit not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, audit[0].tenantId),
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

      return { stepEmpatGhgAudit: audit[0] };
    }),

  // Get step empat ghg audits by carbon project ID
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

      // Get all step empat ghg audits that belong to this carbon project
      const projectAudits = await db
        .select({
          id: stepEmpatGhgAudit.id,
          carbonProjectId: stepEmpatGhgAudit.carbonProjectId,
          keterangan: stepEmpatGhgAudit.keterangan,
          nilaiInt: stepEmpatGhgAudit.nilaiInt,
          nilaiString: stepEmpatGhgAudit.nilaiString,
          satuan: stepEmpatGhgAudit.satuan,
          source: stepEmpatGhgAudit.source,
        })
        .from(stepEmpatGhgAudit)
        .where(eq(stepEmpatGhgAudit.carbonProjectId, input.carbonProjectId));

      return { stepEmpatGhgAudits: projectAudits };
    }),
});
