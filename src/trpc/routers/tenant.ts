import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { tenant, tenantUser } from "@/db/schema/tenant-schema";
import { user } from "@/db/schema/auth-schema";
import { TRPCError } from "@trpc/server";
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteS3Object,
  generateTenantLogoKey,
  validateLogoFileType,
  validateFileSize,
} from "@/lib/s3";

export const tenantRouter = createTRPCRouter({
  // Create tenant - first user becomes superadmin
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Tenant name is required"),
        slug: z.string().min(1, "Tenant slug is required"),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if slug already exists
        const existingTenant = await db
          .select()
          .from(tenant)
          .where(eq(tenant.slug, input.slug))
          .limit(1);

        if (existingTenant.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tenant slug already exists",
          });
        }

        // Create tenant
        const [newTenant] = await db
          .insert(tenant)
          .values({
            name: input.name,
            slug: input.slug,
            domain: input.domain,
          })
          .returning();

        // Add user as superadmin
        await db.insert(tenantUser).values({
          tenantId: newTenant.id,
          userId: ctx.user.id,
          role: "superadmin",
        });

        return {
          success: true,
          tenant: newTenant,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create tenant",
        });
      }
    }),

  // Get user's tenants
  getUserTenants: protectedProcedure
    .query(async ({ ctx }) => {
      const userTenants = await db
        .select({
          tenant: tenant,
          role: tenantUser.role,
          joinedAt: tenantUser.joinedAt,
          isActive: tenantUser.isActive,
        })
        .from(tenantUser)
        .innerJoin(tenant, eq(tenantUser.tenantId, tenant.id))
        .where(
          and(
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true),
            eq(tenant.isActive, true)
          )
        );

      return { tenants: userTenants };
    }),

  // Get tenant details (only for members)
  getById: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      const tenantData = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, input.tenantId))
        .limit(1);

      if (tenantData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      return {
        tenant: tenantData[0],
        userRole: userTenant[0].role,
      };
    }),

  // Get tenant members (only for superadmin/admin)
  getMembers: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is superadmin or admin
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

      if (
        userTenant.length === 0 ||
        !["superadmin", "admin"].includes(userTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can view members",
        });
      }

      const members = await db
        .select({
          id: tenantUser.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          role: tenantUser.role,
          isActive: tenantUser.isActive,
          joinedAt: tenantUser.joinedAt,
        })
        .from(tenantUser)
        .innerJoin(user, eq(tenantUser.userId, user.id))
        .where(eq(tenantUser.tenantId, input.tenantId));

      return { members };
    }),

  // Update member role (only superadmin)
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        memberId: z.string().uuid(),
        newRole: z.enum(["superadmin", "admin", "member"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user is superadmin
      const currentUserTenant = await db
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

      if (
        currentUserTenant.length === 0 ||
        currentUserTenant[0].role !== "superadmin"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin can update member roles",
        });
      }

      // Update member role
      const [updatedMember] = await db
        .update(tenantUser)
        .set({ role: input.newRole })
        .where(eq(tenantUser.id, input.memberId))
        .returning();

      return {
        success: true,
        member: updatedMember,
      };
    }),

  // Remove member (only superadmin)
  removeMember: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        memberId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user is superadmin
      const currentUserTenant = await db
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

      if (
        currentUserTenant.length === 0 ||
        currentUserTenant[0].role !== "superadmin"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin can remove members",
        });
      }

      // Don't allow removing self
      const memberToRemove = await db
        .select()
        .from(tenantUser)
        .where(eq(tenantUser.id, input.memberId))
        .limit(1);

      if (
        memberToRemove.length > 0 &&
        memberToRemove[0].userId === ctx.user.id
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove yourself from tenant",
        });
      }

      // Remove member
      await db.delete(tenantUser).where(eq(tenantUser.id, input.memberId));

      return { success: true };
    }),

  // Generate presigned URL for logo upload
  generateLogoUploadUrl: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        fileName: z.string().min(1, "File name is required"),
        fileSize: z.number().positive("File size must be positive"),
        contentType: z.string().min(1, "Content type is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is superadmin or admin of this tenant
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

      if (
        userTenant.length === 0 ||
        !["superadmin", "admin"].includes(userTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can upload tenant logo",
        });
      }

      // Validate file type
      if (!validateLogoFileType(input.contentType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP, SVG)",
        });
      }

      // Validate file size (5MB max)
      if (!validateFileSize(input.fileSize)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size too large. Maximum 5MB allowed",
        });
      }

      try {
        const key = generateTenantLogoKey(input.tenantId, input.fileName);
        
        const uploadData = await generatePresignedUploadUrl({
          key,
          contentType: input.contentType,
          expiresIn: 1800, // 30 minutes
        });


        return {
          success: true,
          uploadData,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),

  // Update tenant logo after successful upload
  updateLogo: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        logoUrl: z.string().url("Invalid logo URL"),
        s3Key: z.string().min(1, "S3 key is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is superadmin or admin of this tenant
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

      if (
        userTenant.length === 0 ||
        !["superadmin", "admin"].includes(userTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can update tenant logo",
        });
      }

      try {
        // Get current tenant data to check for existing logo
        const currentTenant = await db
          .select()
          .from(tenant)
          .where(eq(tenant.id, input.tenantId))
          .limit(1);

        if (currentTenant.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tenant not found",
          });
        }

        // Delete old logo from S3 if exists
        if (currentTenant[0].logo) {
          try {
            // Extract S3 key from URL if it's an S3 URL
            const oldLogoUrl = currentTenant[0].logo;
            if (oldLogoUrl.includes('.s3.') && oldLogoUrl.includes('tenant-logos/')) {
              const urlParts = oldLogoUrl.split('/');
              const keyIndex = urlParts.findIndex(part => part === 'tenant-logos');
              if (keyIndex !== -1) {
                const oldS3Key = urlParts.slice(keyIndex).join('/');
                await deleteS3Object({ key: oldS3Key });
              }
            }
          } catch (deleteError) {
            // Log error but don't fail the update
          }
        }

        // Update tenant with new logo URL
        const [updatedTenant] = await db
          .update(tenant)
          .set({ 
            logo: input.logoUrl,
            updatedAt: new Date(),
          })
          .where(eq(tenant.id, input.tenantId))
          .returning();

        return {
          success: true,
          tenant: updatedTenant,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update tenant logo",
        });
      }
    }),

  // Remove tenant logo
  removeLogo: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is superadmin or admin of this tenant
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

      if (
        userTenant.length === 0 ||
        !["superadmin", "admin"].includes(userTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can remove tenant logo",
        });
      }

      try {
        // Get current tenant data
        const currentTenant = await db
          .select()
          .from(tenant)
          .where(eq(tenant.id, input.tenantId))
          .limit(1);

        if (currentTenant.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tenant not found",
          });
        }

        // Delete logo from S3 if exists
        if (currentTenant[0].logo) {
          try {
            const logoUrl = currentTenant[0].logo;
            if (logoUrl.includes('.s3.') && logoUrl.includes('tenant-logos/')) {
              const urlParts = logoUrl.split('/');
              const keyIndex = urlParts.findIndex(part => part === 'tenant-logos');
              if (keyIndex !== -1) {
                const s3Key = urlParts.slice(keyIndex).join('/');
                await deleteS3Object({ key: s3Key });
              }
            }
          } catch (deleteError) {
            // Failed to delete logo from S3
          }
        }

        // Update tenant to remove logo
        const [updatedTenant] = await db
          .update(tenant)
          .set({ 
            logo: null,
            updatedAt: new Date(),
          })
          .where(eq(tenant.id, input.tenantId))
          .returning();

        return {
          success: true,
          tenant: updatedTenant,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove tenant logo",
        });
      }
    }),

  // Generate presigned URL for logo download
  generateLogoDownloadUrl: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Get tenant data
      const tenantData = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, input.tenantId))
        .limit(1);

      if (tenantData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      const tenantInfo = tenantData[0];
      
      if (!tenantInfo.logo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant logo not found",
        });
      }

      try {
        // Extract S3 key from logo URL
        let s3Key: string;
        
        if (tenantInfo.logo.includes('tenant-logos/')) {
          // Extract key from URL - format: https://domain/bucket/tenant-logos/...
          const urlParts = tenantInfo.logo.split('/');
          const keyIndex = urlParts.findIndex(part => part === 'tenant-logos');
          if (keyIndex !== -1) {
            s3Key = urlParts.slice(keyIndex).join('/');
          } else {
            throw new Error("Invalid logo URL format");
          }
        } else {
          throw new Error("Logo URL does not contain tenant-logos path");
        }

        const presignedUrl = await generatePresignedDownloadUrl(s3Key, 3600); // 1 hour expiry

        return {
          success: true,
          presignedUrl,
          key: s3Key,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }
    }),
});
