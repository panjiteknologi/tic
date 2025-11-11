import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  defraProjects,
  defraCarbonCalculations,
  defraProjectSummaries,
  defraEmissionFactors
} from '@/db/schema/defra-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createDefraProjectSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organizationName: z.string().nullable().optional().transform(val => val === '' ? null : val),
  reportingPeriodStart: z.date(),
  reportingPeriodEnd: z.date(),
  defraYear: z.string().length(4, 'DEFRA year must be 4 characters (e.g., "2024")'),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft').optional(),
});

const updateDefraProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organizationName: z.string().nullable().optional().transform(val => val === '' ? null : val),
  reportingPeriodStart: z.date().optional(),
  reportingPeriodEnd: z.date().optional(),
  defraYear: z.string().length(4, 'DEFRA year must be 4 characters').optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
});

export const defraProjectsRouter = createTRPCRouter({
  // Create new DEFRA project
  create: protectedProcedure
    .input(createDefraProjectSchema)
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
            code: 'FORBIDDEN',
            message: 'Access denied to this tenant',
          });
        }

        // Validate reporting period
        if (input.reportingPeriodEnd < input.reportingPeriodStart) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Reporting period end date must be after start date',
          });
        }

        // Validate DEFRA year exists in emission factors
        const yearExists = await db
          .select()
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.year, input.defraYear))
          .limit(1);

        if (yearExists.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `No emission factors found for DEFRA year ${input.defraYear}. Please seed emission factors for this year first.`,
          });
        }

        const [newProject] = await db
          .insert(defraProjects)
          .values({
            tenantId: input.tenantId,
            name: input.name,
            description: input.description,
            organizationName: input.organizationName,
            reportingPeriodStart: input.reportingPeriodStart,
            reportingPeriodEnd: input.reportingPeriodEnd,
            defraYear: input.defraYear,
            status: input.status || 'draft',
          })
          .returning();

        return {
          success: true,
          project: newProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating DEFRA project:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create DEFRA project',
          cause: error,
        });
      }
    }),

  // Get DEFRA project by ID with relations
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get project
      const project = await db
        .select()
        .from(defraProjects)
        .where(eq(defraProjects.id, input.id))
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'DEFRA project not found',
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
          code: 'FORBIDDEN',
          message: 'Access denied to this project',
        });
      }

      // Get related data
      const calculations = await db
        .select()
        .from(defraCarbonCalculations)
        .where(eq(defraCarbonCalculations.projectId, input.id))
        .orderBy(desc(defraCarbonCalculations.activityDate));

      const summaries = await db
        .select()
        .from(defraProjectSummaries)
        .where(eq(defraProjectSummaries.projectId, input.id))
        .limit(1);

      return {
        project: project[0],
        calculations: calculations || [],
        summary: summaries[0] || null,
      };
    }),

  // Get all DEFRA projects for a tenant
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
          code: 'FORBIDDEN',
          message: 'Access denied to this tenant',
        });
      }

      // Get all projects for this tenant
      const projects = await db
        .select({
          id: defraProjects.id,
          tenantId: defraProjects.tenantId,
          name: defraProjects.name,
          description: defraProjects.description,
          organizationName: defraProjects.organizationName,
          reportingPeriodStart: defraProjects.reportingPeriodStart,
          reportingPeriodEnd: defraProjects.reportingPeriodEnd,
          defraYear: defraProjects.defraYear,
          status: defraProjects.status,
          createdAt: defraProjects.createdAt,
          updatedAt: defraProjects.updatedAt,
        })
        .from(defraProjects)
        .where(eq(defraProjects.tenantId, input.tenantId))
        .orderBy(desc(defraProjects.createdAt));

      return { projects };
    }),

  // Update DEFRA project
  update: protectedProcedure
    .input(updateDefraProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'DEFRA project not found',
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingProject[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this project',
          });
        }

        // Validate reporting period if both dates are provided
        if (input.reportingPeriodStart && input.reportingPeriodEnd) {
          if (input.reportingPeriodEnd < input.reportingPeriodStart) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Reporting period end date must be after start date',
            });
          }
        } else if (input.reportingPeriodStart && existingProject[0].reportingPeriodEnd) {
          if (existingProject[0].reportingPeriodEnd < input.reportingPeriodStart) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Reporting period end date must be after start date',
            });
          }
        } else if (input.reportingPeriodEnd && existingProject[0].reportingPeriodStart) {
          if (input.reportingPeriodEnd < existingProject[0].reportingPeriodStart) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Reporting period end date must be after start date',
            });
          }
        }

        // Validate DEFRA year if provided
        if (input.defraYear !== undefined) {
          const yearExists = await db
            .select()
            .from(defraEmissionFactors)
            .where(eq(defraEmissionFactors.year, input.defraYear))
            .limit(1);

          if (yearExists.length === 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `No emission factors found for DEFRA year ${input.defraYear}. Please seed emission factors for this year first.`,
            });
          }
        }

        // Update project
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.organizationName !== undefined) updateData.organizationName = input.organizationName;
        if (input.reportingPeriodStart !== undefined) updateData.reportingPeriodStart = input.reportingPeriodStart;
        if (input.reportingPeriodEnd !== undefined) updateData.reportingPeriodEnd = input.reportingPeriodEnd;
        if (input.defraYear !== undefined) updateData.defraYear = input.defraYear;
        if (input.status !== undefined) updateData.status = input.status;

        const [updatedProject] = await db
          .update(defraProjects)
          .set(updateData)
          .where(eq(defraProjects.id, input.id))
          .returning();

        return {
          success: true,
          project: updatedProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update DEFRA project',
        });
      }
    }),

  // Delete DEFRA project (cascade will handle related records)
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'DEFRA project not found',
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingProject[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this project',
          });
        }

        // Delete project (cascade will handle related records)
        await db.delete(defraProjects).where(eq(defraProjects.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete DEFRA project',
        });
      }
    }),

  // Update project status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'active', 'completed', 'archived']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'DEFRA project not found',
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingProject[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this project',
          });
        }

        // Update project status
        const [updatedProject] = await db
          .update(defraProjects)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(defraProjects.id, input.id))
          .returning();

        return {
          success: true,
          project: updatedProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update project status',
        });
      }
    }),
});

