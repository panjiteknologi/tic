import { NavbarApps } from "@/components/navbar-apps";
import MainLayout from "@/layout/main-layout";
import SettingsView from "@/views/apps/settings";
import OrganizationView from "@/views/apps/settings/organization";

export default function OrganizationPage() {
  return (
    <MainLayout>
      <NavbarApps />
      <SettingsView>
        <OrganizationView />
      </SettingsView>
    </MainLayout>
  );
}