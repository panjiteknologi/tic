import DashboardLayout from "@/layout/dashboard-layout";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { CarbonProjectIPCCMenu } from "@/constant/menu-sidebar";

export default function IPCCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      href="/apps/carbon-emission/ipcc"
      titleHeader="IPCC Carbon Emission"
      subTitleHeader="Intergovernmental Panel on Climate Change"
      menuSidebar={CarbonProjectIPCCMenu as AppSidebarTypes}
    >
      {children}
    </DashboardLayout>
  );
}