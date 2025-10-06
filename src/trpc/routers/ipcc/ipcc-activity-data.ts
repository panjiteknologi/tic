import { z } from "zod";
import { eq, and, inArray, ilike } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import { 
  activityData, 
  ipccProjects, 
  emissionCategories 
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

const createActivityDataSchema = z.object({
  projectId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1, "Activity name is required"),
  description: z.string().optional(),
  value: z.number().min(0, "Value must be non-negative"),
  unit: z.string().min(1, "Unit is required"),
  source: z.string().optional(),
});

const updateActivityDataSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1, "Activity name is required").optional(),
  description: z.string().optional(),
  value: z.number().min(0, "Value must be non-negative").optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  source: z.string().optional(),
});

export const ipccActivityDataRouter = createTRPCRouter({
  // Create new activity data
  create: protectedProcedure
    .input(createActivityDataSchema)
    .mutation(async ({ ctx, input }) => {
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

        // Create activity data
        const [newActivityData] = await db
          .insert(activityData)
          .values({
            projectId: input.projectId,
            categoryId: input.categoryId,
            name: input.name,
            description: input.description,
            value: input.value.toString(),
            unit: input.unit,
            source: input.source,
            createdBy: ctx.user.id,
          })
          .returning();

        return {
          success: true,
          activityData: newActivityData,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create activity data",
        });
      }
    }),

  // Get activity data by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const activity = await db
        .select({
          id: activityData.id,
          projectId: activityData.projectId,
          categoryId: activityData.categoryId,
          name: activityData.name,
          description: activityData.description,
          value: activityData.value,
          unit: activityData.unit,
          source: activityData.source,
          createdAt: activityData.createdAt,
          updatedAt: activityData.updatedAt,
          createdBy: activityData.createdBy,
          // Include related data
          project: {
            id: ipccProjects.id,
            name: ipccProjects.name,
          },
          category: {
            id: emissionCategories.id,
            name: emissionCategories.name,
            code: emissionCategories.code,
            sector: emissionCategories.sector,
          },
        })
        .from(activityData)
        .leftJoin(ipccProjects, eq(activityData.projectId, ipccProjects.id))
        .leftJoin(emissionCategories, eq(activityData.categoryId, emissionCategories.id))
        .where(eq(activityData.id, input.id))
        .limit(1);

      if (activity.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activity data not found",
        });
      }

      return { activityData: activity[0] };
    }),

  // Get activity data by project ID
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        categoryId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
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

      // Build where conditions
      const whereConditions = [eq(activityData.projectId, input.projectId)];
      if (input.categoryId) {
        whereConditions.push(eq(activityData.categoryId, input.categoryId));
      }

      // Get activity data for the project
      const activities = await db
        .select({
          id: activityData.id,
          projectId: activityData.projectId,
          categoryId: activityData.categoryId,
          name: activityData.name,
          description: activityData.description,
          value: activityData.value,
          unit: activityData.unit,
          source: activityData.source,
          createdAt: activityData.createdAt,
          updatedAt: activityData.updatedAt,
          createdBy: activityData.createdBy,
          // Include category data
          category: {
            id: emissionCategories.id,
            name: emissionCategories.name,
            code: emissionCategories.code,
            sector: emissionCategories.sector,
          },
        })
        .from(activityData)
        .leftJoin(emissionCategories, eq(activityData.categoryId, emissionCategories.id))
        .where(and(...whereConditions));

      return { activityData: activities };
    }),

  // Update activity data
  update: protectedProcedure
    .input(updateActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if activity data exists
        const existingActivity = await db
          .select()
          .from(activityData)
          .where(eq(activityData.id, input.id))
          .limit(1);

        if (existingActivity.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity data not found",
          });
        }

        // Check if category exists (if provided)
        if (input.categoryId) {
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
        }

        // Update activity data
        const [updatedActivity] = await db
          .update(activityData)
          .set({
            ...(input.categoryId && { categoryId: input.categoryId }),
            ...(input.name && { name: input.name }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.value && { value: input.value.toString() }),
            ...(input.unit && { unit: input.unit }),
            ...(input.source !== undefined && { source: input.source }),
            updatedAt: new Date(),
          })
          .where(eq(activityData.id, input.id))
          .returning();

        return {
          success: true,
          activityData: updatedActivity,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update activity data",
        });
      }
    }),

  // Delete activity data
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if activity data exists
        const existingActivity = await db
          .select()
          .from(activityData)
          .where(eq(activityData.id, input.id))
          .limit(1);

        if (existingActivity.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity data not found",
          });
        }

        // Delete activity data (cascade will handle related calculations)
        await db.delete(activityData).where(eq(activityData.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete activity data",
        });
      }
    }),

  // Bulk delete activity data
  bulkDelete: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if all activity data exist
        const existingActivities = await db
          .select({ id: activityData.id })
          .from(activityData)
          .where(inArray(activityData.id, input.ids));

        if (existingActivities.length !== input.ids.length) {
          const foundIds = existingActivities.map(a => a.id);
          const missingIds = input.ids.filter(id => !foundIds.includes(id));
          
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Activity data not found for IDs: ${missingIds.join(", ")}`,
          });
        }

        // Bulk delete activity data (cascade will handle related calculations)
        const deletedCount = await db
          .delete(activityData)
          .where(inArray(activityData.id, input.ids));

        return {
          success: true,
          deletedCount: input.ids.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk delete activity data",
        });
      }
    }),

  // Search activity data by category
  searchByCategory: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid().optional(),
        categoryCode: z.string().optional(),
        categoryName: z.string().optional(),
        sector: z.enum(["ENERGY", "IPPU", "AFOLU", "WASTE", "OTHER"]).optional(),
        searchTerm: z.string().optional(), // for activity name/description search
      })
    )
    .query(async ({ input }) => {
      try {
        // Build where conditions
        const whereConditions = [];
        
        if (input.projectId) {
          whereConditions.push(eq(activityData.projectId, input.projectId));
        }
        
        if (input.categoryCode) {
          whereConditions.push(ilike(emissionCategories.code, `%${input.categoryCode}%`));
        }
        
        if (input.categoryName) {
          whereConditions.push(ilike(emissionCategories.name, `%${input.categoryName}%`));
        }
        
        if (input.sector) {
          whereConditions.push(eq(emissionCategories.sector, input.sector));
        }
        
        if (input.searchTerm) {
          whereConditions.push(
            ilike(activityData.name, `%${input.searchTerm}%`)
          );
        }

        // Search activity data with category filters
        const activities = await db
          .select({
            id: activityData.id,
            projectId: activityData.projectId,
            categoryId: activityData.categoryId,
            name: activityData.name,
            description: activityData.description,
            value: activityData.value,
            unit: activityData.unit,
            source: activityData.source,
            createdAt: activityData.createdAt,
            updatedAt: activityData.updatedAt,
            createdBy: activityData.createdBy,
            // Include project data
            project: {
              id: ipccProjects.id,
              name: ipccProjects.name,
              year: ipccProjects.year,
              status: ipccProjects.status,
            },
            // Include category data
            category: {
              id: emissionCategories.id,
              name: emissionCategories.name,
              code: emissionCategories.code,
              sector: emissionCategories.sector,
            },
          })
          .from(activityData)
          .leftJoin(ipccProjects, eq(activityData.projectId, ipccProjects.id))
          .leftJoin(emissionCategories, eq(activityData.categoryId, emissionCategories.id))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        return { 
          activityData: activities,
          total: activities.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search activity data by category",
        });
      }
    }),
});