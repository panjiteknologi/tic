/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { eq, ilike, count } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { standard } from "@/db/schema/standard-schema";
import { TRPCError } from "@trpc/server";

export const standardRouter = createTRPCRouter({
  // Create standard
  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if code already exists
        const existingStandard = await db
          .select()
          .from(standard)
          .where(eq(standard.code, input.code))
          .limit(1);

        if (existingStandard.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Standard code already exists",
          });
        }

        // Create standard
        const [newStandard] = await db
          .insert(standard)
          .values({
            name: input.name,
            code: input.code,
          })
          .returning();

        return {
          success: true,
          standard: newStandard,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create standard",
        });
      }
    }),

  // Update standard
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, "Name is required").optional(),
        code: z.string().min(1, "Code is required").optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if standard exists
        const existingStandard = await db
          .select()
          .from(standard)
          .where(eq(standard.id, input.id))
          .limit(1);

        if (existingStandard.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Standard not found",
          });
        }

        // Check if code already exists (if code is being updated)
        if (input.code && input.code !== existingStandard[0].code) {
          const codeExists = await db
            .select()
            .from(standard)
            .where(eq(standard.code, input.code))
            .limit(1);

          if (codeExists.length > 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Standard code already exists",
            });
          }
        }

        // Update standard
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name;
        }
        if (input.code !== undefined) {
          updateData.code = input.code;
        }

        const [updatedStandard] = await db
          .update(standard)
          .set(updateData)
          .where(eq(standard.id, input.id))
          .returning();

        return {
          success: true,
          standard: updatedStandard,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update standard",
        });
      }
    }),

  // Delete standard
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if standard exists
        const existingStandard = await db
          .select()
          .from(standard)
          .where(eq(standard.id, input.id))
          .limit(1);

        if (existingStandard.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Standard not found",
          });
        }

        // Delete standard
        await db.delete(standard).where(eq(standard.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete standard",
        });
      }
    }),

  // List all standards
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const whereClause = input.search
          ? ilike(standard.name, `%${input.search}%`)
          : undefined;

        // Get standards with pagination
        const standards = await db
          .select()
          .from(standard)
          .where(whereClause)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(standard.createdAt);

        // Get total count for pagination
        const totalResult = await db
          .select({ count: count() })
          .from(standard)
          .where(whereClause);

        const total = totalResult[0]?.count ?? 0;

        return {
          standards,
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
          message: "Failed to fetch standards",
        });
      }
    }),
});
