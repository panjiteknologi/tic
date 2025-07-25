import { NavbarApps } from "@/components/navbar-apps";
import MainLayout from "@/layout/main-layout";
import { auth } from "@/lib/auth";
import AppsView from "@/views/apps";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenantUser } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AppsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Check if user has a tenant
  const userTenant = await db
    .select()
    .from(tenantUser)
    .where(eq(tenantUser.userId, session.user.id))
    .limit(1);

  if (userTenant.length === 0) {
    redirect("/onboarding");
  }

  return (
    <MainLayout>
      <NavbarApps />
      <AppsView />
    </MainLayout>
  );
}
