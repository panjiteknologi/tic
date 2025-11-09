import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
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
import { ISCCAICalculator } from '@/lib/iscc-ai-calculator';

const calculateSchema = z.object({
  projectId: z.string().uuid(),
  notes: z.string().optional(),
});

const recalculateSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().optional(),
});

export const isccCalculationsRouter = createTRPCRouter({
  // Calculate ISCC GHG emissions for a project
  calculate: protectedProcedure
    .input(calculateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project with tenant validation
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

        // Get related data
        const cultivation = await db
          .select()
          .from(isccCultivation)
          .where(eq(isccCultivation.projectId, input.projectId))
          .limit(1);

        const processing = await db
          .select()
          .from(isccProcessing)
          .where(eq(isccProcessing.projectId, input.projectId))
          .limit(1);

        const transport = await db
          .select()
          .from(isccTransport)
          .where(eq(isccTransport.projectId, input.projectId))
          .limit(1);

        // Validate required data
        if (!project[0].lhv) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'LHV (Lower Heating Value) is required for calculation',
          });
        }

        if (cultivation.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cultivation data is required for calculation',
          });
        }

        if (processing.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Processing data is required for calculation',
          });
        }

        if (transport.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Transport data is required for calculation',
          });
        }

        // Prepare input snapshot for audit trail
        const inputSnapshot = {
          project: project[0],
          cultivation: cultivation[0],
          processing: processing[0],
          transport: transport[0],
          calculatedAt: new Date().toISOString(),
        };

        // Use AI calculator for ISCC GHG calculation
        let calculationResult;
        try {
          console.log('🤖 Starting ISCC AI calculation with params:', {
            projectId: input.projectId,
            projectName: project[0].name,
            productType: project[0].productType,
            feedstockType: project[0].feedstockType,
            lhv: project[0].lhv,
          });

          calculationResult = await ISCCAICalculator.calculate({
            project: {
              name: project[0].name,
              productType: project[0].productType || '',
              feedstockType: project[0].feedstockType || '',
              productionVolume: project[0].productionVolume,
              lhv: project[0].lhv,
              lhvUnit: project[0].lhvUnit || 'MJ/kg',
            },
            cultivation: {
              landArea: cultivation[0].landArea,
              yield: cultivation[0].yield,
              nitrogenFertilizer: cultivation[0].nitrogenFertilizer,
              phosphateFertilizer: cultivation[0].phosphateFertilizer,
              potassiumFertilizer: cultivation[0].potassiumFertilizer,
              organicFertilizer: cultivation[0].organicFertilizer,
              dieselConsumption: cultivation[0].dieselConsumption,
              electricityUse: cultivation[0].electricityUse,
              pesticides: cultivation[0].pesticides,
              additionalData: cultivation[0].additionalData,
            },
            processing: {
              electricityUse: processing[0].electricityUse,
              steamUse: processing[0].steamUse,
              naturalGasUse: processing[0].naturalGasUse,
              dieselUse: processing[0].dieselUse,
              methanol: processing[0].methanol,
              catalyst: processing[0].catalyst,
              acid: processing[0].acid,
              waterConsumption: processing[0].waterConsumption,
              additionalData: processing[0].additionalData,
            },
            transport: {
              feedstockDistance: transport[0].feedstockDistance,
              feedstockMode: transport[0].feedstockMode,
              feedstockWeight: transport[0].feedstockWeight,
              productDistance: transport[0].productDistance,
              productMode: transport[0].productMode,
              productWeight: transport[0].productWeight,
              additionalTransport: transport[0].additionalTransport,
            },
          });

          console.log('✅ ISCC AI calculation successful:', {
            totalEmissions: calculationResult.totalEmissions,
            ghgSavings: calculationResult.ghgSavings,
          });
        } catch (calculatorError) {
          console.error('❌ ISCC AI calculator error details:', {
            error: calculatorError,
            message:
              calculatorError instanceof Error
                ? calculatorError.message
                : 'Unknown error',
            stack:
              calculatorError instanceof Error
                ? calculatorError.stack
                : undefined,
            projectId: input.projectId,
          });

          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `ISCC AI calculation failed: ${
              calculatorError instanceof Error
                ? calculatorError.message
                : 'Unknown error'
            }`,
          });
        }

        if (!calculationResult) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Calculation failed - no result returned',
          });
        }

        // Save calculation result to database
        let newCalculation;
        try {
          console.log('💾 Saving ISCC calculation to database:', {
            projectId: input.projectId,
            totalEmissions: calculationResult.totalEmissions,
            ghgSavings: calculationResult.ghgSavings,
          });

          [newCalculation] = await db
            .insert(isccCalculation)
            .values({
              projectId: input.projectId,
              inputSnapshot: inputSnapshot as any,
              eecKg: calculationResult.eecKg.toString(),
              epKg: calculationResult.epKg.toString(),
              etdKg: calculationResult.etdKg.toString(),
              totalKg: calculationResult.totalKg.toString(),
              eec: calculationResult.eec.toString(),
              ep: calculationResult.ep.toString(),
              etd: calculationResult.etd.toString(),
              el: calculationResult.el?.toString() || null,
              eccr: calculationResult.eccr?.toString() || null,
              totalEmissions: calculationResult.totalEmissions.toString(),
              fossilFuelBaseline: calculationResult.fossilFuelBaseline.toString(),
              ghgSavings: calculationResult.ghgSavings.toString(),
              breakdown: calculationResult.breakdown as any,
              llmModel: 'gemini-2.5-flash',
              llmPrompt: '', // Could store prompt if needed
              llmResponse: '', // Could store raw response if needed
              status: 'calculated',
              notes: input.notes || calculationResult.explanation,
            })
            .returning();

          console.log('✅ Database save successful:', newCalculation?.id);
        } catch (dbError) {
          console.error('❌ Database save error:', {
            error: dbError,
            message:
              dbError instanceof Error
                ? dbError.message
                : 'Unknown database error',
            calculationResult,
          });

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to save calculation: ${
              dbError instanceof Error
                ? dbError.message
                : 'Unknown database error'
            }`,
          });
        }

        // Update project status to 'calculated'
        await db
          .update(isccProject)
          .set({
            status: 'calculated',
            updatedAt: new Date(),
          })
          .where(eq(isccProject.id, input.projectId));

        return {
          success: true,
          calculation: newCalculation,
          details: {
            eec: calculationResult.eec,
            ep: calculationResult.ep,
            etd: calculationResult.etd,
            el: calculationResult.el,
            eccr: calculationResult.eccr,
            totalEmissions: calculationResult.totalEmissions,
            fossilFuelBaseline: calculationResult.fossilFuelBaseline,
            ghgSavings: calculationResult.ghgSavings,
            breakdown: calculationResult.breakdown,
            explanation: calculationResult.explanation,
            methodology: calculationResult.methodology,
            assumptions: calculationResult.assumptions,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('❌ ISCC calculation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `ISCC calculation failed: ${
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
        .from(isccCalculation)
        .where(eq(isccCalculation.id, input.id))
        .limit(1);

      if (calculation.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ISCC calculation not found',
        });
      }

      // Get project to check tenant access
      const project = await db
        .select()
        .from(isccProject)
        .where(eq(isccProject.id, calculation[0].projectId))
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
          message: 'Access denied to this calculation',
        });
      }

      return { calculation: calculation[0] };
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

      // Get all calculations for this project
      const calculations = await db
        .select()
        .from(isccCalculation)
        .where(eq(isccCalculation.projectId, input.projectId))
        .orderBy(desc(isccCalculation.calculatedAt));

      return { calculations };
    }),

  // Recalculate with latest data
  recalculate: protectedProcedure
    .input(recalculateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get existing calculation
        const existingCalculation = await db
          .select()
          .from(isccCalculation)
          .where(eq(isccCalculation.id, input.id))
          .limit(1);

        if (existingCalculation.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ISCC calculation not found',
          });
        }

        // Get project to check tenant access
        const project = await db
          .select()
          .from(isccProject)
          .where(eq(isccProject.id, existingCalculation[0].projectId))
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

        // Simply call calculate with the same projectId
        // We'll need to manually call the calculate logic
        // For now, return error suggesting to use calculate endpoint
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Please use calculate endpoint with the same projectId to recalculate',
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to recalculate: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }),
});

