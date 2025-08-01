import { eq, and } from "drizzle-orm";
import { protectedProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { tenant, tenantUser } from "@/db/schema/tenant-schema";

export const userRouter = createTRPCRouter({
  // Get current user profile with tenant details
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    // Get user's current tenant (first active tenant)
    const userTenant = await db
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
      )
      .limit(1);

    const currentTenant = userTenant[0] || null;

    return {
      // User details
      userId: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      emailVerified: ctx.user.emailVerified,
      image: ctx.user.image,
      createdAt: ctx.user.createdAt,
      updatedAt: ctx.user.updatedAt,
      
      // Tenant details (if user belongs to a tenant)
      tenantId: currentTenant?.tenant.id || null,
      tenantName: currentTenant?.tenant.name || null,
      tenantSlug: currentTenant?.tenant.slug || null,
      tenantDomain: currentTenant?.tenant.domain || null,
      tenantLogo: currentTenant?.tenant.logo || null,
      role: currentTenant?.role || null,
      joinedAt: currentTenant?.joinedAt || null,
    };
  }),
});