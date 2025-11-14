"use client";

import DashboardLayout from "@/layout/dashboard-layout";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { CarbonProjectGHGProtocolMenu } from "@/constant/menu-sidebar";

export default function GHGProtocolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      href="/apps/carbon-emission/ghg-protocol/projects"
      titleHeader="GHG Protocol Carbon Emission"
      subTitleHeader="Greenhouse Gas Protocol Corporate Standard"
      menuSidebar={CarbonProjectGHGProtocolMenu as AppSidebarTypes}
    >
      {children}
    </DashboardLayout>
  );
}

