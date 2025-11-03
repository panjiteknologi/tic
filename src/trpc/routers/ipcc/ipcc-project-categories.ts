import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import { 
  projectCategories, 
  ipccProjects, 
  emissionCategories 
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

const assignCategorySchema = z.object({
  projectId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

const removeCategorySchema = z.object({
  projectId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

const bulkAssignSchema = z.object({
  projectId: z.string().uuid(),
  categoryIds: z.array(z.string().uuid()),
});

export const ipccProjectCategoriesRouter = createTRPCRouter({
  // Assign category to project
  assignCategory: protectedProcedure
    .input(assignCategorySchema)
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
            message: "Project not found",
          });
        }

        // Check if category exists
        const category = await db
          .select()
          .from(emissionCategories)
          .where(eq(emissionCategories.id, input.categoryId))
          .limit(1);

        if (category.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emission category not found",
          });
        }

        // Check if relationship already exists
        const existingRelation = await db
          .select()
          .from(projectCategories)
          .where(
            and(
              eq(projectCategories.projectId, input.projectId),
              eq(projectCategories.categoryId, input.categoryId)
            )
          )
          .limit(1);

        if (existingRelation.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Category is already assigned to this project",
          });
        }

        const [newAssignment] = await db
          .insert(projectCategories)
          .values({
            projectId: input.projectId,
            categoryId: input.categoryId,
          })
          .returning();

        return {
          success: true,
          assignment: newAssignment,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign category to project",
        });
      }
    }),

  // Remove category from project
  removeCategory: protectedProcedure
    .input(removeCategorySchema)
    .mutation(async ({ input }) => {
      try {
        // Check if relationship exists
        const existingRelation = await db
          .select()
          .from(projectCategories)
          .where(
            and(
              eq(projectCategories.projectId, input.projectId),
              eq(projectCategories.categoryId, input.categoryId)
            )
          )
          .limit(1);

        if (existingRelation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category is not assigned to this project",
          });
        }

        await db
          .delete(projectCategories)
          .where(
            and(
              eq(projectCategories.projectId, input.projectId),
              eq(projectCategories.categoryId, input.categoryId)
            )
          );

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove category from project",
        });
      }
    }),

  // Bulk assign categories to project
  bulkAssign: protectedProcedure
    .input(bulkAssignSchema)
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
            message: "Project not found",
          });
        }

        // Get existing category assignments
        const existingAssignments = await db
          .select({
            categoryId: projectCategories.categoryId,
          })
          .from(projectCategories)
          .where(eq(projectCategories.projectId, input.projectId));

        const existingCategoryIds = existingAssignments.map(
          (assignment) => assignment.categoryId
        );

        // Filter out categories that are already assigned
        const newCategoryIds = input.categoryIds.filter(
          (categoryId) => !existingCategoryIds.includes(categoryId)
        );

        // Only insert new assignments if there are new categories
        let newAssignments: any[] = [];
        if (newCategoryIds.length > 0) {
          const assignments = newCategoryIds.map((categoryId) => ({
            projectId: input.projectId,
            categoryId,
          }));

          newAssignments = await db
            .insert(projectCategories)
            .values(assignments)
            .returning();
        }

        return {
          success: true,
          assignments: newAssignments,
          message: `${newCategoryIds.length} new categories assigned, ${existingCategoryIds.length} categories already existed`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk assign categories",
        });
      }
    }),

  // Get categories by project
  getCategoriesByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const categories = await db
        .select({
          id: projectCategories.id,
          categoryId: emissionCategories.id,
          categoryCode: emissionCategories.code,
          categoryName: emissionCategories.name,
          sector: emissionCategories.sector,
          assignedAt: projectCategories.createdAt,
        })
        .from(projectCategories)
        .innerJoin(
          emissionCategories,
          eq(projectCategories.categoryId, emissionCategories.id)
        )
        .where(eq(projectCategories.projectId, input.projectId))
        .orderBy(emissionCategories.code);

      // Group by sector
      const categoriesBySector = categories.reduce((acc, category) => {
        const sector = category.sector;
        if (!acc[sector]) {
          acc[sector] = [];
        }
        acc[sector].push(category);
        return acc;
      }, {} as Record<string, typeof categories>);

      return {
        projectId: input.projectId,
        categories,
        categoriesBySector,
      };
    }),

  // Get projects by category
  getProjectsByCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const projects = await db
        .select({
          id: projectCategories.id,
          projectId: ipccProjects.id,
          projectName: ipccProjects.name,
          projectDescription: ipccProjects.description,
          projectYear: ipccProjects.year,
          projectStatus: ipccProjects.status,
          assignedAt: projectCategories.createdAt,
        })
        .from(projectCategories)
        .innerJoin(
          ipccProjects,
          eq(projectCategories.projectId, ipccProjects.id)
        )
        .where(eq(projectCategories.categoryId, input.categoryId))
        .orderBy(ipccProjects.name);

      return {
        categoryId: input.categoryId,
        projects,
      };
    }),

  // Get all project-category relationships
  getAll: protectedProcedure.query(async () => {
    const relationships = await db
      .select({
        id: projectCategories.id,
        projectId: ipccProjects.id,
        projectName: ipccProjects.name,
        categoryId: emissionCategories.id,
        categoryCode: emissionCategories.code,
        categoryName: emissionCategories.name,
        sector: emissionCategories.sector,
        assignedAt: projectCategories.createdAt,
      })
      .from(projectCategories)
      .innerJoin(
        ipccProjects,
        eq(projectCategories.projectId, ipccProjects.id)
      )
      .innerJoin(
        emissionCategories,
        eq(projectCategories.categoryId, emissionCategories.id)
      )
      .orderBy(ipccProjects.name, emissionCategories.code);

    return {
      relationships,
    };
  }),

  // Get all categories with assignment status for a project
  getAvailableCategories: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      // Get already assigned category IDs
      const assignedCategories = await db
        .select({
          categoryId: projectCategories.categoryId,
        })
        .from(projectCategories)
        .where(eq(projectCategories.projectId, input.projectId));

      const assignedCategoryIds = assignedCategories.map(
        (ac) => ac.categoryId
      );

      // Get all categories
      const allCategories = await db
        .select({
          id: emissionCategories.id,
          code: emissionCategories.code,
          name: emissionCategories.name,
          sector: emissionCategories.sector,
          createdAt: emissionCategories.createdAt,
        })
        .from(emissionCategories)
        .orderBy(emissionCategories.code);

      // Add isAssigned status to all categories
      const categoriesWithStatus = allCategories.map(category => ({
        ...category,
        isAssigned: assignedCategoryIds.includes(category.id)
      }));

      // Filter only unassigned categories for availableCategories
      const availableCategories = categoriesWithStatus.filter(
        (category) => !category.isAssigned
      );

      // Group all categories by sector (including assigned ones)
      const allCategoriesBySector = categoriesWithStatus.reduce((acc, category) => {
        const sector = category.sector;
        if (!acc[sector]) {
          acc[sector] = [];
        }
        acc[sector].push(category);
        return acc;
      }, {} as Record<string, typeof categoriesWithStatus>);

      // Group only available categories by sector
      const categoriesBySector = availableCategories.reduce((acc, category) => {
        const sector = category.sector;
        if (!acc[sector]) {
          acc[sector] = [];
        }
        acc[sector].push(category);
        return acc;
      }, {} as Record<string, typeof availableCategories>);

      return {
        projectId: input.projectId,
        availableCategories,
        categoriesBySector,
        allCategories: categoriesWithStatus,
        allCategoriesBySector,
      };
    }),
});