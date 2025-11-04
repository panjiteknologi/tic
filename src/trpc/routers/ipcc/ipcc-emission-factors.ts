import { z } from "zod";
import { eq, and, or, like } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../../init";
import { db } from "@/db";
import {
  emissionFactors,
} from "@/db/schema/ipcc-schema";
import { TRPCError } from "@trpc/server";

const createEmissionFactorSchema = z.object({
  name: z.string().min(1, "Emission factor name is required"),
  gasType: z.enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"]),
  tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]),
  value: z.string().min(1, "Value is required"),
  unit: z.string().min(1, "Unit is required"),
  source: z.string().optional(),
});

const updateEmissionFactorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Emission factor name is required").optional(),
  gasType: z.enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"]).optional(),
  tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]).optional(),
  value: z.string().min(1, "Value is required").optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  source: z.string().optional(),
});

export const ipccEmissionFactorsRouter = createTRPCRouter({
  // Create new emission factor
  create: protectedProcedure
    .input(createEmissionFactorSchema)
    .mutation(async ({ input }) => {
      try {
        const [newEmissionFactor] = await db
          .insert(emissionFactors)
          .values({
            name: input.name,
            gasType: input.gasType,
            tier: input.tier,
            value: input.value,
            unit: input.unit,
            source: input.source,
          })
          .returning();

        return {
          success: true,
          emissionFactor: newEmissionFactor,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create emission factor",
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
      const emissionFactor = await db
        .select({
          id: emissionFactors.id,
          name: emissionFactors.name,
          gasType: emissionFactors.gasType,
          tier: emissionFactors.tier,
          value: emissionFactors.value,
          unit: emissionFactors.unit,
          source: emissionFactors.source,
          createdAt: emissionFactors.createdAt,
        })
        .from(emissionFactors)
        .where(eq(emissionFactors.id, input.id))
        .limit(1);

      if (emissionFactor.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Emission factor not found",
        });
      }

      return { emissionFactor: emissionFactor[0] };
    }),

  // Get all emission factors (with filters)
  getAll: protectedProcedure
    .input(
      z.object({
        gasType: z.enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"]).optional(),
        tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const whereConditions = [];

      if (input.gasType) {
        whereConditions.push(eq(emissionFactors.gasType, input.gasType));
      }

      if (input.tier) {
        whereConditions.push(eq(emissionFactors.tier, input.tier));
      }

      if (input.search) {
        whereConditions.push(
          or(
            like(emissionFactors.name, `%${input.search}%`),
            like(emissionFactors.unit, `%${input.search}%`),
            like(emissionFactors.source, `%${input.search}%`)
          )
        );
      }

      const whereCondition = whereConditions.length > 0 
        ? and(...whereConditions) 
        : undefined;

      const emissionFactorsList = await db
        .select({
          id: emissionFactors.id,
          name: emissionFactors.name,
          gasType: emissionFactors.gasType,
          tier: emissionFactors.tier,
          value: emissionFactors.value,
          unit: emissionFactors.unit,
          source: emissionFactors.source,
          createdAt: emissionFactors.createdAt,
        })
        .from(emissionFactors)
        .where(whereCondition)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(emissionFactors.createdAt);

      // Get total count for pagination
      const totalCount = await db
        .select({ count: emissionFactors.id })
        .from(emissionFactors)
        .where(whereCondition);

      return {
        emissionFactors: emissionFactorsList,
        pagination: {
          total: totalCount.length,
          limit: input.limit,
          offset: input.offset,
          hasMore: totalCount.length > input.offset + input.limit,
        },
      };
    }),


  // Get emission factors by tier
  getByTier: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]),
        gasType: z.enum(["CO2", "CH4", "N2O", "HFCs", "PFCs", "SF6", "NF3"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const whereConditions = [eq(emissionFactors.tier, input.tier)];

      if (input.gasType) {
        whereConditions.push(eq(emissionFactors.gasType, input.gasType));
      }

      const whereCondition = and(...whereConditions);

      const emissionFactorsList = await db
        .select({
          id: emissionFactors.id,
          name: emissionFactors.name,
          gasType: emissionFactors.gasType,
          tier: emissionFactors.tier,
          value: emissionFactors.value,
          unit: emissionFactors.unit,
          source: emissionFactors.source,
          createdAt: emissionFactors.createdAt,
        })
        .from(emissionFactors)
        .where(whereCondition)
        .orderBy(emissionFactors.gasType);

      return {
        tier: input.tier,
        emissionFactors: emissionFactorsList,
      };
    }),

  // Update emission factor
  update: protectedProcedure
    .input(updateEmissionFactorSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if emission factor exists
        const existingEmissionFactor = await db
          .select()
          .from(emissionFactors)
          .where(eq(emissionFactors.id, input.id))
          .limit(1);

        if (existingEmissionFactor.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emission factor not found",
          });
        }

        const [updatedEmissionFactor] = await db
          .update(emissionFactors)
          .set({
            ...(input.name && { name: input.name }),
            ...(input.gasType && { gasType: input.gasType }),
            ...(input.tier && { tier: input.tier }),
            ...(input.value && { value: input.value }),
            ...(input.unit && { unit: input.unit }),
            ...(input.source !== undefined && { source: input.source }),
          })
          .where(eq(emissionFactors.id, input.id))
          .returning();

        return {
          success: true,
          emissionFactor: updatedEmissionFactor,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update emission factor",
        });
      }
    }),

  // Delete emission factor
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if emission factor exists
        const existingEmissionFactor = await db
          .select()
          .from(emissionFactors)
          .where(eq(emissionFactors.id, input.id))
          .limit(1);

        if (existingEmissionFactor.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Emission factor not found",
          });
        }

        // Delete emission factor (cascade will handle related records)
        await db
          .delete(emissionFactors)
          .where(eq(emissionFactors.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete emission factor",
        });
      }
    }),
});