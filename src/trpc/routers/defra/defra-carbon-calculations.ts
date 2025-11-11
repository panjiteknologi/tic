import { z } from 'zod';
import { eq, and, desc, sum, sql } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import {
  defraProjects,
  defraCarbonCalculations,
  defraEmissionFactors,
  defraProjectSummaries
} from '@/db/schema/defra-schema';
import { tenantUser } from '@/db/schema/tenant-schema';
import { TRPCError } from '@trpc/server';
import { DefraAICalculator } from '@/lib/defra-ai-calculator';

const createCalculationSchema = z.object({
  projectId: z.string().uuid(),
  emissionFactorId: z.string().uuid().optional(), // If not provided, AI will select
  activityDate: z.date(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  location: z.string().nullable().optional().transform(val => val === '' ? null : val),
  evidence: z.string().nullable().optional().transform(val => val === '' ? null : val),
  category: z.string().optional(), // For AI selection if emissionFactorId not provided
  activityName: z.string().optional(), // For AI selection
});

const updateCalculationSchema = z.object({
  id: z.string().uuid(),
  emissionFactorId: z.string().uuid().optional(),
  activityDate: z.date().optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  description: z.string().nullable().optional().transform(val => val === '' ? null : val),
  location: z.string().nullable().optional().transform(val => val === '' ? null : val),
  evidence: z.string().nullable().optional().transform(val => val === '' ? null : val),
  category: z.string().optional(),
  activityName: z.string().optional(),
});

/**
 * Update project summary based on all calculations
 */
async function updateProjectSummary(projectId: string) {
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
  const fuelsTotal = calculations
    .filter(c => {
      // We need to get emission factor to check level1Category
      // For now, check category field
      return c.category?.toLowerCase().includes('fuel') || 
             c.category?.toLowerCase().includes('gas') ||
             c.category?.toLowerCase().includes('petrol') ||
             c.category?.toLowerCase().includes('diesel');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const businessTravelTotal = calculations
    .filter(c => {
      return c.category?.toLowerCase().includes('travel') ||
             c.category?.toLowerCase().includes('flight') ||
             c.category?.toLowerCase().includes('vehicle') ||
             c.category?.toLowerCase().includes('car');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const materialUseTotal = calculations
    .filter(c => {
      return c.category?.toLowerCase().includes('material') ||
             c.category?.toLowerCase().includes('paper') ||
             c.category?.toLowerCase().includes('plastic');
    })
    .reduce((sum, c) => sum + parseFloat(c.totalCo2e || '0'), 0);

  const wasteTotal = calculations
    .filter(c => {
      return c.category?.toLowerCase().includes('waste') ||
             c.category?.toLowerCase().includes('landfill') ||
             c.category?.toLowerCase().includes('recycling');
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
    await db
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
      .where(eq(defraProjectSummaries.projectId, projectId));
  } else {
    // Create new summary
    await db.insert(defraProjectSummaries).values({
      projectId,
      scope1Total: scope1Total.toString(),
      scope2Total: scope2Total.toString(),
      scope3Total: scope3Total.toString(),
      fuelsTotal: fuelsTotal.toString(),
      businessTravelTotal: businessTravelTotal.toString(),
      materialUseTotal: materialUseTotal.toString(),
      wasteTotal: wasteTotal.toString(),
      totalCo2e: totalCo2e.toString(),
    });
  }
}

export const defraCarbonCalculationsRouter = createTRPCRouter({
  // Create new carbon calculation with AI
  create: protectedProcedure
    .input(createCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project with tenant validation
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

        // Get emission factor if provided, or let AI select
        let emissionFactor;
        let calculationResult;

        if (input.emissionFactorId) {
          // Use provided emission factor
          const factors = await db
            .select()
            .from(defraEmissionFactors)
            .where(eq(defraEmissionFactors.id, input.emissionFactorId))
            .limit(1);

          if (factors.length === 0) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Emission factor not found',
            });
          }

          emissionFactor = factors[0];

          // Calculate using AI calculator with provided factor
          calculationResult = await DefraAICalculator.calculate({
            quantity: input.quantity,
            unit: input.unit,
            emissionFactorId: input.emissionFactorId,
            defraYear: project[0].defraYear,
            category: input.category,
            activityName: input.activityName,
          });
        } else {
          // Let AI select the factor
          calculationResult = await DefraAICalculator.calculate({
            quantity: input.quantity,
            unit: input.unit,
            defraYear: project[0].defraYear,
            category: input.category || input.activityName,
            activityName: input.activityName,
            level1Category: input.category,
          });

          emissionFactor = calculationResult.emissionFactor;
        }

        // Save calculation to database
        const [newCalculation] = await db
          .insert(defraCarbonCalculations)
          .values({
            projectId: input.projectId,
            emissionFactorId: emissionFactor.id,
            activityDate: input.activityDate,
            quantity: input.quantity.toString(),
            unit: input.unit,
            co2Emissions: calculationResult.co2Emissions.toString(),
            ch4Emissions: calculationResult.ch4Emissions.toString(),
            n2oEmissions: calculationResult.n2oEmissions.toString(),
            totalCo2e: calculationResult.totalCo2e.toString(),
            description: input.description,
            location: input.location,
            evidence: input.evidence,
            category: emissionFactor.level1Category || emissionFactor.activityName,
            scope: emissionFactor.scope || null,
          })
          .returning();

        // Update project summary
        await updateProjectSummary(input.projectId);

        return {
          success: true,
          calculation: newCalculation,
          details: {
            co2Emissions: calculationResult.co2Emissions,
            ch4Emissions: calculationResult.ch4Emissions,
            n2oEmissions: calculationResult.n2oEmissions,
            totalCo2e: calculationResult.totalCo2e,
            explanation: calculationResult.explanation,
            reasoning: calculationResult.reasoning,
            formula: calculationResult.formula,
            emissionFactor: {
              id: emissionFactor.id,
              name: emissionFactor.activityName,
              category: emissionFactor.level1Category,
            },
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating DEFRA calculation:', error);
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
        .from(defraCarbonCalculations)
        .where(eq(defraCarbonCalculations.id, input.id))
        .limit(1);

      if (calculation.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'DEFRA calculation not found',
        });
      }

      // Get project to check tenant access
      const project = await db
        .select()
        .from(defraProjects)
        .where(eq(defraProjects.id, calculation[0].projectId))
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
          message: 'Access denied to this calculation',
        });
      }

      // Get emission factor
      const emissionFactor = await db
        .select()
        .from(defraEmissionFactors)
        .where(eq(defraEmissionFactors.id, calculation[0].emissionFactorId))
        .limit(1);

      return {
        calculation: calculation[0],
        emissionFactor: emissionFactor[0] || null,
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

      // Get all calculations for this project
      const calculations = await db
        .select()
        .from(defraCarbonCalculations)
        .where(eq(defraCarbonCalculations.projectId, input.projectId))
        .orderBy(desc(defraCarbonCalculations.activityDate));

      return { calculations };
    }),

  // Update calculation (recalculate if quantity/unit changed)
  update: protectedProcedure
    .input(updateCalculationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get existing calculation
        const existingCalculation = await db
          .select()
          .from(defraCarbonCalculations)
          .where(eq(defraCarbonCalculations.id, input.id))
          .limit(1);

        if (existingCalculation.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'DEFRA calculation not found',
          });
        }

        // Get project to check tenant access
        const project = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, existingCalculation[0].projectId))
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
            message: 'Access denied to this calculation',
          });
        }

        // Check if we need to recalculate (quantity or unit changed)
        const needsRecalculation =
          input.quantity !== undefined ||
          input.unit !== undefined ||
          input.emissionFactorId !== undefined;

        let calculationResult;
        let emissionFactor;

        if (needsRecalculation) {
          const quantity = input.quantity ?? parseFloat(existingCalculation[0].quantity || '0');
          const unit = input.unit ?? existingCalculation[0].unit;
          const emissionFactorId = input.emissionFactorId ?? existingCalculation[0].emissionFactorId;

          // Recalculate using AI
          calculationResult = await DefraAICalculator.calculate({
            quantity,
            unit,
            emissionFactorId,
            defraYear: project[0].defraYear,
            category: input.category,
            activityName: input.activityName,
          });

          emissionFactor = calculationResult.emissionFactor;
        }

        // Update calculation
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.activityDate !== undefined) updateData.activityDate = input.activityDate;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.location !== undefined) updateData.location = input.location;
        if (input.evidence !== undefined) updateData.evidence = input.evidence;

        if (needsRecalculation && calculationResult) {
          updateData.quantity = input.quantity?.toString() ?? existingCalculation[0].quantity;
          updateData.unit = input.unit ?? existingCalculation[0].unit;
          updateData.emissionFactorId = emissionFactor!.id;
          updateData.co2Emissions = calculationResult.co2Emissions.toString();
          updateData.ch4Emissions = calculationResult.ch4Emissions.toString();
          updateData.n2oEmissions = calculationResult.n2oEmissions.toString();
          updateData.totalCo2e = calculationResult.totalCo2e.toString();
          updateData.category = emissionFactor!.level1Category || emissionFactor!.activityName;
          updateData.scope = emissionFactor!.scope || null;
        }

        const [updatedCalculation] = await db
          .update(defraCarbonCalculations)
          .set(updateData)
          .where(eq(defraCarbonCalculations.id, input.id))
          .returning();

        // Update project summary
        await updateProjectSummary(existingCalculation[0].projectId);

        return {
          success: true,
          calculation: updatedCalculation,
          recalculated: needsRecalculation,
          details: needsRecalculation && calculationResult ? {
            co2Emissions: calculationResult.co2Emissions,
            ch4Emissions: calculationResult.ch4Emissions,
            n2oEmissions: calculationResult.n2oEmissions,
            totalCo2e: calculationResult.totalCo2e,
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
          .from(defraCarbonCalculations)
          .where(eq(defraCarbonCalculations.id, input.id))
          .limit(1);

        if (existingCalculation.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'DEFRA calculation not found',
          });
        }

        const projectId = existingCalculation[0].projectId;

        // Get project to check tenant access
        const project = await db
          .select()
          .from(defraProjects)
          .where(eq(defraProjects.id, projectId))
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
            message: 'Access denied to this calculation',
          });
        }

        // Delete calculation
        await db
          .delete(defraCarbonCalculations)
          .where(eq(defraCarbonCalculations.id, input.id));

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

