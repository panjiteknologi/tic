import { NavbarApps } from "@/components/navbar-apps";
import MainLayout from "@/layout/main-layout";
import { auth } from "@/lib/auth";
import AppsView from "@/views/apps";
import { redirect } from "next/navigation";

export default async function AppsPage() {
  const session = await auth();

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
