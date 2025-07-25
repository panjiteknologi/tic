"use client";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/layout/dashboard-layout";
import { useDateCustomerQuery } from "@/hooks/use-date-customer";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { AuditStatusMenu } from "@/constant/menu-sidebar";

export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  return (
    <DashboardLayout
      href="/apps/audit-status"
      titleHeader="Audit Status"
      subTitleHeader="Table"
      menuSidebar={AuditStatusMenu as AppSidebarTypes}
    >
      <div className="space-y-4">
        <h1 className="text-md font-bold">Tracking Project Consultant</h1>
      </div>
    </DashboardLayout>
  );
}
