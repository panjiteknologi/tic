import { z } from "zod";
import { eq, ilike, count } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { certification, standard } from "@/db/schema/standard-schema";
import { TRPCError } from "@trpc/server";

export const certificationRouter = createTRPCRouter({
  // Create certification
  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        standardId: z.string().uuid("Invalid standard ID"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if standard exists
        const existingStandard = await db
          .select()
          .from(standard)
          .where(eq(standard.id, input.standardId))
          .limit(1);

        if (existingStandard.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Standard not found",
          });
        }

        // Create certification
        const [newCertification] = await db
          .insert(certification)
          .values({
            name: input.name,
            standardId: input.standardId,
            description: input.description,
          })
          .returning();

        return {
          success: true,
          certification: newCertification,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create certification",
        });
      }
    }),

  // Update certification
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, "Name is required").optional(),
        standardId: z.string().uuid("Invalid standard ID").optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if certification exists
        const existingCertification = await db
          .select()
          .from(certification)
          .where(eq(certification.id, input.id))
          .limit(1);

        if (existingCertification.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certification not found",
          });
        }

        // Check if standard exists (if standardId is being updated)
        if (input.standardId) {
          const existingStandard = await db
            .select()
            .from(standard)
            .where(eq(standard.id, input.standardId))
            .limit(1);

          if (existingStandard.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Standard not found",
            });
          }
        }

        // Update certification
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name;
        }
        if (input.standardId !== undefined) {
          updateData.standardId = input.standardId;
        }
        if (input.description !== undefined) {
          updateData.description = input.description;
        }

        const [updatedCertification] = await db
          .update(certification)
          .set(updateData)
          .where(eq(certification.id, input.id))
          .returning();

        return {
          success: true,
          certification: updatedCertification,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update certification",
        });
      }
    }),

  // Delete certification
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if certification exists
        const existingCertification = await db
          .select()
          .from(certification)
          .where(eq(certification.id, input.id))
          .limit(1);

        if (existingCertification.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certification not found",
          });
        }

        // Delete certification
        await db.delete(certification).where(eq(certification.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete certification",
        });
      }
    }),

  // List all certifications with standard info
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        standardId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let whereClause = undefined;

        // Build where clause for search and standard filter
        if (input.search && input.standardId) {
          whereClause = eq(certification.standardId, input.standardId);
        } else if (input.search) {
          whereClause = ilike(certification.name, `%${input.search}%`);
        } else if (input.standardId) {
          whereClause = eq(certification.standardId, input.standardId);
        }

        // Get certifications with standard info
        const certifications = await db
          .select({
            id: certification.id,
            name: certification.name,
            description: certification.description,
            standardId: certification.standardId,
            createdAt: certification.createdAt,
            updatedAt: certification.updatedAt,
            standard: {
              id: standard.id,
              name: standard.name,
              code: standard.code,
            },
          })
          .from(certification)
          .innerJoin(standard, eq(certification.standardId, standard.id))
          .where(whereClause)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(certification.createdAt);

        // Get total count for pagination
        const totalResult = await db
          .select({ count: count() })
          .from(certification)
          .innerJoin(standard, eq(certification.standardId, standard.id))
          .where(whereClause);
          
        const total = totalResult[0]?.count ?? 0;

        return {
          certifications,
          pagination: {
            total,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < total,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch certifications",
        });
      }
    }),
});