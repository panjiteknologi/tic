import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { carbonProject } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const carbonProjectSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1, "Carbon project name is required"),
});

const updateCarbonProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Carbon project name is required"),
});

export const carbonProjectRouter = createTRPCRouter({
  // Add new carbon project
  add: protectedProcedure
    .input(carbonProjectSchema)
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

        // Create carbon project
        const [newCarbonProject] = await db
          .insert(carbonProject)
          .values({
            tenantId: input.tenantId,
            name: input.name,
          })
          .returning();

        return {
          success: true,
          carbonProject: newCarbonProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create carbon project",
        });
      }
    }),

  // Update carbon project
  update: protectedProcedure
    .input(updateCarbonProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the carbon project to check tenant ownership
        const project = await db
          .select()
          .from(carbonProject)
          .where(eq(carbonProject.id, input.id))
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

        // Update carbon project
        const [updatedCarbonProject] = await db
          .update(carbonProject)
          .set({
            name: input.name,
            updatedAt: new Date(),
          })
          .where(eq(carbonProject.id, input.id))
          .returning();

        return {
          success: true,
          carbonProject: updatedCarbonProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update carbon project",
        });
      }
    }),

  // Get carbon project by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const project = await db
        .select()
        .from(carbonProject)
        .where(eq(carbonProject.id, input.id))
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

      return { carbonProject: project[0] };
    }),

  // Get carbon projects by tenant ID
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

      // Get all carbon projects that belong to this tenant
      const tenantProjects = await db
        .select({
          id: carbonProject.id,
          name: carbonProject.name,
          createdAt: carbonProject.createdAt,
          updatedAt: carbonProject.updatedAt,
        })
        .from(carbonProject)
        .where(eq(carbonProject.tenantId, input.tenantId));

      return { carbonProjects: tenantProjects };
    }),

  // Delete carbon project with cascade
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the carbon project to check tenant ownership
        const project = await db
          .select()
          .from(carbonProject)
          .where(eq(carbonProject.id, input.id))
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

        // Delete carbon project (cascade will handle related records)
        await db.delete(carbonProject).where(eq(carbonProject.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete carbon project",
        });
      }
    }),
});
