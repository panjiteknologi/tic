import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import { isccProject, isccProcessing } from '@/db/schema/iscc-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createIsccProcessingSchema = z.object({
  projectId: z.string().uuid(),
  electricityUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  steamUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  naturalGasUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  dieselUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  methanol: z.string().nullable().optional().transform(val => val === '' ? null : val),
  catalyst: z.string().nullable().optional().transform(val => val === '' ? null : val),
  acid: z.string().nullable().optional().transform(val => val === '' ? null : val),
  waterConsumption: z.string().nullable().optional().transform(val => val === '' ? null : val),
  additionalData: z.any().optional(),
});

const updateIsccProcessingSchema = z.object({
  id: z.string().uuid(),
  electricityUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  steamUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  naturalGasUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  dieselUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  methanol: z.string().nullable().optional().transform(val => val === '' ? null : val),
  catalyst: z.string().nullable().optional().transform(val => val === '' ? null : val),
  acid: z.string().nullable().optional().transform(val => val === '' ? null : val),
  waterConsumption: z.string().nullable().optional().transform(val => val === '' ? null : val),
  additionalData: z.any().optional(),
});

export const isccProcessingRouter = createTRPCRouter({
  // Create processing data
  create: protectedProcedure
    .input(createIsccProcessingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if project exists and user has access
        const project = await db
          .select()
          .from(isccProject)
          .where(eq(isccProject.id, input.projectId))
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

        // Check if processing data already exists
        const existing = await db
          .select()
          .from(isccProcessing)
          .where(eq(isccProcessing.projectId, input.projectId))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Processing data already exists for this project. Use update instead.',
          });
        }

        const [newProcessing] = await db
          .insert(isccProcessing)
          .values({
            projectId: input.projectId,
            electricityUse: input.electricityUse,
            steamUse: input.steamUse,
            naturalGasUse: input.naturalGasUse,
            dieselUse: input.dieselUse,
            methanol: input.methanol,
            catalyst: input.catalyst,
            acid: input.acid,
            waterConsumption: input.waterConsumption,
            additionalData: input.additionalData,
          })
          .returning();

        return {
          success: true,
          processing: newProcessing,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating ISCC processing:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create ISCC processing data',
          cause: error,
        });
      }
    }),

  // Update processing data
  update: protectedProcedure
    .input(updateIsccProcessingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if processing exists
        const existing = await db
          .select()
          .from(isccProcessing)
          .where(eq(isccProcessing.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC processing data not found',
          });
        }

        // Get project to check tenant access
        const project = await db
          .select()
          .from(isccProject)
          .where(eq(isccProject.id, existing[0].projectId))
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

        // Update processing
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.electricityUse !== undefined) updateData.electricityUse = input.electricityUse;
        if (input.steamUse !== undefined) updateData.steamUse = input.steamUse;
        if (input.naturalGasUse !== undefined) updateData.naturalGasUse = input.naturalGasUse;
        if (input.dieselUse !== undefined) updateData.dieselUse = input.dieselUse;
        if (input.methanol !== undefined) updateData.methanol = input.methanol;
        if (input.catalyst !== undefined) updateData.catalyst = input.catalyst;
        if (input.acid !== undefined) updateData.acid = input.acid;
        if (input.waterConsumption !== undefined) updateData.waterConsumption = input.waterConsumption;
        if (input.additionalData !== undefined) updateData.additionalData = input.additionalData;

        const [updatedProcessing] = await db
          .update(isccProcessing)
          .set(updateData)
          .where(eq(isccProcessing.id, input.id))
          .returning();

        return {
          success: true,
          processing: updatedProcessing,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update ISCC processing data',
        });
      }
    }),

  // Get processing by project ID
  getByProjectId: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get project to check tenant access
      const project = await db
        .select()
        .from(isccProject)
        .where(eq(isccProject.id, input.projectId))
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

      // Get processing data
      const processing = await db
        .select()
        .from(isccProcessing)
        .where(eq(isccProcessing.projectId, input.projectId))
        .limit(1);

      return { processing: processing[0] || null };
    }),

  // Delete processing data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if processing exists
        const existing = await db
          .select()
          .from(isccProcessing)
          .where(eq(isccProcessing.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC processing data not found',
          });
        }

        // Get project to check tenant access
        const project = await db
          .select()
          .from(isccProject)
          .where(eq(isccProject.id, existing[0].projectId))
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

        // Delete processing
        await db.delete(isccProcessing).where(eq(isccProcessing.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete ISCC processing data',
        });
      }
    }),
});

