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
import { GhgProtocolAICalculator } from '@/lib/ghg-protocol-ai-calculator';

const createCalculationSchema = z.object({
  projectId: z.string().uuid(),
  scope: z.enum(['Scope1', 'Scope2', 'Scope3']),
  category: z.string().min(1, 'Category is required'),
  activityData: z.object({
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    description: z.string().optional(),
    activityName: z.string().optional(),
    activityDate: z.date().optional(),
    location: z.string().optional(),
  }),
  emissionFactor: z.object({
    value: z.number().positive('Emission factor value must be positive'),
    unit: z.string().min(1, 'Emission factor unit is required'),
    source: z.string().optional(),
    gasType: z.string().optional(),
  }).optional(), // If not provided, AI will select
  emissionFactorId: z.string().uuid().optional(),
  gasType: z.enum(['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3']).optional(),
  calculationMethod: z.enum(['tier1', 'tier2', 'tier3', 'custom']).optional(),
  uncertainty: z.number().optional(),
  notes: z.string().nullable().optional().transform(val => val === '' ? null : val),
  evidence: z.string().nullable().optional().transform(val => val === '' ? null : val),
  status: z.enum(['draft', 'calculated', 'verified', 'approved']).default('calculated').optional(),
});

const updateCalculationSchema = z.object({
  id: z.string().uuid(),
  scope: z.enum(['Scope1', 'Scope2', 'Scope3']).optional(),
  category: z.string().min(1, 'Category is required').optional(),
  activityData: z.object({
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    description: z.string().optional(),
    activityName: z.string().optional(),
    activityDate: z.date().optional(),
    location: z.string().optional(),
  }).optional(),
  emissionFactor: z.object({
    value: z.number().positive('Emission factor value must be positive'),
    unit: z.string().min(1, 'Emission factor unit is required'),
    source: z.string().optional(),
    gasType: z.string().optional(),
  }).optional(),
  emissionFactorId: z.string().uuid().optional(),
  gasType: z.enum(['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3']).optional(),
  calculationMethod: z.enum(['tier1', 'tier2', 'tier3', 'custom']).optional(),
  uncertainty: z.number().optional(),
  notes: z.string().nullable().optional().transform(val => val === '' ? null : val),
  evidence: z.string().nullable().optional().transform(val => val === '' ? null : val),
  status: z.enum(['draft', 'calculated', 'verified', 'approved']).optional(),
});

/**
 * Update project summary based on all calculations
 */
async function updateProjectSummary(projectId: string) {
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
    await db
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
      .where(eq(ghgProtocolProjectSummaries.projectId, projectId));
  } else {
    // Create new summary
    await db.insert(ghgProtocolProjectSummaries).values({
      projectId,
      scope1Total: scope1Total.toString(),
      scope2Total: scope2Total.toString(),
      scope3Total: scope3Total.toString(),
      totalCo2e: totalCo2e.toString(),
      breakdownByGas: breakdownByGas,
      breakdownByCategory: breakdownByCategory,
      scope3Breakdown: scope3Breakdown,
    });
  }
}

