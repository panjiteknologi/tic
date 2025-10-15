import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import { emissionCategories } from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

const createEmissionCategorySchema = z.object({
  code: z.string().min(1, "Category code is required"),
  name: z.string().min(1, "Category name is required"),
  sector: z.enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"]),
});

const updateEmissionCategorySchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1, "Category code is required").optional(),
  name: z.string().min(1, "Category name is required").optional(),
  sector: z.enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"]).optional(),
});

export const ipccEmissionCategoriesRouter = createTRPCRouter({
  // Create new category
  create: protectedProcedure
    .input(createEmissionCategorySchema)
    .mutation(async ({ input }) => {
      try {
        // Check if category code already exists
        const existingCategory = await db
          .select()
          .from(emissionCategories)
          .where(eq(emissionCategories.code, input.code))
          .limit(1);

        if (existingCategory.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Category code already exists",
          });
        }

        const [newCategory] = await db
          .insert(emissionCategories)
          .values({
            code: input.code,
            name: input.name,
            sector: input.sector,
          })
          .returning();

        return {
          success: true,
          category: newCategory,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create emission category",
        });
      }
    }),

  // Get category by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const category = await db
        .select({
          id: emissionCategories.id,
          code: emissionCategories.code,
          name: emissionCategories.name,
          sector: emissionCategories.sector,
          createdAt: emissionCategories.createdAt,
        })
        .from(emissionCategories)
        .where(eq(emissionCategories.id, input.id))
        .limit(1);

      if (category.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Emission category not found",
        });
      }

      return { category: category[0] };
    }),

  // Get all categories (hierarchical tree structure)
  getAll: protectedProcedure.query(async () => {
      const categories = await db
        .select({
          id: emissionCategories.id,
          code: emissionCategories.code,
          name: emissionCategories.name,
          sector: emissionCategories.sector,
          createdAt: emissionCategories.createdAt,
        })
        .from(emissionCategories)
        .orderBy(emissionCategories.code);

      // Group categories by sector for hierarchical structure
      const categoryTree = categories.reduce((acc, category) => {
        const sector = category.sector;
        if (!acc[sector]) {
          acc[sector] = [];
        }
        acc[sector].push(category);
        return acc;
      }, {} as Record<string, typeof categories>);

      // Sort categories within each sector by code
      Object.keys(categoryTree).forEach((sector) => {
        categoryTree[sector].sort((a, b) => a.code.localeCompare(b.code));
      });

      return {
        categories,
        categoryTree,
      };
    }),

  // Get categories by sector
  getBySector: protectedProcedure
    .input(
      z.object({
        sector: z.enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"]),
      })
    )
    .query(async ({ input }) => {
      const categories = await db
        .select({
          id: emissionCategories.id,
          code: emissionCategories.code,
          name: emissionCategories.name,
          sector: emissionCategories.sector,
          createdAt: emissionCategories.createdAt,
        })
        .from(emissionCategories)
        .where(eq(emissionCategories.sector, input.sector))
        .orderBy(emissionCategories.code);

      return {
        sector: input.sector,
        categories,
      };
    }),

  // Update category
  update: protectedProcedure
    .input(updateEmissionCategorySchema)
    .mutation(async ({ input }) => {
      try {
        // Check if category exists
        const existingCategory = await db
          .select()
          .from(emissionCategories)
          .where(eq(emissionCategories.id, input.id))
          .limit(1);

        if (existingCategory.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emission category not found",
          });
        }

        // If updating code, check for conflicts
        if (input.code) {
          const codeConflict = await db
            .select()
            .from(emissionCategories)
            .where(eq(emissionCategories.code, input.code))
            .limit(1);

          if (codeConflict.length > 0 && codeConflict[0].id !== input.id) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Category code already exists",
            });
          }
        }

        const [updatedCategory] = await db
          .update(emissionCategories)
          .set({
            ...(input.code && { code: input.code }),
            ...(input.name && { name: input.name }),
            ...(input.sector && { sector: input.sector }),
          })
          .where(eq(emissionCategories.id, input.id))
          .returning();

        return {
          success: true,
          category: updatedCategory,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update emission category",
        });
      }
    }),

  // Delete category
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if category exists
        const existingCategory = await db
          .select()
          .from(emissionCategories)
          .where(eq(emissionCategories.id, input.id))
          .limit(1);

        if (existingCategory.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emission category not found",
          });
        }

        // Delete category (cascade will handle related records)
        await db
          .delete(emissionCategories)
          .where(eq(emissionCategories.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete emission category",
        });
      }
    }),
});
