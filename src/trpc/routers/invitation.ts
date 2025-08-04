import { z } from "zod";
import { eq, and, isNull, inArray } from "drizzle-orm";
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

  // Get invitation info (public endpoint for preview)
  getInvitationInfo: baseProcedure
    .input(
      z.object({
        token: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
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

      return {
        invitation: inv,
        isExpired: inv.expiresAt < new Date(),
        daysUntilExpiry: Math.ceil(
          (inv.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
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
