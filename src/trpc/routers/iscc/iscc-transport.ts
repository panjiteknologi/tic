import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import { isccProject, isccTransport } from '@/db/schema/iscc-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

const createIsccTransportSchema = z.object({
  projectId: z.string().uuid(),
  feedstockDistance: z.string().nullable().optional().transform(val => val === '' ? null : val),
  feedstockMode: z.enum(['truck', 'ship', 'rail', 'pipeline']).nullable().optional(),
  feedstockWeight: z.string().nullable().optional().transform(val => val === '' ? null : val),
  productDistance: z.string().nullable().optional().transform(val => val === '' ? null : val),
  productMode: z.enum(['truck', 'ship', 'rail', 'pipeline']).nullable().optional(),
  productWeight: z.string().nullable().optional().transform(val => val === '' ? null : val),
  additionalTransport: z.any().optional(),
});

const updateIsccTransportSchema = z.object({
  id: z.string().uuid(),
  feedstockDistance: z.string().nullable().optional().transform(val => val === '' ? null : val),
  feedstockMode: z.enum(['truck', 'ship', 'rail', 'pipeline']).nullable().optional(),
  feedstockWeight: z.string().nullable().optional().transform(val => val === '' ? null : val),
  productDistance: z.string().nullable().optional().transform(val => val === '' ? null : val),
  productMode: z.enum(['truck', 'ship', 'rail', 'pipeline']).nullable().optional(),
  productWeight: z.string().nullable().optional().transform(val => val === '' ? null : val),
  additionalTransport: z.any().optional(),
});

export const isccTransportRouter = createTRPCRouter({
  // Create transport data
  create: protectedProcedure
    .input(createIsccTransportSchema)
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

        // Check if transport data already exists
        const existing = await db
          .select()
          .from(isccTransport)
          .where(eq(isccTransport.projectId, input.projectId))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Transport data already exists for this project. Use update instead.',
          });
        }

        const [newTransport] = await db
          .insert(isccTransport)
          .values({
            projectId: input.projectId,
            feedstockDistance: input.feedstockDistance,
            feedstockMode: input.feedstockMode,
            feedstockWeight: input.feedstockWeight,
            productDistance: input.productDistance,
            productMode: input.productMode,
            productWeight: input.productWeight,
            additionalTransport: input.additionalTransport,
          })
          .returning();

        return {
          success: true,
          transport: newTransport,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating ISCC transport:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create ISCC transport data',
          cause: error,
        });
      }
    }),

  // Update transport data
  update: protectedProcedure
    .input(updateIsccTransportSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if transport exists
        const existing = await db
          .select()
          .from(isccTransport)
          .where(eq(isccTransport.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC transport data not found',
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

        // Update transport
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.feedstockDistance !== undefined) updateData.feedstockDistance = input.feedstockDistance;
        if (input.feedstockMode !== undefined) updateData.feedstockMode = input.feedstockMode;
        if (input.feedstockWeight !== undefined) updateData.feedstockWeight = input.feedstockWeight;
        if (input.productDistance !== undefined) updateData.productDistance = input.productDistance;
        if (input.productMode !== undefined) updateData.productMode = input.productMode;
        if (input.productWeight !== undefined) updateData.productWeight = input.productWeight;
        if (input.additionalTransport !== undefined) updateData.additionalTransport = input.additionalTransport;

        const [updatedTransport] = await db
          .update(isccTransport)
          .set(updateData)
          .where(eq(isccTransport.id, input.id))
          .returning();

        return {
          success: true,
          transport: updatedTransport,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update ISCC transport data',
        });
      }
    }),

  // Get transport by project ID
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

      // Get transport data
      const transport = await db
        .select()
        .from(isccTransport)
        .where(eq(isccTransport.projectId, input.projectId))
        .limit(1);

      return { transport: transport[0] || null };
    }),

  // Delete transport data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if transport exists
        const existing = await db
          .select()
          .from(isccTransport)
          .where(eq(isccTransport.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC transport data not found',
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

        // Delete transport
        await db.delete(isccTransport).where(eq(isccTransport.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete ISCC transport data',
        });
      }
    }),
});

