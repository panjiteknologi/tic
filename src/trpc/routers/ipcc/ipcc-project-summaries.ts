import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import {
  projectSummaries,
  ipccProjects,
  emissionCalculations,
  activityData,
  emissionCategories,
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

export const ipccProjectSummariesRouter = createTRPCRouter({
  // Get summary for a project (all sectors)
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Check if project exists
        const project = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.projectId))
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        // Get all summaries for the project
        const summaries = await db
          .select({
            id: projectSummaries.id,
            sector: projectSummaries.sector,
            totalCO2: projectSummaries.totalCO2,
            totalCH4: projectSummaries.totalCH4,
            totalN2O: projectSummaries.totalN2O,
            totalOtherGases: projectSummaries.totalOtherGases,
            totalCO2Equivalent: projectSummaries.totalCO2Equivalent,
            updatedAt: projectSummaries.updatedAt,
          })
          .from(projectSummaries)
          .where(eq(projectSummaries.projectId, input.projectId));

        // Calculate grand total across all sectors
        const grandTotal = summaries.reduce(
          (acc, summary) => {
            return {
              totalCO2: acc.totalCO2 + parseFloat(summary.totalCO2 || "0"),
              totalCH4: acc.totalCH4 + parseFloat(summary.totalCH4 || "0"),
              totalN2O: acc.totalN2O + parseFloat(summary.totalN2O || "0"),
              totalOtherGases:
                acc.totalOtherGases +
                parseFloat(summary.totalOtherGases || "0"),
              totalCO2Equivalent:
                acc.totalCO2Equivalent +
                parseFloat(summary.totalCO2Equivalent || "0"),
            };
          },
          {
            totalCO2: 0,
            totalCH4: 0,
            totalN2O: 0,
            totalOtherGases: 0,
            totalCO2Equivalent: 0,
          }
        );

        return {
          project: project[0],
          summaries,
          grandTotal,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get project summaries",
        });
      }
    }),

  // Get summary for specific sector
  getBySector: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        sector: z.enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"]),
      })
    )
    .query(async ({ input }) => {
      try {
        // Check if project exists
        const project = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.projectId))
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        // Get summary for specific sector
        const summary = await db
          .select({
            id: projectSummaries.id,
            sector: projectSummaries.sector,
            totalCO2: projectSummaries.totalCO2,
            totalCH4: projectSummaries.totalCH4,
            totalN2O: projectSummaries.totalN2O,
            totalOtherGases: projectSummaries.totalOtherGases,
            totalCO2Equivalent: projectSummaries.totalCO2Equivalent,
            updatedAt: projectSummaries.updatedAt,
          })
          .from(projectSummaries)
          .where(
            and(
              eq(projectSummaries.projectId, input.projectId),
              eq(projectSummaries.sector, input.sector)
            )
          )
          .limit(1);

        if (summary.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No summary found for sector ${input.sector} in this project`,
          });
        }

        return {
          project: project[0],
          summary: summary[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get sector summary",
        });
      }
    }),

  // Regenerate/recalculate all summaries for a project
  regenerate: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if project exists
        const project = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.projectId))
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        // Get all sectors that have emission calculations for this project
        const sectorsWithData = await db
          .select({
            sector: emissionCategories.sector,
          })
          .from(emissionCalculations)
          .leftJoin(
            activityData,
            eq(emissionCalculations.activityDataId, activityData.id)
          )
          .leftJoin(
            emissionCategories,
            eq(activityData.categoryId, emissionCategories.id)
          )
          .where(eq(emissionCalculations.projectId, input.projectId))
          .groupBy(emissionCategories.sector);

        // Delete existing summaries for this project
        await db
          .delete(projectSummaries)
          .where(eq(projectSummaries.projectId, input.projectId));

        // Regenerate summaries for each sector
        const newSummaries = [];

        for (const sectorData of sectorsWithData) {
          if (!sectorData.sector) continue;

          // Calculate totals for this sector
          const sectorTotals = await db
            .select({
              totalCO2: sql<string>`COALESCE(SUM(CASE WHEN ${emissionCalculations.gasType} = 'CO2' THEN ${emissionCalculations.emissionValue} ELSE 0 END), 0)`,
              totalCH4: sql<string>`COALESCE(SUM(CASE WHEN ${emissionCalculations.gasType} = 'CH4' THEN ${emissionCalculations.emissionValue} ELSE 0 END), 0)`,
              totalN2O: sql<string>`COALESCE(SUM(CASE WHEN ${emissionCalculations.gasType} = 'N2O' THEN ${emissionCalculations.emissionValue} ELSE 0 END), 0)`,
              totalOtherGases: sql<string>`COALESCE(SUM(CASE WHEN ${emissionCalculations.gasType} NOT IN ('CO2', 'CH4', 'N2O') THEN ${emissionCalculations.emissionValue} ELSE 0 END), 0)`,
              totalCO2Equivalent: sql<string>`COALESCE(SUM(${emissionCalculations.co2Equivalent}), 0)`,
            })
            .from(emissionCalculations)
            .leftJoin(
              activityData,
              eq(emissionCalculations.activityDataId, activityData.id)
            )
            .leftJoin(
              emissionCategories,
              eq(activityData.categoryId, emissionCategories.id)
            )
            .where(
              and(
                eq(emissionCalculations.projectId, input.projectId),
                eq(emissionCategories.sector, sectorData.sector)
              )
            );

          if (sectorTotals.length > 0) {
            const totals = sectorTotals[0];

            // Insert new summary
            const [newSummary] = await db
              .insert(projectSummaries)
              .values({
                projectId: input.projectId,
                sector: sectorData.sector,
                totalCO2: totals.totalCO2,
                totalCH4: totals.totalCH4,
                totalN2O: totals.totalN2O,
                totalOtherGases: totals.totalOtherGases,
                totalCO2Equivalent: totals.totalCO2Equivalent,
                updatedAt: new Date(),
              })
              .returning();

            newSummaries.push(newSummary);
          }
        }

        return {
          success: true,
          message: `Successfully regenerated ${newSummaries.length} summaries`,
          summaries: newSummaries,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to regenerate project summaries",
        });
      }
    }),
});
