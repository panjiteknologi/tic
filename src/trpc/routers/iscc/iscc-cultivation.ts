import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import { isccProject, isccCultivation } from '@/db/schema/iscc-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createIsccCultivationSchema = z.object({
  projectId: z.string().uuid(),
  landArea: z.string().nullable().optional().transform(val => val === '' ? null : val),
  yield: z.string().nullable().optional().transform(val => val === '' ? null : val),
  nitrogenFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  phosphateFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  potassiumFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organicFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  dieselConsumption: z.string().nullable().optional().transform(val => val === '' ? null : val),
  electricityUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  pesticides: z.string().nullable().optional().transform(val => val === '' ? null : val),
  additionalData: z.any().optional(),
});

const updateIsccCultivationSchema = z.object({
  id: z.string().uuid(),
  landArea: z.string().nullable().optional().transform(val => val === '' ? null : val),
  yield: z.string().nullable().optional().transform(val => val === '' ? null : val),
  nitrogenFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  phosphateFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  potassiumFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  organicFertilizer: z.string().nullable().optional().transform(val => val === '' ? null : val),
  dieselConsumption: z.string().nullable().optional().transform(val => val === '' ? null : val),
  electricityUse: z.string().nullable().optional().transform(val => val === '' ? null : val),
  pesticides: z.string().nullable().optional().transform(val => val === '' ? null : val),
  additionalData: z.any().optional(),
});

export const isccCultivationRouter = createTRPCRouter({
  // Create cultivation data
  create: protectedProcedure
    .input(createIsccCultivationSchema)
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

        // Check if cultivation data already exists
        const existing = await db
          .select()
          .from(isccCultivation)
          .where(eq(isccCultivation.projectId, input.projectId))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cultivation data already exists for this project. Use update instead.',
          });
        }

        const [newCultivation] = await db
          .insert(isccCultivation)
          .values({
            projectId: input.projectId,
            landArea: input.landArea,
            yield: input.yield,
            nitrogenFertilizer: input.nitrogenFertilizer,
            phosphateFertilizer: input.phosphateFertilizer,
            potassiumFertilizer: input.potassiumFertilizer,
            organicFertilizer: input.organicFertilizer,
            dieselConsumption: input.dieselConsumption,
            electricityUse: input.electricityUse,
            pesticides: input.pesticides,
            additionalData: input.additionalData,
          })
          .returning();

        return {
          success: true,
          cultivation: newCultivation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating ISCC cultivation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create ISCC cultivation data',
          cause: error,
        });
      }
    }),

  // Update cultivation data
  update: protectedProcedure
    .input(updateIsccCultivationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if cultivation exists
        const existing = await db
          .select()
          .from(isccCultivation)
          .where(eq(isccCultivation.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC cultivation data not found',
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

        // Update cultivation
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.landArea !== undefined) updateData.landArea = input.landArea;
        if (input.yield !== undefined) updateData.yield = input.yield;
        if (input.nitrogenFertilizer !== undefined) updateData.nitrogenFertilizer = input.nitrogenFertilizer;
        if (input.phosphateFertilizer !== undefined) updateData.phosphateFertilizer = input.phosphateFertilizer;
        if (input.potassiumFertilizer !== undefined) updateData.potassiumFertilizer = input.potassiumFertilizer;
        if (input.organicFertilizer !== undefined) updateData.organicFertilizer = input.organicFertilizer;
        if (input.dieselConsumption !== undefined) updateData.dieselConsumption = input.dieselConsumption;
        if (input.electricityUse !== undefined) updateData.electricityUse = input.electricityUse;
        if (input.pesticides !== undefined) updateData.pesticides = input.pesticides;
        if (input.additionalData !== undefined) updateData.additionalData = input.additionalData;

        const [updatedCultivation] = await db
          .update(isccCultivation)
          .set(updateData)
          .where(eq(isccCultivation.id, input.id))
          .returning();

        return {
          success: true,
          cultivation: updatedCultivation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update ISCC cultivation data',
        });
      }
    }),

  // Get cultivation by project ID
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

      // Get cultivation data
      const cultivation = await db
        .select()
        .from(isccCultivation)
        .where(eq(isccCultivation.projectId, input.projectId))
        .limit(1);

      return { cultivation: cultivation[0] || null };
    }),

  // Delete cultivation data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if cultivation exists
        const existing = await db
          .select()
          .from(isccCultivation)
          .where(eq(isccCultivation.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC cultivation data not found',
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

        // Delete cultivation
        await db.delete(isccCultivation).where(eq(isccCultivation.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete ISCC cultivation data',
        });
      }
    }),
});

