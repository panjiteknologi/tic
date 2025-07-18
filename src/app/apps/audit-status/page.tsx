"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/layout/dashboard-layout";
import { useDateCustomerQuery } from "@/hooks/use-date-customer";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { AuditStatusMenu } from "@/constant/menu-sidebar";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: dateCustomer = [], isLoading } = useDateCustomerQuery({
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
