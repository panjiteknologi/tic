import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  iso14064Projects,
  iso14064Calculations,
  iso14064ProjectSummaries
} from '@/db/schema/iso-14064-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createIso14064ProjectSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organizationName: z.string().nullable().optional().transform(val => val === '' ? null : val),
  reportingPeriodStart: z.date(),
  reportingPeriodEnd: z.date(),
  reportingYear: z.string().length(4, 'Reporting year must be 4 characters (e.g., "2024")'),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft').optional(),
  boundaryType: z.enum(['operational', 'financial', 'other']).default('operational').optional(),
  standardVersion: z.string().default('14064-1:2018').optional(),
});

const updateIso14064ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organizationName: z.string().nullable().optional().transform(val => val === '' ? null : val),
  reportingPeriodStart: z.date().optional(),
  reportingPeriodEnd: z.date().optional(),
  reportingYear: z.string().length(4, 'Reporting year must be 4 characters').optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  boundaryType: z.enum(['operational', 'financial', 'other']).optional(),
  standardVersion: z.string().optional(),
});

export const iso14064ProjectsRouter = createTRPCRouter({
  // Create new ISO 14064 project
  create: protectedProcedure
    .input(createIso14064ProjectSchema)
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

        const [newProject] = await db
          .insert(iso14064Projects)
          .values({
            tenantId: input.tenantId,
            name: input.name,
            description: input.description,
            organizationName: input.organizationName,
            reportingPeriodStart: input.reportingPeriodStart,
            reportingPeriodEnd: input.reportingPeriodEnd,
            reportingYear: input.reportingYear,
            status: input.status || 'draft',
            boundaryType: input.boundaryType || 'operational',
            standardVersion: input.standardVersion || '14064-1:2018',
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
        console.error('Error creating ISO 14064 project:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create ISO 14064 project',
          cause: error,
        });
      }
    }),

  // Get ISO 14064 project by ID with relations
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
        .from(iso14064Projects)
        .where(eq(iso14064Projects.id, input.id))
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ISO 14064 project not found',
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
        .from(iso14064Calculations)
        .where(eq(iso14064Calculations.projectId, input.id))
        .orderBy(desc(iso14064Calculations.calculatedAt));

      const summaries = await db
        .select()
        .from(iso14064ProjectSummaries)
        .where(eq(iso14064ProjectSummaries.projectId, input.id))
        .limit(1);

      return {
        project: project[0],
        calculations: calculations || [],
        summary: summaries[0] || null,
      };
    }),

  // Get all ISO 14064 projects for a tenant
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
          id: iso14064Projects.id,
          tenantId: iso14064Projects.tenantId,
          name: iso14064Projects.name,
          description: iso14064Projects.description,
          organizationName: iso14064Projects.organizationName,
          reportingPeriodStart: iso14064Projects.reportingPeriodStart,
          reportingPeriodEnd: iso14064Projects.reportingPeriodEnd,
          reportingYear: iso14064Projects.reportingYear,
          status: iso14064Projects.status,
          boundaryType: iso14064Projects.boundaryType,
          standardVersion: iso14064Projects.standardVersion,
          createdAt: iso14064Projects.createdAt,
          updatedAt: iso14064Projects.updatedAt,
        })
        .from(iso14064Projects)
        .where(eq(iso14064Projects.tenantId, input.tenantId))
        .orderBy(desc(iso14064Projects.createdAt));

      return { projects };
    }),

  // Update ISO 14064 project
  update: protectedProcedure
    .input(updateIso14064ProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(iso14064Projects)
          .where(eq(iso14064Projects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISO 14064 project not found',
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

        // Update project
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.organizationName !== undefined) updateData.organizationName = input.organizationName;
        if (input.reportingPeriodStart !== undefined) updateData.reportingPeriodStart = input.reportingPeriodStart;
        if (input.reportingPeriodEnd !== undefined) updateData.reportingPeriodEnd = input.reportingPeriodEnd;
        if (input.reportingYear !== undefined) updateData.reportingYear = input.reportingYear;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.boundaryType !== undefined) updateData.boundaryType = input.boundaryType;
        if (input.standardVersion !== undefined) updateData.standardVersion = input.standardVersion;

        const [updatedProject] = await db
          .update(iso14064Projects)
          .set(updateData)
          .where(eq(iso14064Projects.id, input.id))
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
          message: 'Failed to update ISO 14064 project',
        });
      }
    }),

  // Delete ISO 14064 project (cascade will handle related records)
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
          .from(iso14064Projects)
          .where(eq(iso14064Projects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISO 14064 project not found',
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
        await db.delete(iso14064Projects).where(eq(iso14064Projects.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete ISO 14064 project',
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
          .from(iso14064Projects)
          .where(eq(iso14064Projects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISO 14064 project not found',
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
          .update(iso14064Projects)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(iso14064Projects.id, input.id))
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

