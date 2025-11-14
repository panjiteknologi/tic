import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  ghgProtocolProjects,
  ghgProtocolCalculations,
  ghgProtocolProjectSummaries
} from '@/db/schema/ghg-protocol-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';

/**
 * Recalculate project summary from all calculations
 */
async function recalculateSummary(projectId: string) {
  // Get all calculations for this project
  const calculations = await db
    .select()
    .from(ghgProtocolCalculations)
    .where(eq(ghgProtocolCalculations.projectId, projectId));

  // Aggregate by scope
  const scope1Total = calculations
    .filter(c => c.scope === 'Scope1')
    .reduce((sum, c) => sum + parseFloat(c.co2Equivalent || '0'), 0);

  const scope2Total = calculations
    .filter(c => c.scope === 'Scope2')
    .reduce((sum, c) => sum + parseFloat(c.co2Equivalent || '0'), 0);

  const scope3Total = calculations
    .filter(c => c.scope === 'Scope3')
    .reduce((sum, c) => sum + parseFloat(c.co2Equivalent || '0'), 0);

  // Total CO2e
  const totalCo2e = calculations.reduce(
    (sum, c) => sum + parseFloat(c.co2Equivalent || '0'),
    0
  );

  // Breakdown by gas type
  const breakdownByGas: Record<string, number> = {};
  calculations.forEach(c => {
    const gasType = c.gasType || 'CO2';
    const value = parseFloat(c.co2Equivalent || '0');
    breakdownByGas[gasType] = (breakdownByGas[gasType] || 0) + value;
  });

  // Breakdown by category
  const breakdownByCategory: Record<string, number> = {};
  calculations.forEach(c => {
    const category = c.category || 'Unknown';
    const value = parseFloat(c.co2Equivalent || '0');
    breakdownByCategory[category] = (breakdownByCategory[category] || 0) + value;
  });

  // Breakdown by Scope 3 categories (for Scope 3 calculations)
  const scope3Breakdown: Record<string, number> = {};
  calculations
    .filter(c => c.scope === 'Scope3')
    .forEach(c => {
      const category = c.category || 'Unknown';
      const value = parseFloat(c.co2Equivalent || '0');
      scope3Breakdown[category] = (scope3Breakdown[category] || 0) + value;
    });

  // Check if summary exists
  const existingSummary = await db
    .select()
    .from(ghgProtocolProjectSummaries)
    .where(eq(ghgProtocolProjectSummaries.projectId, projectId))
    .limit(1);

  if (existingSummary.length > 0) {
    // Update existing summary
    const [updatedSummary] = await db
      .update(ghgProtocolProjectSummaries)
      .set({
        scope1Total: scope1Total.toString(),
        scope2Total: scope2Total.toString(),
        scope3Total: scope3Total.toString(),
        totalCo2e: totalCo2e.toString(),
        breakdownByGas: breakdownByGas,
        breakdownByCategory: breakdownByCategory,
        scope3Breakdown: scope3Breakdown,
        updatedAt: new Date(),
      })
      .where(eq(ghgProtocolProjectSummaries.projectId, projectId))
      .returning();

    return updatedSummary;
  } else {
    // Create new summary
    const [newSummary] = await db
      .insert(ghgProtocolProjectSummaries)
      .values({
        projectId,
        scope1Total: scope1Total.toString(),
        scope2Total: scope2Total.toString(),
        scope3Total: scope3Total.toString(),
        totalCo2e: totalCo2e.toString(),
        breakdownByGas: breakdownByGas,
        breakdownByCategory: breakdownByCategory,
        scope3Breakdown: scope3Breakdown,
      })
      .returning();

    return newSummary;
  }
}

export const ghgProtocolProjectSummariesRouter = createTRPCRouter({
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
        .from(ghgProtocolProjects)
        .where(eq(ghgProtocolProjects.id, input.projectId))
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

      // Get summary
      const summary = await db
        .select()
        .from(ghgProtocolProjectSummaries)
        .where(eq(ghgProtocolProjectSummaries.projectId, input.projectId))
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
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, input.projectId))
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
        totalCo2e: z.number().optional(),
        breakdownByGas: z.record(z.number()).optional(),
        breakdownByCategory: z.record(z.number()).optional(),
        scope3Breakdown: z.record(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project to check tenant access
        const project = await db
          .select()
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, input.projectId))
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

        // Check if summary exists
        const existingSummary = await db
          .select()
          .from(ghgProtocolProjectSummaries)
          .where(eq(ghgProtocolProjectSummaries.projectId, input.projectId))
          .limit(1);

        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.scope1Total !== undefined) updateData.scope1Total = input.scope1Total.toString();
        if (input.scope2Total !== undefined) updateData.scope2Total = input.scope2Total.toString();
        if (input.scope3Total !== undefined) updateData.scope3Total = input.scope3Total.toString();
        if (input.totalCo2e !== undefined) updateData.totalCo2e = input.totalCo2e.toString();
        if (input.breakdownByGas !== undefined) updateData.breakdownByGas = input.breakdownByGas;
        if (input.breakdownByCategory !== undefined) updateData.breakdownByCategory = input.breakdownByCategory;
        if (input.scope3Breakdown !== undefined) updateData.scope3Breakdown = input.scope3Breakdown;

        if (existingSummary.length > 0) {
          // Update existing summary
          const [updatedSummary] = await db
            .update(ghgProtocolProjectSummaries)
            .set(updateData)
            .where(eq(ghgProtocolProjectSummaries.projectId, input.projectId))
            .returning();

          return {
            success: true,
            summary: updatedSummary,
          };
        } else {
          // Create new summary
          const [newSummary] = await db
            .insert(ghgProtocolProjectSummaries)
            .values({
              projectId: input.projectId,
              scope1Total: (input.scope1Total ?? 0).toString(),
              scope2Total: (input.scope2Total ?? 0).toString(),
              scope3Total: (input.scope3Total ?? 0).toString(),
              totalCo2e: (input.totalCo2e ?? 0).toString(),
              breakdownByGas: input.breakdownByGas || {},
              breakdownByCategory: input.breakdownByCategory || {},
              scope3Breakdown: input.scope3Breakdown || {},
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

