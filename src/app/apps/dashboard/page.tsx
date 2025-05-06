import DashboardLayout from "@/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import DashboardView from "@/views/apps/dashboard";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
}
