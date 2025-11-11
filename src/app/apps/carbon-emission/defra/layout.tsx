'use client';

import DashboardLayout from '@/layout/dashboard-layout';
import { AppSidebarTypes } from '@/types/sidebar-types';
import { CarbonProjectDEFRAMenu } from '@/constant/menu-sidebar';

export default function DEFRALayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      href="/apps/carbon-emission/defra/projects"
      titleHeader="DEFRA Carbon Emission"
      subTitleHeader="Department for Environment, Food and Rural Affairs"
      menuSidebar={CarbonProjectDEFRAMenu as AppSidebarTypes}
    >
      {children}
    </DashboardLayout>
  );
}
