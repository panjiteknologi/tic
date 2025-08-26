/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter, baseProcedure } from "../init";
import { db } from "@/db";
import {
  tenant,
  tenantUser,
  tenantInvitation,
} from "@/db/schema/tenant-schema";
import { user } from "@/db/schema/auth-schema";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { env } from "@/env";
import { generatePresignedDownloadUrl } from "@/lib/s3";
import { auth } from "@/lib/auth";

export const invitationRouter = createTRPCRouter({
  // Send invitation (only superadmin/admin)
  send: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(["admin", "member"]).default("member"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user can send invitations
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
        !["superadmin", "admin"].includes(currentUserTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can send invitations",
        });
      }

      // Check if user already exists and is member of tenant
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        const existingMember = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, input.tenantId),
              eq(tenantUser.userId, existingUser[0].id)
            )
          )
          .limit(1);

        if (existingMember.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a member of this tenant",
          });
        }
      }

      // Check if invitation already exists
      const existingInvitation = await db
        .select()
        .from(tenantInvitation)
        .where(
          and(
            eq(tenantInvitation.tenantId, input.tenantId),
            eq(tenantInvitation.email, input.email),
            isNull(tenantInvitation.acceptedAt)
          )
        )
        .limit(1);

      if (existingInvitation.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Invitation already sent to this email",
        });
      }

      // Generate invitation token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation
      const [invitation] = await db
        .insert(tenantInvitation)
        .values({
          tenantId: input.tenantId,
          email: input.email,
          role: input.role,
          invitedBy: ctx.user.id,
          token,
          expiresAt,
        })
        .returning();

      // Get tenant info for invitation email
      const tenantInfo = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, input.tenantId))
        .limit(1);

      return {
        success: true,
        invitation,
        tenant: tenantInfo[0],
        invitationUrl: `${env.NEXT_PUBLIC_URL}/invite/${token}`,
      };
    }),

  // Get tenant invitations (only superadmin/admin)
  getByTenant: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check permissions
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
        !["superadmin", "admin"].includes(currentUserTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can view invitations",
        });
      }

      const invitations = await db
        .select({
          id: tenantInvitation.id,
          email: tenantInvitation.email,
          role: tenantInvitation.role,
          token: tenantInvitation.token,
          invitedBy: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          expiresAt: tenantInvitation.expiresAt,
          acceptedAt: tenantInvitation.acceptedAt,
          createdAt: tenantInvitation.createdAt,
        })
        .from(tenantInvitation)
        .innerJoin(user, eq(tenantInvitation.invitedBy, user.id))
        .where(eq(tenantInvitation.tenantId, input.tenantId));

      return { invitations };
    }),

  // Accept invitation
  accept: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find invitation
      const invitation = await db
        .select()
        .from(tenantInvitation)
        .where(
          and(
            eq(tenantInvitation.token, input.token),
            isNull(tenantInvitation.acceptedAt)
          )
        )
        .limit(1);

      if (invitation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired invitation",
        });
      }

      const inv = invitation[0];

      // Check if expired
      if (inv.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Get user email to verify
      if (ctx.user.email !== inv.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invitation is not for this user",
        });
      }

      // Check if user is already a member
      const existingMember = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, inv.tenantId),
            eq(tenantUser.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingMember.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this tenant",
        });
      }

      // Add user to tenant
      await db.insert(tenantUser).values({
        tenantId: inv.tenantId,
        userId: ctx.user.id,
        role: inv.role,
      });

      // Mark invitation as accepted
      await db
        .update(tenantInvitation)
        .set({ acceptedAt: new Date() })
        .where(eq(tenantInvitation.id, inv.id));

      // Get tenant info
      const tenantInfo = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, inv.tenantId))
        .limit(1);

      return {
        success: true,
        tenant: tenantInfo[0],
        role: inv.role,
      };
    }),

  // Cancel invitation (only superadmin/admin)
  cancel: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get invitation
      const invitation = await db
        .select()
        .from(tenantInvitation)
        .where(eq(tenantInvitation.id, input.invitationId))
        .limit(1);

      if (invitation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Check permissions
      const currentUserTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, invitation[0].tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (
        currentUserTenant.length === 0 ||
        !["superadmin", "admin"].includes(currentUserTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can cancel invitations",
        });
      }

      // Delete invitation
      await db
        .delete(tenantInvitation)
        .where(eq(tenantInvitation.id, input.invitationId));

      return { success: true };
    }),

  // Send bulk invitations (only superadmin/admin)
  sendBulk: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        invitations: z
          .array(
            z.object({
              email: z.string().email(),
              role: z.enum(["admin", "member"]).default("member"),
            })
          )
          .min(1, "At least one invitation is required")
          .max(10, "Maximum 10 invitations at once"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user can send invitations
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
        !["superadmin", "admin"].includes(currentUserTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can send invitations",
        });
      }

      const results = [];
      const errors = [];

      for (const invite of input.invitations) {
        try {
          // Check if user already exists and is member of tenant
          const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, invite.email))
            .limit(1);

          if (existingUser.length > 0) {
            const existingMember = await db
              .select()
              .from(tenantUser)
              .where(
                and(
                  eq(tenantUser.tenantId, input.tenantId),
                  eq(tenantUser.userId, existingUser[0].id)
                )
              )
              .limit(1);

            if (existingMember.length > 0) {
              errors.push({
                email: invite.email,
                error: "User is already a member of this tenant",
              });
              continue;
            }
          }

          // Check if invitation already exists
          const existingInvitation = await db
            .select()
            .from(tenantInvitation)
            .where(
              and(
                eq(tenantInvitation.tenantId, input.tenantId),
                eq(tenantInvitation.email, invite.email),
                isNull(tenantInvitation.acceptedAt)
              )
            )
            .limit(1);

          if (existingInvitation.length > 0) {
            errors.push({
              email: invite.email,
              error: "Invitation already sent to this email",
            });
            continue;
          }

          // Generate invitation token
          const token = randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

          // Create invitation
          const [invitation] = await db
            .insert(tenantInvitation)
            .values({
              tenantId: input.tenantId,
              email: invite.email,
              role: invite.role,
              invitedBy: ctx.user.id,
              token,
              expiresAt,
            })
            .returning();

          results.push({
            email: invite.email,
            role: invite.role,
            invitationUrl: `${process.env.NEXTAUTH_URL}/invite/${token}`,
            token,
          });
        } catch (error) {
          errors.push({
            email: invite.email,
            error: "Failed to create invitation",
          });
        }
      }

      // Get tenant info
      const tenantInfo = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, input.tenantId))
        .limit(1);

      return {
        success: true,
        results,
        errors,
        tenant: tenantInfo[0],
        summary: {
          total: input.invitations.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    }),

  // Resend invitation (only superadmin/admin)
  resend: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get invitation
      const invitation = await db
        .select()
        .from(tenantInvitation)
        .where(eq(tenantInvitation.id, input.invitationId))
        .limit(1);

      if (invitation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const inv = invitation[0];

      // Check permissions
      const currentUserTenant = await db
        .select()
        .from(tenantUser)
        .where(
          and(
            eq(tenantUser.tenantId, inv.tenantId),
            eq(tenantUser.userId, ctx.user.id),
            eq(tenantUser.isActive, true)
          )
        )
        .limit(1);

      if (
        currentUserTenant.length === 0 ||
        !["superadmin", "admin"].includes(currentUserTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can resend invitations",
        });
      }

      // Check if invitation is already accepted
      if (inv.acceptedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot resend an accepted invitation",
        });
      }

      // Generate new token and extend expiry
      const newToken = randomBytes(32).toString("hex");
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      // Update invitation with new token and expiry
      const [updatedInvitation] = await db
        .update(tenantInvitation)
        .set({
          token: newToken,
          expiresAt: newExpiresAt,
          createdAt: new Date(), // Update created time to reflect resend
        })
        .where(eq(tenantInvitation.id, input.invitationId))
        .returning();

      // Get tenant info
      const tenantInfo = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, inv.tenantId))
        .limit(1);

      return {
        success: true,
        invitation: updatedInvitation,
        tenant: tenantInfo[0],
        invitationUrl: `${process.env.NEXTAUTH_URL}/invite/${newToken}`,
      };
    }),

  // Get invitation info (protected endpoint - requires auth to view details)
  getInvitationInfo: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const invitation = await db
        .select({
          email: tenantInvitation.email,
          role: tenantInvitation.role,
          expiresAt: tenantInvitation.expiresAt,
          createdAt: tenantInvitation.createdAt,
          tenant: {
            name: tenant.name,
            slug: tenant.slug,
            logo: tenant.logo,
          },
          invitedBy: {
            name: user.name,
            email: user.email,
          },
        })
        .from(tenantInvitation)
        .innerJoin(tenant, eq(tenantInvitation.tenantId, tenant.id))
        .innerJoin(user, eq(tenantInvitation.invitedBy, user.id))
        .where(
          and(
            eq(tenantInvitation.token, input.token),
            isNull(tenantInvitation.acceptedAt)
          )
        )
        .limit(1);

      if (invitation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired invitation",
        });
      }

      const inv = invitation[0];

      // Check if expired
      if (inv.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Additional security: Only allow the invited user to view details
      if (ctx.user.email !== inv.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invitation is not for your account",
        });
      }

      // Generate presigned URL for logo if exists
      let logoUrl = null;
      if (inv.tenant.logo) {
        try {
          logoUrl = await generatePresignedDownloadUrl(inv.tenant.logo);
        } catch (error) {
          console.error("Failed to generate presigned URL for logo:", error);
          logoUrl = inv.tenant.logo.startsWith("http") ? inv.tenant.logo : null;
        }
      }

      // Update tenant logo with presigned URL
      const updatedInvitation = {
        ...inv,
        tenant: {
          ...inv.tenant,
          logo: logoUrl,
        },
      };

      return {
        invitation: updatedInvitation,
        isExpired: inv.expiresAt < new Date(),
        daysUntilExpiry: Math.ceil(
          (inv.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      };
    }),

  // Get basic invitation info for preview (public endpoint with minimal data)
  getInvitationPreview: baseProcedure
    .input(
      z.object({
        token: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const invitation = await db
        .select({
          email: tenantInvitation.email,
          expiresAt: tenantInvitation.expiresAt,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            logo: tenant.logo,
          },
        })
        .from(tenantInvitation)
        .innerJoin(tenant, eq(tenantInvitation.tenantId, tenant.id))
        .where(
          and(
            eq(tenantInvitation.token, input.token),
            isNull(tenantInvitation.acceptedAt)
          )
        )
        .limit(1);

      if (invitation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired invitation",
        });
      }

      const inv = invitation[0];

      // Check if expired
      if (inv.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Generate presigned URL for logo if exists
      let logoUrl = null;
      if (inv.tenant.logo) {
        try {
          // For public access, we generate presigned URL without checking permissions
          logoUrl = await generatePresignedDownloadUrl(inv.tenant.logo);
        } catch (error) {
          console.error("Failed to generate presigned URL for logo:", error);
          // Use direct URL as fallback if it's already a full URL
          logoUrl = inv.tenant.logo.startsWith("http") ? inv.tenant.logo : null;
        }
      }

      return {
        email: inv.email,
        tenantId: inv.tenant.id,
        tenantName: inv.tenant.name,
        tenantLogo: logoUrl,
        isExpired: inv.expiresAt < new Date(),
        isValid: true,
      };
    }),

  // Accept invitation with signup (public endpoint for creating account)
  acceptWithSignup: baseProcedure
    .input(
      z.object({
        token: z.string().min(1),
        name: z.string().min(1, "Name is required"),
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input }) => {
      // Find invitation
      const invitation = await db
        .select()
        .from(tenantInvitation)
        .where(
          and(
            eq(tenantInvitation.token, input.token),
            isNull(tenantInvitation.acceptedAt)
          )
        )
        .limit(1);

      if (invitation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired invitation",
        });
      }

      const inv = invitation[0];

      // Check if expired
      if (inv.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Verify email matches invitation
      if (input.email !== inv.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Email must match the invited email address",
        });
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      let userId: string;

      if (existingUser.length > 0) {
        // User exists, just use their ID
        userId = existingUser[0].id;

        // Check if user is already a member
        const existingMember = await db
          .select()
          .from(tenantUser)
          .where(
            and(
              eq(tenantUser.tenantId, inv.tenantId),
              eq(tenantUser.userId, userId)
            )
          )
          .limit(1);

        if (existingMember.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a member of this tenant",
          });
        }
      } else {
        // Create new user account using auth system
        try {
          const authResult = await auth.api.signUpEmail({
            body: {
              name: input.name,
              email: input.email,
              password: input.password,
            },
          });

          if (!authResult.user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user account",
            });
          }

          userId = authResult.user.id;
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "Failed to create account",
          });
        }
      }

      // Add user to tenant
      await db.insert(tenantUser).values({
        tenantId: inv.tenantId,
        userId: userId,
        role: inv.role,
      });

      // Mark invitation as accepted
      await db
        .update(tenantInvitation)
        .set({ acceptedAt: new Date() })
        .where(eq(tenantInvitation.id, inv.id));

      // Get tenant info
      const tenantInfo = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, inv.tenantId))
        .limit(1);

      return {
        success: true,
        tenant: tenantInfo[0],
        role: inv.role,
        userId: userId,
      };
    }),

  // Get invitation statistics (only superadmin/admin)
  getStats: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check permissions
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
        !["superadmin", "admin"].includes(currentUserTenant[0].role)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmin or admin can view invitation stats",
        });
      }

      const allInvitations = await db
        .select({
          id: tenantInvitation.id,
          acceptedAt: tenantInvitation.acceptedAt,
          expiresAt: tenantInvitation.expiresAt,
          createdAt: tenantInvitation.createdAt,
          role: tenantInvitation.role,
        })
        .from(tenantInvitation)
        .where(eq(tenantInvitation.tenantId, input.tenantId));

      const now = new Date();
      const pending = allInvitations.filter(
        (inv) => !inv.acceptedAt && inv.expiresAt > now
      );
      const accepted = allInvitations.filter((inv) => inv.acceptedAt);
      const expired = allInvitations.filter(
        (inv) => !inv.acceptedAt && inv.expiresAt <= now
      );

      return {
        total: allInvitations.length,
        pending: pending.length,
        accepted: accepted.length,
        expired: expired.length,
        acceptanceRate:
          allInvitations.length > 0
            ? Math.round((accepted.length / allInvitations.length) * 100)
            : 0,
        recentInvitations: allInvitations
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5),
      };
    }),
});
