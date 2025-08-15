import { NavbarApps } from "@/components/navbar-apps";
import MainLayout from "@/layout/main-layout";
import SettingsView from "@/views/apps/settings";

export default function SettingsPage() {
  return (
    <MainLayout>
      <NavbarApps />
      <SettingsView />
    </MainLayout>
  );
}
