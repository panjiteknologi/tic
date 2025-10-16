import { z } from "zod";
import { eq, and } from "drizzle-orm";
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
  // Calculate emission from activity data (auto-select emission factor)
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
            value: activityData.value,
            unit: activityData.unit,
            category: {
              sector: emissionCategories.sector,
            },
          })
          .from(activityData)
          .leftJoin(
            emissionCategories,
            eq(activityData.categoryId, emissionCategories.id)
          )
          .where(eq(activityData.id, input.activityDataId))
          .limit(1);

        if (activity.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity data not found",
          });
        }

        const activityRecord = activity[0];

        // Auto-select emission factor if not provided
        let emissionFactorId = input.emissionFactorId;
        if (!emissionFactorId) {
          const availableFactors = await db
            .select()
            .from(emissionFactors)
            .orderBy(emissionFactors.tier); // Prefer higher tier

          if (availableFactors.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No emission factor found",
            });
          }

          emissionFactorId = availableFactors[0].id;
        }

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

        const factor = emissionFactor[0];

        // Get GWP value for gas type
        const gwp = await db
          .select()
          .from(gwpValues)
          .where(eq(gwpValues.gasType, factor.gasType))
          .limit(1);

        const gwpValue = gwp.length > 0 ? parseFloat(gwp[0].value) : 1;

        // Calculate emissions
        const activityValue = parseFloat(activityRecord.value);
        const factorValue = parseFloat(factor.value);
        const emissionValue = activityValue * factorValue;
        const co2Equivalent = emissionValue * gwpValue;

        // Create calculation record
        const [newCalculation] = await db
          .insert(emissionCalculations)
          .values({
            projectId: activityRecord.projectId,
            activityDataId: input.activityDataId,
            emissionFactorId: emissionFactorId,
            tier: factor.tier,
            gasType: factor.gasType,
            emissionValue: emissionValue.toString(),
            emissionUnit: "kg",
            co2Equivalent: co2Equivalent.toString(),
            notes: input.notes,
          })
          .returning();

        return {
          success: true,
          calculation: newCalculation,
          details: {
            activityValue,
            factorValue,
            gwpValue,
            emissionValue,
            co2Equivalent,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
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
              .where(eq(emissionFactors.id, calc.emissionFactorId))
              .limit(1);

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
            errors.push(`Failed to recalculate calculation ${calc.id}`);
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