export const ghgProtocolCalculationsRouter = createTRPCRouter({
  // Create new carbon calculation
  create: protectedProcedure
    .input(createCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project with tenant validation
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

        // Calculate using AI calculator
        const calculationResult = await GhgProtocolAICalculator.calculate({
          quantity: input.activityData.quantity,
          unit: input.activityData.unit,
          scope: input.scope,
          category: input.category,
          activityName: input.activityData.activityName,
          activityDescription: input.activityData.description,
          gasType: input.gasType,
          emissionFactor: input.emissionFactor,
          calculationMethod: input.calculationMethod,
        });

        // Save calculation to database
        const [newCalculation] = await db
          .insert(ghgProtocolCalculations)
          .values({
            projectId: input.projectId,
            emissionFactorId: input.emissionFactorId || null,
            scope: input.scope,
            category: input.category,
            activityData: input.activityData,
            emissionFactor: calculationResult.emissionFactor,
            gasType: calculationResult.gasType,
            emissionValue: calculationResult.emissionValue.toString(),
            co2Equivalent: calculationResult.co2Equivalent.toString(),
            gwpValue: calculationResult.gwpValue.toString(),
            calculationMethod: calculationResult.calculationMethod,
            uncertainty: input.uncertainty?.toString(),
            notes: input.notes,
            evidence: input.evidence,
            status: input.status || 'calculated',
          })
          .returning();

        // Update project summary
        await updateProjectSummary(input.projectId);

        return {
          success: true,
          calculation: newCalculation,
          details: {
            gasType: calculationResult.gasType,
            emissionValue: calculationResult.emissionValue,
            co2Equivalent: calculationResult.co2Equivalent,
            gwpValue: calculationResult.gwpValue,
            calculationMethod: calculationResult.calculationMethod,
            explanation: calculationResult.explanation,
            reasoning: calculationResult.reasoning,
            formula: calculationResult.formula,
            emissionFactor: calculationResult.emissionFactor,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating GHG Protocol calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create calculation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }),

  // Get calculation by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get calculation
      const calculation = await db
        .select()
        .from(ghgProtocolCalculations)
        .where(eq(ghgProtocolCalculations.id, input.id))
        .limit(1);

      if (calculation.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'GHG Protocol calculation not found',
        });
      }

      // Get project to check tenant access
      const project = await db
        .select()
        .from(ghgProtocolProjects)
        .where(eq(ghgProtocolProjects.id, calculation[0].projectId))
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
          message: 'Access denied to this calculation',
        });
      }

      return {
        calculation: calculation[0],
      };
    }),

  // Get all calculations for a project
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

      // Get all calculations for this project
      const calculations = await db
        .select()
        .from(ghgProtocolCalculations)
        .where(eq(ghgProtocolCalculations.projectId, input.projectId))
        .orderBy(desc(ghgProtocolCalculations.calculatedAt));

      return { calculations };
    }),

  // Update calculation (recalculate if activity data changed)
  update: protectedProcedure
    .input(updateCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get existing calculation
        const existingCalculation = await db
          .select()
          .from(ghgProtocolCalculations)
          .where(eq(ghgProtocolCalculations.id, input.id))
          .limit(1);

        if (existingCalculation.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'GHG Protocol calculation not found',
          });
        }

        // Get project to check tenant access
        const project = await db
          .select()
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, existingCalculation[0].projectId))
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
            message: 'Access denied to this calculation',
          });
        }

        // Check if we need to recalculate (activity data, emission factor, or gas type changed)
        const needsRecalculation =
          input.activityData !== undefined ||
          input.emissionFactor !== undefined ||
          input.gasType !== undefined ||
          input.scope !== undefined ||
          input.category !== undefined;

        let calculationResult;

        if (needsRecalculation) {
          const activityData = input.activityData || (existingCalculation[0].activityData as any);
          const scope = input.scope || existingCalculation[0].scope;
          const category = input.category || existingCalculation[0].category;
          const emissionFactor = input.emissionFactor || (existingCalculation[0].emissionFactor as any);
          const gasType = input.gasType || existingCalculation[0].gasType;

          // Recalculate using AI
          calculationResult = await GhgProtocolAICalculator.calculate({
            quantity: activityData.quantity,
            unit: activityData.unit,
            scope: scope as any,
            category: category,
            activityName: activityData.activityName,
            activityDescription: activityData.description,
            gasType: gasType as any,
            emissionFactor: emissionFactor,
            calculationMethod: input.calculationMethod,
          });
        }

        // Update calculation
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.scope !== undefined) updateData.scope = input.scope;
        if (input.category !== undefined) updateData.category = input.category;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.evidence !== undefined) updateData.evidence = input.evidence;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.uncertainty !== undefined) updateData.uncertainty = input.uncertainty.toString();
        if (input.calculationMethod !== undefined) updateData.calculationMethod = input.calculationMethod;
        if (input.emissionFactorId !== undefined) updateData.emissionFactorId = input.emissionFactorId || null;

        if (needsRecalculation && calculationResult) {
          const activityData = input.activityData || (existingCalculation[0].activityData as any);

          updateData.activityData = activityData;
          updateData.emissionFactor = calculationResult.emissionFactor;
          updateData.gasType = calculationResult.gasType;
          updateData.emissionValue = calculationResult.emissionValue.toString();
          updateData.co2Equivalent = calculationResult.co2Equivalent.toString();
          updateData.gwpValue = calculationResult.gwpValue.toString();
          updateData.calculationMethod = calculationResult.calculationMethod;
          updateData.calculatedAt = new Date();
        }

        const [updatedCalculation] = await db
          .update(ghgProtocolCalculations)
          .set(updateData)
          .where(eq(ghgProtocolCalculations.id, input.id))
          .returning();

        // Update project summary
        await updateProjectSummary(existingCalculation[0].projectId);

        return {
          success: true,
          calculation: updatedCalculation,
          recalculated: needsRecalculation,
          details: needsRecalculation && calculationResult ? {
            gasType: calculationResult.gasType,
            emissionValue: calculationResult.emissionValue,
            co2Equivalent: calculationResult.co2Equivalent,
            gwpValue: calculationResult.gwpValue,
            calculationMethod: calculationResult.calculationMethod,
            explanation: calculationResult.explanation,
            reasoning: calculationResult.reasoning,
            formula: calculationResult.formula,
          } : undefined,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update calculation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }),

  // Delete calculation
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get existing calculation
        const existingCalculation = await db
          .select()
          .from(ghgProtocolCalculations)
          .where(eq(ghgProtocolCalculations.id, input.id))
          .limit(1);

        if (existingCalculation.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'GHG Protocol calculation not found',
          });
        }

        const projectId = existingCalculation[0].projectId;

        // Get project to check tenant access
        const project = await db
          .select()
          .from(ghgProtocolProjects)
          .where(eq(ghgProtocolProjects.id, projectId))
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
            message: 'Access denied to this calculation',
          });
        }

        // Delete calculation
        await db
          .delete(ghgProtocolCalculations)
          .where(eq(ghgProtocolCalculations.id, input.id));

        // Update project summary
        await updateProjectSummary(projectId);

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete calculation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }),
});

