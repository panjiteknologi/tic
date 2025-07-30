import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { products } from "@/db/schema/carbon-calculation-schema";
import { tenantUser } from "@/db/schema/tenant-schema";
import { TRPCError } from "@trpc/server";

const productSchema = z.object({
  tenantId: z.string().uuid(),
  carbonProjectId: z.string().uuid(),
  cornWet: z.string().optional(),
  moistureContent: z.string().optional(),
  cornDry: z.string().optional(),
  cultivationArea: z.string().optional(),
});

const updateProductSchema = z.object({
  id: z.string().uuid(),
  cornWet: z.string().optional(),
  moistureContent: z.string().optional(),
  cornDry: z.string().optional(),
  cultivationArea: z.string().optional(),
});

export const productsRouter = createTRPCRouter({
  // Add new product
  add: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, input.tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to this tenant",
          });
        }

        // Create product
        const [newProduct] = await db
          .insert(products)
          .values({
            tenantId: input.tenantId,
            carbonProjectId: input.carbonProjectId,
            cornWet: input.cornWet,
            moistureContent: input.moistureContent,
            cornDry: input.cornDry,
            cultivationArea: input.cultivationArea,
          })
          .returning();

        return {
          success: true,
          product: newProduct,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  // Update product
  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the product to check tenant ownership
        const existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);

        if (existingProduct.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingProduct[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to this tenant",
          });
        }

        // Update product
        const [updatedProduct] = await db
          .update(products)
          .set({
            cornWet: input.cornWet,
            moistureContent: input.moistureContent,
            cornDry: input.cornDry,
            cultivationArea: input.cultivationArea,
            updatedAt: new Date(),
          })
          .where(eq(products.id, input.id))
          .returning();

        return {
          success: true,
          product: updatedProduct,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),

  // Delete product
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the product to check tenant ownership
        const existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);

        if (existingProduct.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Check if user is member of this tenant
        const userTenant = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, existingProduct[0].tenantId),
              eq(tenantUser.userId, ctx.user.id),
              eq(tenantUser.isActive, true)
            )
          )
          .limit(1);

        if (userTenant.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to this tenant",
          });
        }

        // Delete product
        await db.delete(products).where(eq(products.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete product",
        });
      }
    }),

  // Get products by carbon project
  getByCarbonProjectId: protectedProcedure
    .input(
      z.object({
        carbonProjectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the carbon project data to check tenant ownership
      const projectProducts = await db
        .select()
        .from(products)
        .where(eq(products.carbonProjectId, input.carbonProjectId))
        .limit(1);

      if (projectProducts.length === 0) {
        return { products: [] };
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, projectProducts[0].tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (userTenant.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied to this tenant",
        });
      }

      const carbonProjectProducts = await db
        .select()
        .from(products)
        .where(eq(products.carbonProjectId, input.carbonProjectId));

      return { products: carbonProjectProducts };
    }),

  // Get product by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      if (product.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user is member of this tenant
      const userTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, product[0].tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (userTenant.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied to this tenant",
        });
      }

      return { product: product[0] };
    }),
});
