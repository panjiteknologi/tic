import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  defraProjects,
  defraCarbonCalculations,
  defraProjectSummaries
} from '@/db/schema/defra-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

/**
 * Recalculate project summary from all calculations
 */
async function recalculateSummary(projectId: string) {
  // Get all calculations for this project
  const calculations = await db
    .select()
    .from(defraCarbonCalculations)
    .where(eq(defraCarbonCalculations.projectId, projectId));

  // Aggregate by scope
  const scope1Total = calculations
    .filter(c => c.scope === 'Scope 1')
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const scope2Total = calculations
    .filter(c => c.scope === 'Scope 2')
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const scope3Total = calculations
    .filter(c => c.scope === 'Scope 3')
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  // Aggregate by category (level1Category from emission factor)
  // We'll use the category field from calculations
  const fuelsTotal = calculations
    .filter(c => {
      const cat = (c.category || '').toLowerCase();
      return cat.includes('fuel') || 
             cat.includes('gas') ||
             cat.includes('petrol') ||
             cat.includes('diesel') ||
             cat.includes('natural gas') ||
             cat.includes('lpg');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const businessTravelTotal = calculations
    .filter(c => {
      const cat = (c.category || '').toLowerCase();
      return cat.includes('travel') ||
             cat.includes('flight') ||
             cat.includes('vehicle') ||
             cat.includes('car') ||
             cat.includes('road') ||
             cat.includes('rail') ||
             cat.includes('business travel');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const materialUseTotal = calculations
    .filter(c => {
      const cat = (c.category || '').toLowerCase();
      return cat.includes('material') ||
             cat.includes('paper') ||
             cat.includes('plastic') ||
             cat.includes('metal') ||
             cat.includes('aluminium') ||
             cat.includes('steel');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const wasteTotal = calculations
    .filter(c => {
      const cat = (c.category || '').toLowerCase();
      return cat.includes('waste') ||
             cat.includes('landfill') ||
             cat.includes('recycling') ||
             cat.includes('incineration') ||
             cat.includes('composting');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  // Total CO2e
  const totalCo2e = calculations.reduce(
    (sum, c) => sum + parseFloat(c.totalCo2e || '0'),
    0
  );

  // Check if summary exists
  const existingSummary = await db
    .select()
    .from(defraProjectSummaries)
    .where(eq(defraProjectSummaries.projectId, projectId))
    .limit(1);

  if (existingSummary.length > 0) {
    // Update existing summary
    const [updatedSummary] = await db
      .update(defraProjectSummaries)
      .set({
        scope1Total: scope1Total.toString(),
        scope2Total: scope2Total.toString(),
        scope3Total: scope3Total.toString(),
        fuelsTotal: fuelsTotal.toString(),
        businessTravelTotal: businessTravelTotal.toString(),
        materialUseTotal: materialUseTotal.toString(),
        wasteTotal: wasteTotal.toString(),
        totalCo2e: totalCo2e.toString(),
        updatedAt: new Date(),
      })
      .where(eq(defraProjectSummaries.projectId, projectId))
      .returning();

    return updatedSummary;
  } else {
    // Create new summary
    const [newSummary] = await db
      .insert(defraProjectSummaries)
      .values({
        projectId,
        scope1Total: scope1Total.toString(),
        scope2Total: scope2Total.toString(),
        scope3Total: scope3Total.toString(),
        fuelsTotal: fuelsTotal.toString(),
        businessTravelTotal: businessTravelTotal.toString(),
        materialUseTotal: materialUseTotal.toString(),
        wasteTotal: wasteTotal.toString(),
        totalCo2e: totalCo2e.toString(),
      })
      .returning();

    return newSummary;
  }
}

export const defraProjectSummariesRouter = createTRPCRouter({
  // Get summary for a project
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
        .from(defraProjects)
        .where(eq(defraProjects.id, input.projectId))
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

      // Get summary
      const summary = await db
        .select()
        .from(defraProjectSummaries)
        .where(eq(defraProjectSummaries.projectId, input.projectId))
        .limit(1);

      // If no summary exists, create one
      if (summary.length === 0) {
        const newSummary = await recalculateSummary(input.projectId);
        return { summary: newSummary };
      }

      return { summary: summary[0] };
    }),

  // Recalculate summary from all calculations
  recalculate: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project to check tenant access
        const project = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, input.projectId))
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

        // Recalculate summary
        const summary = await recalculateSummary(input.projectId);

        return {
          success: true,
          summary,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to recalculate summary: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }),

  // Update summary manually (usually not needed, but available for edge cases)
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        scope1Total: z.number().optional(),
        scope2Total: z.number().optional(),
        scope3Total: z.number().optional(),
        fuelsTotal: z.number().optional(),
        businessTravelTotal: z.number().optional(),
        materialUseTotal: z.number().optional(),
        wasteTotal: z.number().optional(),
        totalCo2e: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project to check tenant access
        const project = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, input.projectId))
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

        // Check if summary exists
        const existingSummary = await db
          .select()
          .from(defraProjectSummaries)
          .where(eq(defraProjectSummaries.projectId, input.projectId))
          .limit(1);

        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.scope1Total !== undefined) updateData.scope1Total = input.scope1Total.toString();
        if (input.scope2Total !== undefined) updateData.scope2Total = input.scope2Total.toString();
        if (input.scope3Total !== undefined) updateData.scope3Total = input.scope3Total.toString();
        if (input.fuelsTotal !== undefined) updateData.fuelsTotal = input.fuelsTotal.toString();
        if (input.businessTravelTotal !== undefined) updateData.businessTravelTotal = input.businessTravelTotal.toString();
        if (input.materialUseTotal !== undefined) updateData.materialUseTotal = input.materialUseTotal.toString();
        if (input.wasteTotal !== undefined) updateData.wasteTotal = input.wasteTotal.toString();
        if (input.totalCo2e !== undefined) updateData.totalCo2e = input.totalCo2e.toString();

        if (existingSummary.length > 0) {
          // Update existing summary
          const [updatedSummary] = await db
            .update(defraProjectSummaries)
            .set(updateData)
            .where(eq(defraProjectSummaries.projectId, input.projectId))
            .returning();

          return {
            success: true,
            summary: updatedSummary,
          };
        } else {
          // Create new summary
          const [newSummary] = await db
            .insert(defraProjectSummaries)
            .values({
              projectId: input.projectId,
              scope1Total: (input.scope1Total ?? 0).toString(),
              scope2Total: (input.scope2Total ?? 0).toString(),
              scope3Total: (input.scope3Total ?? 0).toString(),
              fuelsTotal: (input.fuelsTotal ?? 0).toString(),
              businessTravelTotal: (input.businessTravelTotal ?? 0).toString(),
              materialUseTotal: (input.materialUseTotal ?? 0).toString(),
              wasteTotal: (input.wasteTotal ?? 0).toString(),
              totalCo2e: (input.totalCo2e ?? 0).toString(),
            })
            .returning();

          return {
            success: true,
            summary: newSummary,
          };
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update summary: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }),
});

