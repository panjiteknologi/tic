import { z } from 'zod';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { protectedProcedure, createTRPCRouter } from '../../init';
import { db } from '@/db';
import { defraEmissionFactors } from '@/db/schema/defra-schema';
import { TRPCError } from '@trpc/server';

export const defraEmissionFactorsRouter = createTRPCRouter({
  // Get all available years
  getAvailableYears: protectedProcedure.query(async () => {
    try {
      const years = await db
        .selectDistinct({
          year: defraEmissionFactors.year,
        })
        .from(defraEmissionFactors)
        .orderBy(desc(defraEmissionFactors.year));

      return {
        years: years.map((y) => y.year),
      };
    } catch (error) {
      console.error('Error fetching available years:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch available years',
      });
    }
  }),

  // Get emission factors by year with optional filters
  getByYear: protectedProcedure
    .input(
      z.object({
        year: z.string().length(4, 'Year must be 4 characters (e.g., "2024")'),
        level1Category: z.string().optional(),
        level2Category: z.string().optional(),
        level3Category: z.string().optional(),
        unit: z.string().optional(),
        scope: z.enum(['Scope 1', 'Scope 2', 'Scope 3']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).default(100).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [eq(defraEmissionFactors.year, input.year)];

        if (input.level1Category) {
          conditions.push(eq(defraEmissionFactors.level1Category, input.level1Category));
        }

        if (input.level2Category) {
          conditions.push(eq(defraEmissionFactors.level2Category, input.level2Category));
        }

        if (input.level3Category) {
          conditions.push(eq(defraEmissionFactors.level3Category, input.level3Category));
        }

        if (input.unit) {
          conditions.push(eq(defraEmissionFactors.unit, input.unit));
        }

        if (input.scope) {
          conditions.push(eq(defraEmissionFactors.scope, input.scope));
        }

        if (input.search) {
          conditions.push(
            or(
              like(defraEmissionFactors.activityName, `%${input.search}%`),
              like(defraEmissionFactors.level1Category, `%${input.search}%`),
              like(defraEmissionFactors.level2Category, `%${input.search}%`),
              like(defraEmissionFactors.level3Category, `%${input.search}%`)
            )!
          );
        }

        // Get total count
        const totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(defraEmissionFactors)
          .where(and(...conditions));

        const totalCount = Number(totalCountResult[0]?.count || 0);

        // Get emission factors
        const factors = await db
          .select()
          .from(defraEmissionFactors)
          .where(and(...conditions))
          .orderBy(
            desc(defraEmissionFactors.level1Category),
            desc(defraEmissionFactors.level2Category),
            desc(defraEmissionFactors.activityName)
          )
          .limit(input.limit || 100)
          .offset(input.offset || 0);

        return {
          factors,
          totalCount,
          limit: input.limit || 100,
          offset: input.offset || 0,
        };
      } catch (error) {
        console.error('Error fetching emission factors:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch emission factors',
        });
      }
    }),

  // Get emission factor by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const factor = await db
          .select()
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.id, input.id))
          .limit(1);

        if (factor.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Emission factor not found',
          });
        }

        return {
          factor: factor[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching emission factor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch emission factor',
        });
      }
    }),

  // Get categories for a specific year
  getCategoriesByYear: protectedProcedure
    .input(
      z.object({
        year: z.string().length(4, 'Year must be 4 characters (e.g., "2024")'),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get distinct level1 categories
        const level1Categories = await db
          .selectDistinct({
            category: defraEmissionFactors.level1Category,
          })
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.year, input.year))
          .orderBy(defraEmissionFactors.level1Category);

        // Get distinct level2 categories
        const level2Categories = await db
          .selectDistinct({
            category: defraEmissionFactors.level2Category,
            level1Category: defraEmissionFactors.level1Category,
          })
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.year, input.year))
          .orderBy(
            defraEmissionFactors.level1Category,
            defraEmissionFactors.level2Category
          );

        // Get distinct level3 categories
        const level3Categories = await db
          .selectDistinct({
            category: defraEmissionFactors.level3Category,
            level1Category: defraEmissionFactors.level1Category,
            level2Category: defraEmissionFactors.level2Category,
          })
          .from(defraEmissionFactors)
          .where(
            and(
              eq(defraEmissionFactors.year, input.year),
              sql`${defraEmissionFactors.level3Category} IS NOT NULL`
            )
          )
          .orderBy(
            defraEmissionFactors.level1Category,
            defraEmissionFactors.level2Category,
            defraEmissionFactors.level3Category
          );

        // Get distinct units
        const units = await db
          .selectDistinct({
            unit: defraEmissionFactors.unit,
            unitType: defraEmissionFactors.unitType,
          })
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.year, input.year))
          .orderBy(defraEmissionFactors.unit);

        // Get distinct scopes
        const scopes = await db
          .selectDistinct({
            scope: defraEmissionFactors.scope,
          })
          .from(defraEmissionFactors)
          .where(
            and(
              eq(defraEmissionFactors.year, input.year),
              sql`${defraEmissionFactors.scope} IS NOT NULL`
            )
          )
          .orderBy(defraEmissionFactors.scope);

        return {
          level1Categories: level1Categories.map((c) => c.category),
          level2Categories: level2Categories.map((c) => ({
            category: c.category,
            level1Category: c.level1Category,
          })),
          level3Categories: level3Categories.map((c) => ({
            category: c.category,
            level1Category: c.level1Category,
            level2Category: c.level2Category,
          })),
          units: units.map((u) => ({
            unit: u.unit,
            unitType: u.unitType,
          })),
          scopes: scopes.map((s) => s.scope).filter((s): s is string => s !== null),
        };
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
        });
      }
    }),

  // Get summary statistics for a year
  getYearSummary: protectedProcedure
    .input(
      z.object({
        year: z.string().length(4, 'Year must be 4 characters (e.g., "2024")'),
      })
    )
    .query(async ({ input }) => {
      try {
        const factors = await db
          .select()
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.year, input.year));

        const summary = {
          totalFactors: factors.length,
          byLevel1Category: {} as Record<string, number>,
          byScope: {} as Record<string, number>,
          byUnitType: {} as Record<string, number>,
        };

        for (const factor of factors) {
          // Count by level1 category
          const level1 = factor.level1Category || 'Unknown';
          summary.byLevel1Category[level1] = (summary.byLevel1Category[level1] || 0) + 1;

          // Count by scope
          const scope = factor.scope || 'Unknown';
          summary.byScope[scope] = (summary.byScope[scope] || 0) + 1;

          // Count by unit type
          const unitType = factor.unitType || 'Unknown';
          summary.byUnitType[unitType] = (summary.byUnitType[unitType] || 0) + 1;
        }

        return {
          year: input.year,
          summary,
        };
      } catch (error) {
        console.error('Error fetching year summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch year summary',
        });
      }
    }),
});

