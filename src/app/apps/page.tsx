import { NavbarApps } from "@/components/navbar-apps";
import MainLayout from "@/layout/main-layout";
import { auth } from "@/lib/auth";
import AppsView from "@/views/apps";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <MainLayout>
      <NavbarApps />
      <AppsView />
    </MainLayout>
  );
}
