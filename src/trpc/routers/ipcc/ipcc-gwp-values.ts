import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import { gwpValues } from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

const createGwpValueSchema = z.object({
  gasType: z.enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"]),
  value: z.string().min(1, "GWP value is required"),
  assessmentReport: z.string().default("AR5"),
});

const updateGwpValueSchema = z.object({
  id: z.string().uuid(),
  value: z.string().min(1, "GWP value is required").optional(),
  assessmentReport: z.string().optional(),
});

export const ipccGwpValuesRouter = createTRPCRouter({
  // Create new GWP value
  create: protectedProcedure
    .input(createGwpValueSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if GWP value for this gas type already exists
        const existingGwp = await db
          .select()
          .from(gwpValues)
          .where(eq(gwpValues.gasType, input.gasType))
          .limit(1);

        if (existingGwp.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `GWP value for ${input.gasType} already exists`,
          });
        }

        const [newGwpValue] = await db
          .insert(gwpValues)
          .values({
            gasType: input.gasType,
            value: input.value,
            assessmentReport: input.assessmentReport,
          })
          .returning();

        return {
          success: true,
          gwpValue: newGwpValue,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create GWP value",
        });
      }
    }),

  // Get GWP value by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const gwpValue = await db
        .select({
          id: gwpValues.id,
          gasType: gwpValues.gasType,
          value: gwpValues.value,
          assessmentReport: gwpValues.assessmentReport,
          createdAt: gwpValues.createdAt,
        })
        .from(gwpValues)
        .where(eq(gwpValues.id, input.id))
        .limit(1);

      if (gwpValue.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "GWP value not found",
        });
      }

      return { gwpValue: gwpValue[0] };
    }),

  // Get all GWP values
  getAll: protectedProcedure
    .input(
      z.object({
        assessmentReport: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const whereCondition = input.assessmentReport
        ? eq(gwpValues.assessmentReport, input.assessmentReport)
        : undefined;

      const gwpValuesList = await db
        .select({
          id: gwpValues.id,
          gasType: gwpValues.gasType,
          value: gwpValues.value,
          assessmentReport: gwpValues.assessmentReport,
          createdAt: gwpValues.createdAt,
        })
        .from(gwpValues)
        .where(whereCondition)
        .orderBy(gwpValues.gasType);

      // Group by assessment report for easy access
      const groupedByReport = gwpValuesList.reduce((acc, gwp) => {
        const report = gwp.assessmentReport || "Unknown";
        if (!acc[report]) {
          acc[report] = [];
        }
        acc[report].push(gwp);
        return acc;
      }, {} as Record<string, typeof gwpValuesList>);

      return {
        gwpValues: gwpValuesList,
        groupedByReport,
      };
    }),

  // Get GWP for specific gas
  getByGasType: protectedProcedure
    .input(
      z.object({
        gasType: z.enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"]),
      })
    )
    .query(async ({ input }) => {
      const gwpValue = await db
        .select({
          id: gwpValues.id,
          gasType: gwpValues.gasType,
          value: gwpValues.value,
          assessmentReport: gwpValues.assessmentReport,
          createdAt: gwpValues.createdAt,
        })
        .from(gwpValues)
        .where(eq(gwpValues.gasType, input.gasType))
        .limit(1);

      if (gwpValue.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `GWP value for ${input.gasType} not found`,
        });
      }

      return {
        gasType: input.gasType,
        gwpValue: gwpValue[0],
      };
    }),

  // Update GWP value
  update: protectedProcedure
    .input(updateGwpValueSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if GWP value exists
        const existingGwpValue = await db
          .select()
          .from(gwpValues)
          .where(eq(gwpValues.id, input.id))
          .limit(1);

        if (existingGwpValue.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "GWP value not found",
          });
        }

        const [updatedGwpValue] = await db
          .update(gwpValues)
          .set({
            ...(input.value && { value: input.value }),
            ...(input.assessmentReport && { assessmentReport: input.assessmentReport }),
          })
          .where(eq(gwpValues.id, input.id))
          .returning();

        return {
          success: true,
          gwpValue: updatedGwpValue,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update GWP value",
        });
      }
    }),

  // Delete GWP value
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if GWP value exists
        const existingGwpValue = await db
          .select()
          .from(gwpValues)
          .where(eq(gwpValues.id, input.id))
          .limit(1);

        if (existingGwpValue.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "GWP value not found",
          });
        }

        // Note: Check if this GWP value is being used in calculations before deletion
        // For now, we'll allow deletion as cascade handling would manage related records

        await db.delete(gwpValues).where(eq(gwpValues.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete GWP value",
        });
      }
    }),

  // Get default GWP values (commonly used for quick setup)
  getDefaults: protectedProcedure.query(async () => {
    const defaultGwpValues = [
      { gasType: "CO2", value: "1", assessmentReport: "AR5" },
      { gasType: "CH4", value: "28", assessmentReport: "AR5" },
      { gasType: "N2O", value: "265", assessmentReport: "AR5" },
      { gasType: "HFCs", value: "1430", assessmentReport: "AR5" }, // Average for common HFCs
      { gasType: "PFCs", value: "6630", assessmentReport: "AR5" }, // Average for common PFCs
      { gasType: "SF6", value: "23500", assessmentReport: "AR5" },
      { gasType: "NF3", value: "16100", assessmentReport: "AR5" },
    ];

    return {
      defaultValues: defaultGwpValues,
      source: "IPCC Fifth Assessment Report (AR5) - 100 year time horizon",
    };
  }),
});