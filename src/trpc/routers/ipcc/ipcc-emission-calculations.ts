import { z } from "zod";
import { eq, and, or, sql } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import {
  emissionCalculations,
  activityData,
  emissionFactors,
  emissionCategories,
  ipccProjects,
  gwpValues,
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";
import { IPCCConstantsCalculator } from "@/constant/ipcc/ipcc-constants-calculator";

const calculateEmissionSchema = z.object({
  activityDataId: z.string().uuid(),
  emissionFactorId: z.string().uuid().optional(), // If not provided, auto-select best match
  notes: z.string().optional(),
});

const recalculateSchema = z.object({
  id: z.string().uuid(),
  emissionFactorId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const ipccEmissionCalculationsRouter = createTRPCRouter({
  // Calculate emission from activity data using constants calculator
  calculate: protectedProcedure
    .input(calculateEmissionSchema)
    .mutation(async ({ input }) => {
      try {
        // Get activity data with category info
        const activity = await db
          .select({
            id: activityData.id,
            projectId: activityData.projectId,
            categoryId: activityData.categoryId,
            name: activityData.name,
            value: activityData.value,
            unit: activityData.unit,
          })
          .from(activityData)
          .where(eq(activityData.id, input.activityDataId))
          .limit(1);

        if (activity.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity data not found",
          });
        }

        const activityRecord = activity[0];

        // Get category info
        const category = await db
          .select()
          .from(emissionCategories)
          .where(eq(emissionCategories.id, activityRecord.categoryId))
          .limit(1);

        if (category.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        const categoryCode = category[0].code;
        const activityValue = parseFloat(activityRecord.value);

        // Use constants calculator for accurate results
        let calculationResult;
        try {
          console.log("🧮 Starting calculation with params:", {
            activityValue,
            unit: activityRecord.unit,
            categoryCode,
            tier: "TIER_1",
            activityName: activityRecord.name
          });

          calculationResult = IPCCConstantsCalculator.calculate(
            activityValue,
            activityRecord.unit,
            categoryCode,
            "TIER_1", // Default to TIER_1 for accuracy
            activityRecord.name
          );

          console.log("✅ Calculation successful:", calculationResult);
        } catch (calculatorError) {
          console.error("❌ Calculator error details:", {
            error: calculatorError,
            message: calculatorError instanceof Error ? calculatorError.message : 'Unknown error',
            stack: calculatorError instanceof Error ? calculatorError.stack : undefined,
            activityValue,
            unit: activityRecord.unit,
            categoryCode
          });
          
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Calculation failed: ${calculatorError instanceof Error ? calculatorError.message : 'Unknown error'}`,
          });
        }

        if (!calculationResult) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No suitable emission factor found for category ${categoryCode}`,
          });
        }

        // Validate calculation
        const isValid = IPCCConstantsCalculator.validateCalculation(calculationResult, categoryCode);
        if (!isValid) {
          console.warn(`Calculation validation failed for category ${categoryCode}`, calculationResult);
        }

        // Create calculation record in database for tracking
        let newCalculation;
        try {
          console.log("💾 Saving calculation to database:", {
            projectId: activityRecord.projectId,
            activityDataId: input.activityDataId,
            tier: calculationResult.tier,
            gasType: calculationResult.gasType,
            emissionValue: calculationResult.emission.toString(),
            emissionUnit: calculationResult.emissionUnit,
            co2Equivalent: calculationResult.co2Equivalent.toString(),
            notes: calculationResult.notes
          });

          const insertData = {
            projectId: activityRecord.projectId,
            activityDataId: input.activityDataId,
            emissionFactorId: null, // NULL for constants-based calculations
            tier: calculationResult.tier,
            gasType: calculationResult.gasType,
            emissionValue: calculationResult.emission.toString(),
            emissionUnit: calculationResult.emissionUnit,
            co2Equivalent: calculationResult.co2Equivalent.toString(),
            notes: calculationResult.notes + (input.notes ? ` | ${input.notes}` : ""),
          };

          console.log("💾 Insert data structure:", insertData);

          [newCalculation] = await db
            .insert(emissionCalculations)
            .values(insertData)
            .returning();

          console.log("✅ Database save successful:", newCalculation);
        } catch (dbError) {
          console.error("❌ Database save error:", {
            error: dbError,
            message: dbError instanceof Error ? dbError.message : 'Unknown database error',
            calculationResult
          });
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to save calculation: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`,
          });
        }

        return {
          success: true,
          calculation: newCalculation,
          details: {
            method: "CONSTANTS_CALCULATOR",
            formula: calculationResult.notes,
            activityValue,
            factorValue: parseFloat(calculationResult.factor.value),
            factorUnit: calculationResult.factor.unit,
            gwpValue: parseFloat(calculationResult.gwp.value),
            emissionValue: calculationResult.emission,
            co2Equivalent: calculationResult.co2Equivalent,
            categoryCode,
            gasType: calculationResult.gasType,
            tier: calculationResult.tier,
            factorName: calculationResult.factor.name,
            factorSource: calculationResult.factor.source,
            isValidated: isValid,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Calculation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate emission",
        });
      }
    }),

  // Recalculate specific calculation
  recalculate: protectedProcedure
    .input(recalculateSchema)
    .mutation(async ({ input }) => {
      try {
        // Get existing calculation
        const existingCalc = await db
          .select()
          .from(emissionCalculations)
          .where(eq(emissionCalculations.id, input.id))
          .limit(1);

        if (existingCalc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Calculation not found",
          });
        }

        const calc = existingCalc[0];

        // Use new emission factor if provided, otherwise use existing
        const emissionFactorId =
          input.emissionFactorId || calc.emissionFactorId;

        // Skip recalculation if no emission factor (constants-based calculation)
        if (!emissionFactorId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot recalculate constants-based calculations. Please use the calculate endpoint to regenerate.",
          });
        }

        // Get activity data
        const activity = await db
          .select()
          .from(activityData)
          .where(eq(activityData.id, calc.activityDataId))
          .limit(1);

        // Get emission factor
        const emissionFactor = await db
          .select()
          .from(emissionFactors)
          .where(eq(emissionFactors.id, emissionFactorId))
          .limit(1);

        if (emissionFactor.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emission factor not found",
          });
        }

        // Get GWP value
        const gwp = await db
          .select()
          .from(gwpValues)
          .where(eq(gwpValues.gasType, emissionFactor[0].gasType))
          .limit(1);

        const gwpValue = gwp.length > 0 ? parseFloat(gwp[0].value) : 1;

        // Recalculate
        const activityValue = parseFloat(activity[0].value);
        const factorValue = parseFloat(emissionFactor[0].value);
        const emissionValue = activityValue * factorValue;
        const co2Equivalent = emissionValue * gwpValue;

        // Update calculation
        const [updatedCalculation] = await db
          .update(emissionCalculations)
          .set({
            emissionFactorId,
            tier: emissionFactor[0].tier,
            gasType: emissionFactor[0].gasType,
            emissionValue: emissionValue.toString(),
            co2Equivalent: co2Equivalent.toString(),
            notes: input.notes !== undefined ? input.notes : calc.notes,
            updatedAt: new Date(),
          })
          .where(eq(emissionCalculations.id, input.id))
          .returning();

        return {
          success: true,
          calculation: updatedCalculation,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to recalculate emission",
        });
      }
    }),

  // Recalculate all calculations in a project
  recalculateProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get all calculations for the project
        const calculations = await db
          .select()
          .from(emissionCalculations)
          .where(eq(emissionCalculations.projectId, input.projectId));

        if (calculations.length === 0) {
          return {
            success: true,
            message: "No calculations found for this project",
            recalculatedCount: 0,
          };
        }

        let recalculatedCount = 0;
        const errors: string[] = [];

        // Recalculate each calculation
        for (const calc of calculations) {
          try {
            // Skip constants-based calculations (null emissionFactorId)
            if (!calc.emissionFactorId) {
              errors.push(`Skipped calculation ${calc.id} - constants-based calculation cannot be recalculated`);
              continue;
            }

            // Get activity data
            const activity = await db
              .select()
              .from(activityData)
              .where(eq(activityData.id, calc.activityDataId))
              .limit(1);

            if (activity.length === 0) {
              errors.push(`Activity data not found for calculation ${calc.id}`);
              continue;
            }

            // Get emission factor
            const emissionFactor = await db
              .select()
              .from(emissionFactors)
              .where(eq(emissionFactors.id, calc.emissionFactorId))
              .limit(1);

            if (emissionFactor.length === 0) {
              errors.push(`Emission factor not found for calculation ${calc.id}`);
              continue;
            }

            // Get GWP value
            const gwp = await db
              .select()
              .from(gwpValues)
              .where(eq(gwpValues.gasType, emissionFactor[0].gasType))
              .limit(1);

            const gwpValue = gwp.length > 0 ? parseFloat(gwp[0].value) : 1;

            // Recalculate
            const activityValue = parseFloat(activity[0].value);
            const factorValue = parseFloat(emissionFactor[0].value);
            const emissionValue = activityValue * factorValue;
            const co2Equivalent = emissionValue * gwpValue;

            // Update calculation
            await db
              .update(emissionCalculations)
              .set({
                emissionValue: emissionValue.toString(),
                co2Equivalent: co2Equivalent.toString(),
                updatedAt: new Date(),
              })
              .where(eq(emissionCalculations.id, calc.id));

            recalculatedCount++;
          } catch (error) {
            errors.push(`Failed to recalculate calculation ${calc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        return {
          success: true,
          recalculatedCount,
          errors: errors.length > 0 ? errors : undefined,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to recalculate project emissions",
        });
      }
    }),

  // Get calculation detail
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const calculation = await db
        .select({
          id: emissionCalculations.id,
          projectId: emissionCalculations.projectId,
          activityDataId: emissionCalculations.activityDataId,
          emissionFactorId: emissionCalculations.emissionFactorId,
          tier: emissionCalculations.tier,
          gasType: emissionCalculations.gasType,
          emissionValue: emissionCalculations.emissionValue,
          emissionUnit: emissionCalculations.emissionUnit,
          co2Equivalent: emissionCalculations.co2Equivalent,
          notes: emissionCalculations.notes,
          createdAt: emissionCalculations.createdAt,
          updatedAt: emissionCalculations.updatedAt,
          // Include related data
          project: {
            id: ipccProjects.id,
            name: ipccProjects.name,
          },
          activityData: {
            id: activityData.id,
            name: activityData.name,
            value: activityData.value,
            unit: activityData.unit,
          },
          emissionFactor: {
            id: emissionFactors.id,
            name: emissionFactors.name,
            value: emissionFactors.value,
            unit: emissionFactors.unit,
          },
        })
        .from(emissionCalculations)
        .leftJoin(
          ipccProjects,
          eq(emissionCalculations.projectId, ipccProjects.id)
        )
        .leftJoin(
          activityData,
          eq(emissionCalculations.activityDataId, activityData.id)
        )
        .leftJoin(
          emissionFactors,
          eq(emissionCalculations.emissionFactorId, emissionFactors.id)
        )
        .where(eq(emissionCalculations.id, input.id))
        .limit(1);

      if (calculation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Calculation not found",
        });
      }

      return { calculation: calculation[0] };
    }),

  // Get all calculations for a project
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        gasType: z
          .enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"])
          .optional(),
        tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]).optional(),
      })
    )
    .query(async ({ input }) => {
      // Build where conditions
      const whereConditions = [
        eq(emissionCalculations.projectId, input.projectId),
      ];

      if (input.gasType) {
        whereConditions.push(eq(emissionCalculations.gasType, input.gasType));
      }

      if (input.tier) {
        whereConditions.push(eq(emissionCalculations.tier, input.tier));
      }

      const calculations = await db
        .select({
          id: emissionCalculations.id,
          projectId: emissionCalculations.projectId,
          activityDataId: emissionCalculations.activityDataId,
          emissionFactorId: emissionCalculations.emissionFactorId,
          tier: emissionCalculations.tier,
          gasType: emissionCalculations.gasType,
          emissionValue: emissionCalculations.emissionValue,
          emissionUnit: emissionCalculations.emissionUnit,
          co2Equivalent: emissionCalculations.co2Equivalent,
          notes: emissionCalculations.notes,
          createdAt: emissionCalculations.createdAt,
          updatedAt: emissionCalculations.updatedAt,
          // Include activity data
          activityData: {
            id: activityData.id,
            name: activityData.name,
            value: activityData.value,
            unit: activityData.unit,
          },
          // Include emission factor
          emissionFactor: {
            id: emissionFactors.id,
            name: emissionFactors.name,
            value: emissionFactors.value,
            unit: emissionFactors.unit,
          },
        })
        .from(emissionCalculations)
        .leftJoin(
          activityData,
          eq(emissionCalculations.activityDataId, activityData.id)
        )
        .leftJoin(
          emissionFactors,
          eq(emissionCalculations.emissionFactorId, emissionFactors.id)
        )
        .where(and(...whereConditions));

      return { calculations };
    }),

  // Get calculations for specific activity data
  getByActivityData: protectedProcedure
    .input(
      z.object({
        activityDataId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const calculations = await db
        .select({
          id: emissionCalculations.id,
          projectId: emissionCalculations.projectId,
          activityDataId: emissionCalculations.activityDataId,
          emissionFactorId: emissionCalculations.emissionFactorId,
          tier: emissionCalculations.tier,
          gasType: emissionCalculations.gasType,
          emissionValue: emissionCalculations.emissionValue,
          emissionUnit: emissionCalculations.emissionUnit,
          co2Equivalent: emissionCalculations.co2Equivalent,
          notes: emissionCalculations.notes,
          createdAt: emissionCalculations.createdAt,
          updatedAt: emissionCalculations.updatedAt,
          // Include emission factor
          emissionFactor: {
            id: emissionFactors.id,
            name: emissionFactors.name,
            value: emissionFactors.value,
            unit: emissionFactors.unit,
          },
        })
        .from(emissionCalculations)
        .leftJoin(
          emissionFactors,
          eq(emissionCalculations.emissionFactorId, emissionFactors.id)
        )
        .where(eq(emissionCalculations.activityDataId, input.activityDataId));

      return { calculations };
    }),

  // Delete calculation
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if calculation exists
        const existingCalculation = await db
          .select()
          .from(emissionCalculations)
          .where(eq(emissionCalculations.id, input.id))
          .limit(1);

        if (existingCalculation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Calculation not found",
          });
        }

        // Delete calculation
        await db
          .delete(emissionCalculations)
          .where(eq(emissionCalculations.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete calculation",
        });
      }
    }),
});
