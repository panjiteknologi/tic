import { z } from "zod";
import {
  eq,
  sum,
  count,
  desc,
  asc,
  and,
  gte,
  lte,
  sql,
  inArray,
} from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import {
  ipccProjects,
  projectSummaries,
  emissionCalculations,
  activityData,
  emissionCategories,
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

export const ipccDashboardRouter = createTRPCRouter({
  // Get dashboard overview (total projects, emissions, trends)
  getOverview: protectedProcedure
    .input(
      z.object({
        yearFrom: z.number().optional(),
        yearTo: z.number().optional(),
        organizationName: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let projectWhereConditions = [];

        if (input.yearFrom) {
          projectWhereConditions.push(gte(ipccProjects.year, input.yearFrom));
        }
        if (input.yearTo) {
          projectWhereConditions.push(lte(ipccProjects.year, input.yearTo));
        }
        if (input.organizationName) {
          projectWhereConditions.push(
            eq(ipccProjects.organizationName, input.organizationName)
          );
        }

        const projectWhereCondition =
          projectWhereConditions.length > 0
            ? and(...projectWhereConditions)
            : undefined;

        // Get total projects by status
        const projectStats = await db
          .select({
            status: ipccProjects.status,
            count: count(),
          })
          .from(ipccProjects)
          .where(projectWhereCondition)
          .groupBy(ipccProjects.status);

        // Get total emissions
        const totalEmissions = await db
          .select({
            totalCO2Equivalent: sum(emissionCalculations.co2Equivalent),
            totalCalculations: count(),
          })
          .from(emissionCalculations)
          .leftJoin(
            ipccProjects,
            eq(emissionCalculations.projectId, ipccProjects.id)
          )
          .where(projectWhereCondition);

        // Get emissions by year for trends
        const yearlyEmissions = await db
          .select({
            year: ipccProjects.year,
            totalEmissions: sum(emissionCalculations.co2Equivalent),
            projectCount: sql<number>`COUNT(DISTINCT ${ipccProjects.id})`,
          })
          .from(ipccProjects)
          .leftJoin(
            emissionCalculations,
            eq(ipccProjects.id, emissionCalculations.projectId)
          )
          .where(projectWhereCondition)
          .groupBy(ipccProjects.year)
          .orderBy(ipccProjects.year);

        // Get recent projects
        const recentProjects = await db
          .select({
            id: ipccProjects.id,
            name: ipccProjects.name,
            year: ipccProjects.year,
            status: ipccProjects.status,
            organizationName: ipccProjects.organizationName,
            createdAt: ipccProjects.createdAt,
          })
          .from(ipccProjects)
          .where(projectWhereCondition)
          .orderBy(desc(ipccProjects.createdAt))
          .limit(5);

        // Get sector breakdown
        const sectorBreakdown = await db
          .select({
            sector: projectSummaries.sector,
            totalEmissions: sum(projectSummaries.totalCO2Equivalent),
            projectCount: sql<number>`COUNT(DISTINCT ${projectSummaries.projectId})`,
          })
          .from(projectSummaries)
          .leftJoin(
            ipccProjects,
            eq(projectSummaries.projectId, ipccProjects.id)
          )
          .where(projectWhereCondition)
          .groupBy(projectSummaries.sector);

        return {
          overview: {
            totalProjects: projectStats.reduce(
              (sum, stat) => sum + stat.count,
              0
            ),
            totalEmissions: parseFloat(
              totalEmissions[0]?.totalCO2Equivalent || "0"
            ),
            totalCalculations: totalEmissions[0]?.totalCalculations || 0,
          },
          projectStats,
          yearlyTrends: yearlyEmissions,
          recentProjects,
          sectorBreakdown,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get dashboard overview",
        });
      }
    }),

  // Get emission trends (year over year)
  getEmissionTrends: protectedProcedure
    .input(
      z.object({
        yearFrom: z.number().optional(),
        yearTo: z.number().optional(),
        sector: z
          .enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"])
          .optional(),
        organizationName: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let whereConditions = [];

        if (input.yearFrom) {
          whereConditions.push(gte(ipccProjects.year, input.yearFrom));
        }
        if (input.yearTo) {
          whereConditions.push(lte(ipccProjects.year, input.yearTo));
        }
        if (input.organizationName) {
          whereConditions.push(
            eq(ipccProjects.organizationName, input.organizationName)
          );
        }
        if (input.sector) {
          whereConditions.push(eq(projectSummaries.sector, input.sector));
        }

        const whereCondition =
          whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get yearly trends with sector breakdown
        const yearlyTrends = await db
          .select({
            year: ipccProjects.year,
            sector: projectSummaries.sector,
            totalCO2: sum(projectSummaries.totalCO2),
            totalCH4: sum(projectSummaries.totalCH4),
            totalN2O: sum(projectSummaries.totalN2O),
            totalOtherGases: sum(projectSummaries.totalOtherGases),
            totalCO2Equivalent: sum(projectSummaries.totalCO2Equivalent),
            projectCount: sql<number>`COUNT(DISTINCT ${ipccProjects.id})`,
          })
          .from(ipccProjects)
          .leftJoin(
            projectSummaries,
            eq(ipccProjects.id, projectSummaries.projectId)
          )
          .where(whereCondition)
          .groupBy(ipccProjects.year, projectSummaries.sector)
          .orderBy(ipccProjects.year, projectSummaries.sector);

        // Calculate year-over-year percentage changes
        const trendsWithGrowth = yearlyTrends.map((current, index) => {
          const previous = yearlyTrends.find(
            (item, prevIndex) =>
              prevIndex < index &&
              item.year === current.year - 1 &&
              item.sector === current.sector
          );

          let growthRate = null;
          if (previous && parseFloat(previous.totalCO2Equivalent || "0") > 0) {
            const currentValue = parseFloat(current.totalCO2Equivalent || "0");
            const previousValue = parseFloat(
              previous.totalCO2Equivalent || "0"
            );
            growthRate = ((currentValue - previousValue) / previousValue) * 100;
          }

          return {
            ...current,
            growthRate,
          };
        });

        return {
          trends: trendsWithGrowth,
          summary: {
            totalYears: [...new Set(yearlyTrends.map((t) => t.year))].length,
            sectors: [...new Set(yearlyTrends.map((t) => t.sector))],
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get emission trends",
        });
      }
    }),

  // Analyze emissions by sector
  getSectorAnalysis: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
        organizationName: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let whereConditions = [];

        if (input.year) {
          whereConditions.push(eq(ipccProjects.year, input.year));
        }
        if (input.organizationName) {
          whereConditions.push(
            eq(ipccProjects.organizationName, input.organizationName)
          );
        }

        const whereCondition =
          whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get sector analysis
        const sectorAnalysis = await db
          .select({
            sector: projectSummaries.sector,
            totalCO2: sum(projectSummaries.totalCO2),
            totalCH4: sum(projectSummaries.totalCH4),
            totalN2O: sum(projectSummaries.totalN2O),
            totalOtherGases: sum(projectSummaries.totalOtherGases),
            totalCO2Equivalent: sum(projectSummaries.totalCO2Equivalent),
            projectCount: sql<number>`COUNT(DISTINCT ${projectSummaries.projectId})`,
            avgEmissionsPerProject: sql<string>`AVG(${projectSummaries.totalCO2Equivalent})`,
          })
          .from(projectSummaries)
          .leftJoin(
            ipccProjects,
            eq(projectSummaries.projectId, ipccProjects.id)
          )
          .where(whereCondition)
          .groupBy(projectSummaries.sector)
          .orderBy(desc(sum(projectSummaries.totalCO2Equivalent)));

        // Calculate percentages
        const totalEmissions = sectorAnalysis.reduce(
          (sum, sector) => sum + parseFloat(sector.totalCO2Equivalent || "0"),
          0
        );

        const sectorWithPercentages = sectorAnalysis.map((sector) => ({
          ...sector,
          percentage:
            totalEmissions > 0
              ? (parseFloat(sector.totalCO2Equivalent || "0") /
                  totalEmissions) *
                100
              : 0,
        }));

        return {
          sectorAnalysis: sectorWithPercentages,
          totals: {
            totalEmissions,
            totalProjects: sectorAnalysis.reduce(
              (sum, sector) => sum + sector.projectCount,
              0
            ),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get sector analysis",
        });
      }
    }),

  // Get top emission sources
  getTopEmitters: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        type: z
          .enum(["projects", "categories", "activities"])
          .default("projects"),
        year: z.number().optional(),
        sector: z
          .enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let whereConditions = [];

        if (input.year) {
          whereConditions.push(eq(ipccProjects.year, input.year));
        }

        const whereCondition =
          whereConditions.length > 0 ? and(...whereConditions) : undefined;

        if (input.type === "projects") {
          // Top emitting projects
          const topProjects = await db
            .select({
              id: ipccProjects.id,
              name: ipccProjects.name,
              year: ipccProjects.year,
              organizationName: ipccProjects.organizationName,
              totalEmissions: sum(emissionCalculations.co2Equivalent),
              calculationCount: count(emissionCalculations.id),
            })
            .from(ipccProjects)
            .leftJoin(
              emissionCalculations,
              eq(ipccProjects.id, emissionCalculations.projectId)
            )
            .where(whereCondition)
            .groupBy(
              ipccProjects.id,
              ipccProjects.name,
              ipccProjects.year,
              ipccProjects.organizationName
            )
            .orderBy(desc(sum(emissionCalculations.co2Equivalent)))
            .limit(input.limit);

          return { topEmitters: topProjects, type: "projects" };
        }

        if (input.type === "categories") {
          // Top emitting categories
          let categoriesWhereConditions = [...whereConditions];
          if (input.sector) {
            categoriesWhereConditions.push(
              eq(emissionCategories.sector, input.sector)
            );
          }

          const categoriesWhereCondition =
            categoriesWhereConditions.length > 0
              ? and(...categoriesWhereConditions)
              : undefined;

          const topCategories = await db
            .select({
              id: emissionCategories.id,
              code: emissionCategories.code,
              name: emissionCategories.name,
              sector: emissionCategories.sector,
              totalEmissions: sum(emissionCalculations.co2Equivalent),
              calculationCount: count(emissionCalculations.id),
              projectCount: sql<number>`COUNT(DISTINCT ${ipccProjects.id})`,
            })
            .from(emissionCategories)
            .leftJoin(
              activityData,
              eq(emissionCategories.id, activityData.categoryId)
            )
            .leftJoin(
              emissionCalculations,
              eq(activityData.id, emissionCalculations.activityDataId)
            )
            .leftJoin(ipccProjects, eq(activityData.projectId, ipccProjects.id))
            .where(categoriesWhereCondition)
            .groupBy(
              emissionCategories.id,
              emissionCategories.code,
              emissionCategories.name,
              emissionCategories.sector
            )
            .orderBy(desc(sum(emissionCalculations.co2Equivalent)))
            .limit(input.limit);

          return { topEmitters: topCategories, type: "categories" };
        }

        if (input.type === "activities") {
          // Top emitting activities
          const topActivities = await db
            .select({
              id: activityData.id,
              name: activityData.name,
              value: activityData.value,
              unit: activityData.unit,
              categoryName: emissionCategories.name,
              sector: emissionCategories.sector,
              projectName: ipccProjects.name,
              totalEmissions: sum(emissionCalculations.co2Equivalent),
              calculationCount: count(emissionCalculations.id),
            })
            .from(activityData)
            .leftJoin(
              emissionCategories,
              eq(activityData.categoryId, emissionCategories.id)
            )
            .leftJoin(ipccProjects, eq(activityData.projectId, ipccProjects.id))
            .leftJoin(
              emissionCalculations,
              eq(activityData.id, emissionCalculations.activityDataId)
            )
            .where(whereCondition)
            .groupBy(
              activityData.id,
              activityData.name,
              activityData.value,
              activityData.unit,
              emissionCategories.name,
              emissionCategories.sector,
              ipccProjects.name
            )
            .orderBy(desc(sum(emissionCalculations.co2Equivalent)))
            .limit(input.limit);

          return { topEmitters: topActivities, type: "activities" };
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get top emitters",
        });
      }
    }),

  // Compare multiple projects
  getComparisonChart: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string().uuid()).min(1).max(10),
        metric: z.enum(["total", "by_sector", "by_gas"]).default("total"),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get project basic info
        const projects = await db
          .select({
            id: ipccProjects.id,
            name: ipccProjects.name,
            year: ipccProjects.year,
            organizationName: ipccProjects.organizationName,
          })
          .from(ipccProjects)
          .where(inArray(ipccProjects.id, input.projectIds));

        if (input.metric === "total") {
          // Total emissions comparison
          const totalComparison = await db
            .select({
              projectId: emissionCalculations.projectId,
              totalEmissions: sum(emissionCalculations.co2Equivalent),
              calculationCount: count(),
            })
            .from(emissionCalculations)
            .where(inArray(emissionCalculations.projectId, input.projectIds))
            .groupBy(emissionCalculations.projectId);

          const comparisonData = projects.map((project) => {
            const emissions = totalComparison.find(
              (e) => e.projectId === project.id
            );
            return {
              ...project,
              totalEmissions: parseFloat(emissions?.totalEmissions || "0"),
              calculationCount: emissions?.calculationCount || 0,
            };
          });

          return { projects: comparisonData, metric: "total" };
        }

        if (input.metric === "by_sector") {
          // Sector comparison
          const sectorComparison = await db
            .select({
              projectId: projectSummaries.projectId,
              sector: projectSummaries.sector,
              totalEmissions: projectSummaries.totalCO2Equivalent,
            })
            .from(projectSummaries)
            .where(inArray(projectSummaries.projectId, input.projectIds));

          const comparisonData = projects.map((project) => {
            const sectors = sectorComparison.filter(
              (s) => s.projectId === project.id
            );
            return {
              ...project,
              sectorBreakdown: sectors.map((s) => ({
                sector: s.sector,
                emissions: parseFloat(s.totalEmissions || "0"),
              })),
            };
          });

          return { projects: comparisonData, metric: "by_sector" };
        }

        if (input.metric === "by_gas") {
          // Gas type comparison
          const gasComparison = await db
            .select({
              projectId: emissionCalculations.projectId,
              gasType: emissionCalculations.gasType,
              totalEmissions: sum(emissionCalculations.emissionValue),
              totalCO2Equivalent: sum(emissionCalculations.co2Equivalent),
            })
            .from(emissionCalculations)
            .where(inArray(emissionCalculations.projectId, input.projectIds))
            .groupBy(
              emissionCalculations.projectId,
              emissionCalculations.gasType
            );

          const comparisonData = projects.map((project) => {
            const gases = gasComparison.filter(
              (g) => g.projectId === project.id
            );
            return {
              ...project,
              gasBreakdown: gases.map((g) => ({
                gasType: g.gasType,
                emissions: parseFloat(g.totalEmissions || "0"),
                co2Equivalent: parseFloat(g.totalCO2Equivalent || "0"),
              })),
            };
          });

          return { projects: comparisonData, metric: "by_gas" };
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get comparison chart data",
        });
      }
    }),

  // Check compliance with targets/regulations
  getComplianceStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid().optional(),
        organizationName: z.string().optional(),
        targetYear: z.number().optional(),
        emissionTargets: z
          .object({
            totalCO2Equivalent: z.number().optional(),
            reductionPercentage: z.number().optional(),
            baselineYear: z.number().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let whereConditions = [];

        if (input.projectId) {
          whereConditions.push(eq(ipccProjects.id, input.projectId));
        }
        if (input.organizationName) {
          whereConditions.push(
            eq(ipccProjects.organizationName, input.organizationName)
          );
        }
        if (input.targetYear) {
          whereConditions.push(eq(ipccProjects.year, input.targetYear));
        }

        const whereCondition =
          whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get current emissions
        const currentEmissions = await db
          .select({
            projectId: emissionCalculations.projectId,
            projectName: ipccProjects.name,
            year: ipccProjects.year,
            organizationName: ipccProjects.organizationName,
            totalEmissions: sum(emissionCalculations.co2Equivalent),
          })
          .from(emissionCalculations)
          .leftJoin(
            ipccProjects,
            eq(emissionCalculations.projectId, ipccProjects.id)
          )
          .where(whereCondition)
          .groupBy(
            emissionCalculations.projectId,
            ipccProjects.name,
            ipccProjects.year,
            ipccProjects.organizationName
          );

        // Calculate compliance status
        const complianceData = currentEmissions.map((project) => {
          const currentTotal = parseFloat(project.totalEmissions || "0");
          let complianceStatus = "NO_TARGET";
          let targetValue = null;
          let variance = null;
          let isCompliant = null;

          if (input.emissionTargets?.totalCO2Equivalent) {
            targetValue = input.emissionTargets.totalCO2Equivalent;
            variance = currentTotal - targetValue;
            isCompliant = currentTotal <= targetValue;
            complianceStatus = isCompliant ? "COMPLIANT" : "NON_COMPLIANT";
          } else if (
            input.emissionTargets?.reductionPercentage &&
            input.emissionTargets?.baselineYear
          ) {
            // For reduction percentage, we'd need baseline data
            // This is a simplified version - in practice you'd fetch baseline year data
            const baselineTarget =
              currentTotal /
              (1 - input.emissionTargets.reductionPercentage / 100);
            targetValue =
              baselineTarget *
              (1 - input.emissionTargets.reductionPercentage / 100);
            variance = currentTotal - targetValue;
            isCompliant = currentTotal <= targetValue;
            complianceStatus = isCompliant ? "COMPLIANT" : "NON_COMPLIANT";
          }

          return {
            ...project,
            currentEmissions: currentTotal,
            targetValue,
            variance,
            variancePercentage:
              targetValue && variance !== null
                ? (variance / targetValue) * 100
                : null,
            isCompliant,
            complianceStatus,
          };
        });

        // Summary statistics
        const compliantProjects = complianceData.filter(
          (p) => p.isCompliant === true
        ).length;
        const nonCompliantProjects = complianceData.filter(
          (p) => p.isCompliant === false
        ).length;
        const projectsWithoutTargets = complianceData.filter(
          (p) => p.complianceStatus === "NO_TARGET"
        ).length;

        return {
          complianceData,
          summary: {
            totalProjects: complianceData.length,
            compliantProjects,
            nonCompliantProjects,
            projectsWithoutTargets,
            complianceRate:
              complianceData.length > 0
                ? (compliantProjects /
                    (compliantProjects + nonCompliantProjects)) *
                  100
                : 0,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get compliance status",
        });
      }
    }),
});
