import { z } from "zod";
import { eq, sum, sql } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import {
  ipccProjects,
  projectSummaries,
  emissionCalculations,
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

const createIpccProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional().transform(val => val === "" ? null : val),
  year: z.number().int().min(1900).max(2100),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
  organizationName: z.string().nullable().optional().transform(val => val === "" ? null : val),
  location: z.string().nullable().optional().transform(val => val === "" ? null : val),
});

const updateIpccProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().nullable().optional().transform(val => val === "" ? null : val),
  year: z.number().int().min(1900).max(2100).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  organizationName: z.string().nullable().optional().transform(val => val === "" ? null : val),
  location: z.string().nullable().optional().transform(val => val === "" ? null : val),
});

export const ipccProjectsRouter = createTRPCRouter({
  // Create new IPCC project
  create: protectedProcedure
    .input(createIpccProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user?.id;
        const createdBy =
          userId && z.string().uuid().safeParse(userId).success ? userId : null;

        const [newProject] = await db
          .insert(ipccProjects)
          .values({
            name: input.name,
            description: input.description,
            year: input.year,
            status: input.status || "DRAFT",
            organizationName: input.organizationName,
            location: input.location,
            createdBy,
          })
          .returning();

        return {
          success: true,
          project: newProject,
        };
      } catch (error) {
        console.error("Error creating IPCC project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create IPCC project",
          cause: error,
        });
      }
    }),

  // Get IPCC project by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const project = await db
        .select()
        .from(ipccProjects)
        .where(eq(ipccProjects.id, input.id))
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "IPCC project not found",
        });
      }

      return { project: project[0] };
    }),

  // Get all IPCC projects
  getAll: protectedProcedure.query(async () => {
    const projects = await db
      .select({
        id: ipccProjects.id,
        name: ipccProjects.name,
        description: ipccProjects.description,
        year: ipccProjects.year,
        status: ipccProjects.status,
        organizationName: ipccProjects.organizationName,
        location: ipccProjects.location,
        createdAt: ipccProjects.createdAt,
        updatedAt: ipccProjects.updatedAt,
        createdBy: ipccProjects.createdBy,
      })
      .from(ipccProjects);

    return { projects };
  }),

  // Update IPCC project
  update: protectedProcedure
    .input(updateIpccProjectSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        // Update project
        const [updatedProject] = await db
          .update(ipccProjects)
          .set({
            ...(input.name && { name: input.name }),
            ...(input.description !== undefined && {
              description: input.description,
            }),
            ...(input.year && { year: input.year }),
            ...(input.status && { status: input.status }),
            ...(input.organizationName !== undefined && {
              organizationName: input.organizationName,
            }),
            ...(input.location !== undefined && { location: input.location }),
            updatedAt: new Date(),
          })
          .where(eq(ipccProjects.id, input.id))
          .returning();

        return {
          success: true,
          project: updatedProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update IPCC project",
        });
      }
    }),

  // Delete IPCC project
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        // Delete project (cascade will handle related records)
        await db.delete(ipccProjects).where(eq(ipccProjects.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete IPCC project",
        });
      }
    }),

  // Update project status (workflow: DRAFT → ACTIVE → COMPLETED → ARCHIVED)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if project exists
        const existingProject = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.id))
          .limit(1);

        if (existingProject.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        const currentStatus = existingProject[0].status;
        const newStatus = input.status;

        // Validate status workflow
        const statusWorkflow: Record<
          "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
          Array<"DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED">
        > = {
          DRAFT: ["ACTIVE"],
          ACTIVE: ["COMPLETED", "ARCHIVED"],
          COMPLETED: ["ARCHIVED"],
          ARCHIVED: [],
        };

        if (
          !statusWorkflow[
            currentStatus as keyof typeof statusWorkflow
          ].includes(newStatus)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot change status from ${currentStatus} to ${newStatus}`,
          });
        }

        // Update project status
        const [updatedProject] = await db
          .update(ipccProjects)
          .set({
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(ipccProjects.id, input.id))
          .returning();

        return {
          success: true,
          project: updatedProject,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project status",
        });
      }
    }),

  // Get project statistics (total emissions, breakdown by sector, etc)
  getStats: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Check if project exists
        const project = await db
          .select()
          .from(ipccProjects)
          .where(eq(ipccProjects.id, input.id))
          .limit(1);

        if (project.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "IPCC project not found",
          });
        }

        // Get total emissions from calculations
        const totalEmissions = await db
          .select({
            totalCO2Equivalent: sum(emissionCalculations.co2Equivalent),
            count: sql<number>`count(*)`,
          })
          .from(emissionCalculations)
          .where(eq(emissionCalculations.projectId, input.id));

        // Get breakdown by sector from project summaries
        const sectorBreakdown = await db
          .select({
            sector: projectSummaries.sector,
            totalCO2: projectSummaries.totalCO2,
            totalCH4: projectSummaries.totalCH4,
            totalN2O: projectSummaries.totalN2O,
            totalOtherGases: projectSummaries.totalOtherGases,
            totalCO2Equivalent: projectSummaries.totalCO2Equivalent,
          })
          .from(projectSummaries)
          .where(eq(projectSummaries.projectId, input.id));

        // Get gas type breakdown from calculations
        const gasBreakdown = await db
          .select({
            gasType: emissionCalculations.gasType,
            totalEmissions: sum(emissionCalculations.emissionValue),
            totalCO2Equivalent: sum(emissionCalculations.co2Equivalent),
            count: sql<number>`count(*)`,
          })
          .from(emissionCalculations)
          .where(eq(emissionCalculations.projectId, input.id))
          .groupBy(emissionCalculations.gasType);

        return {
          project: project[0],
          totalStats: {
            totalCO2Equivalent: totalEmissions[0]?.totalCO2Equivalent || "0",
            totalCalculations: totalEmissions[0]?.count || 0,
          },
          sectorBreakdown,
          gasBreakdown,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get project statistics",
        });
      }
    }),
});
