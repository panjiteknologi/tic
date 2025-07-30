import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import {
  tenant,
  tenantUser,
  tenantInvitation,
} from "@/db/schema/tenant-schema";
import { user } from "@/db/schema/auth-schema";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

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
        invitationUrl: `${process.env.NEXTAUTH_URL}/invite/${token}`,
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
});
