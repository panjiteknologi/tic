import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  ghgProtocolProjects,
  ghgProtocolCalculations,
  ghgProtocolProjectSummaries
} from '@/db/schema/ghg-protocol-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createGhgProtocolProjectSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organizationName: z.string().nullable().optional().transform(val => val === '' ? null : val),
  location: z.string().nullable().optional().transform(val => val === '' ? null : val),
  reportingPeriodStart: z.date(),
  reportingPeriodEnd: z.date(),
  reportingYear: z.string().length(4, 'Reporting year must be 4 characters (e.g., "2024")'),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft').optional(),
  boundaryType: z.enum(['operational', 'financial', 'other']).default('operational').optional(),
  standardVersion: z.string().default('GHG Protocol Corporate Standard').optional(),
});

const updateGhgProtocolProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organizationName: z.string().nullable().optional().transform(val => val === '' ? null : val),
  location: z.string().nullable().optional().transform(val => val === '' ? null : val),
  reportingPeriodStart: z.date().optional(),
  reportingPeriodEnd: z.date().optional(),
  reportingYear: z.string().length(4, 'Reporting year must be 4 characters').optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  boundaryType: z.enum(['operational', 'financial', 'other']).optional(),
  standardVersion: z.string().optional(),
});

export const ghgProtocolProjectsRouter = createTRPCRouter({
  // Create new GHG Protocol project
  create: protectedProcedure
    .input(createGhgProtocolProjectSchema)
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
          .insert(ghgProtocolProjects)
          .values({
            tenantId: input.tenantId,
            name: input.name,
            description: input.description,
            organizationName: input.organizationName,
            location: input.location,
            reportingPeriodStart: input.reportingPeriodStart,
            reportingPeriodEnd: input.reportingPeriodEnd,
            reportingYear: input.reportingYear,
            status: input.status || 'draft',
            boundaryType: input.boundaryType || 'operational',
            standardVersion: input.standardVersion || 'GHG Protocol Corporate Standard',
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
        console.error('Error creating GHG Protocol project:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create GHG Protocol project',
          cause: error,
        });
      }
    }),

  // Get GHG Protocol project by ID with relations
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
        .from(ghgProtocolProjects)
        .where(eq(ghgProtocolProjects.id, input.id))
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'GHG Protocol project not found',
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
        .from(ghgProtocolCalculations)
        .where(eq(ghgProtocolCalculations.projectId, input.id))
        .orderBy(desc(ghgProtocolCalculations.calculatedAt));

      const summaries = await db
        .select()
        .from(ghgProtocolProjectSummaries)
        .where(eq(ghgProtocolProjectSummaries.projectId, input.id))
        .limit(1);

      return {
        project: project[0],
        calculations: calculations || [],
        summary: summaries[0] || null,
      };
    }),

  // Get all GHG Protocol projects for a tenant
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
          id: ghgProtocolProjects.id,
          tenantId: ghgProtocolProjects.tenantId,
          name: ghgProtocolProjects.name,
          description: ghgProtocolProjects.description,
          organizationName: ghgProtocolProjects.organizationName,
          location: ghgProtocolProjects.location,
          reportingPeriodStart: ghgProtocolProjects.reportingPeriodStart,
          reportingPeriodEnd: ghgProtocolProjects.reportingPeriodEnd,
          reportingYear: ghgProtocolProjects.reportingYear,
          status: ghgProtocolProjects.status,
          boundaryType: ghgProtocolProjects.boundaryType,
          standardVersion: ghgProtocolProjects.standardVersion,
          createdAt: ghgProtocolProjects.createdAt,
          updatedAt: ghgProtocolProjects.updatedAt,
        })
        .from(ghgProtocolProjects)
        .where(eq(ghgProtocolProjects.tenantId, input.tenantId))
        .orderBy(desc(ghgProtocolProjects.createdAt));

      return { projects };
    }),

  // Update GHG Protocol project
  update: protectedProcedure
    .input(updateGhgProtocolProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'GHG Protocol project not found',
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
        if (input.location !== undefined) updateData.location = input.location;
        if (input.reportingPeriodStart !== undefined) updateData.reportingPeriodStart = input.reportingPeriodStart;
        if (input.reportingPeriodEnd !== undefined) updateData.reportingPeriodEnd = input.reportingPeriodEnd;
        if (input.reportingYear !== undefined) updateData.reportingYear = input.reportingYear;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.boundaryType !== undefined) updateData.boundaryType = input.boundaryType;
        if (input.standardVersion !== undefined) updateData.standardVersion = input.standardVersion;

        const [updatedProject] = await db
          .update(ghgProtocolProjects)
          .set(updateData)
          .where(eq(ghgProtocolProjects.id, input.id))
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
          message: 'Failed to update GHG Protocol project',
        });
      }
    }),

  // Delete GHG Protocol project (cascade will handle related records)
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
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'GHG Protocol project not found',
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
        await db.delete(ghgProtocolProjects).where(eq(ghgProtocolProjects.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete GHG Protocol project',
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
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'GHG Protocol project not found',
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
          .update(ghgProtocolProjects)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(ghgProtocolProjects.id, input.id))
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

