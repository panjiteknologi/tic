'use client';

import DashboardLayout from '@/layout/dashboard-layout';
import { AppSidebarTypes } from '@/types/sidebar-types';
import { CarbonProjectISO14064Menu } from '@/constant/menu-sidebar';

export default function ISO14064Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      href="/apps/carbon-emission/iso-14064/projects"
      titleHeader="ISO 14064-1:2018 Carbon Emission"
      subTitleHeader="Greenhouse Gas Inventories for Organizations"
      menuSidebar={CarbonProjectISO14064Menu as AppSidebarTypes}
    >
      {children}
    </DashboardLayout>
  );
}

