import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  isccProject,
  isccCultivation,
  isccProcessing,
  isccTransport,
  isccCalculation
} from '@/db/schema/iscc-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createIsccProjectSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  productType: z.enum(['biodiesel', 'bioethanol', 'biomass', 'biomethane', 'bio_jet_fuel', 'other']),
  feedstockType: z.enum(['palm_oil', 'corn', 'sugarcane', 'used_cooking_oil', 'wheat', 'rapeseed', 'soybean', 'waste', 'other']),
  productionVolume: z.string().nullable().optional().transform(val => val === '' ? null : val),
  lhv: z.string().nullable().optional().transform(val => val === '' ? null : val),
  lhvUnit: z.string().default('MJ/kg').optional(),
});

const updateIsccProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  productType: z.enum(['biodiesel', 'bioethanol', 'biomass', 'biomethane', 'bio_jet_fuel', 'other']).optional(),
  feedstockType: z.enum(['palm_oil', 'corn', 'sugarcane', 'used_cooking_oil', 'wheat', 'rapeseed', 'soybean', 'waste', 'other']).optional(),
  productionVolume: z.string().nullable().optional().transform(val => val === '' ? null : val),
  lhv: z.string().nullable().optional().transform(val => val === '' ? null : val),
  lhvUnit: z.string().optional(),
  status: z.enum(['draft', 'calculated', 'verified', 'approved']).optional(),
});

export const isccProjectsRouter = createTRPCRouter({
  // Create new ISCC project
  create: protectedProcedure
    .input(createIsccProjectSchema)
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

        const userId = ctx.user?.id;
        const createdBy =
          userId && z.string().uuid().safeParse(userId).success ? userId : null;

        const [newProject] = await db
          .insert(isccProject)
          .values({
            tenantId: input.tenantId,
            name: input.name,
            description: input.description,
            productType: input.productType,
            feedstockType: input.feedstockType,
            productionVolume: input.productionVolume,
            lhv: input.lhv,
            lhvUnit: input.lhvUnit || 'MJ/kg',
            status: 'draft',
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
        console.error('Error creating ISCC project:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create ISCC project',
          cause: error,
        });
      }
    }),

  // Get ISCC project by ID with relations
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
        .from(isccProject)
        .where(eq(isccProject.id, input.id))
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ISCC project not found',
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
      const cultivation = await db
        .select()
        .from(isccCultivation)
        .where(eq(isccCultivation.projectId, input.id))
        .limit(1);

      const processing = await db
        .select()
        .from(isccProcessing)
        .where(eq(isccProcessing.projectId, input.id))
        .limit(1);

      const transport = await db
        .select()
        .from(isccTransport)
        .where(eq(isccTransport.projectId, input.id))
        .limit(1);

      const calculations = await db
        .select()
        .from(isccCalculation)
        .where(eq(isccCalculation.projectId, input.id))
        .orderBy(isccCalculation.calculatedAt);

      return {
        project: project[0],
        cultivation: cultivation[0] || null,
        processing: processing[0] || null,
        transport: transport[0] || null,
        calculations: calculations || [],
      };
    }),

  // Get all ISCC projects for a tenant
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
          id: isccProject.id,
          tenantId: isccProject.tenantId,
          name: isccProject.name,
          description: isccProject.description,
          productType: isccProject.productType,
          feedstockType: isccProject.feedstockType,
          productionVolume: isccProject.productionVolume,
          lhv: isccProject.lhv,
          lhvUnit: isccProject.lhvUnit,
          status: isccProject.status,
          createdAt: isccProject.createdAt,
          updatedAt: isccProject.updatedAt,
        })
        .from(isccProject)
        .where(eq(isccProject.tenantId, input.tenantId))
        .orderBy(isccProject.createdAt);

      return { projects };
    }),

  // Update ISCC project
  update: protectedProcedure
    .input(updateIsccProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(isccProject)
          .where(eq(isccProject.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC project not found',
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

        // Update project
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.productType !== undefined) updateData.productType = input.productType;
        if (input.feedstockType !== undefined) updateData.feedstockType = input.feedstockType;
        if (input.productionVolume !== undefined) updateData.productionVolume = input.productionVolume;
        if (input.lhv !== undefined) updateData.lhv = input.lhv;
        if (input.lhvUnit !== undefined) updateData.lhvUnit = input.lhvUnit;
        if (input.status !== undefined) updateData.status = input.status;

        const [updatedProject] = await db
          .update(isccProject)
          .set(updateData)
          .where(eq(isccProject.id, input.id))
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
          message: 'Failed to update ISCC project',
        });
      }
    }),

  // Delete ISCC project (cascade will handle related records)
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
          .from(isccProject)
          .where(eq(isccProject.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC project not found',
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
        await db.delete(isccProject).where(eq(isccProject.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete ISCC project',
        });
      }
    }),
});

