import MainLayout from "@/layout/main-layout";
import { NavbarApps } from "@/components/navbar-apps";
import SettingsView from "@/views/apps/settings";
import InvitationsView from "@/views/apps/settings/invitations";

export default function InvitationsPage() {
  return (
    <MainLayout>
      <NavbarApps />
      <SettingsView>
        <InvitationsView />
      </SettingsView>
    </MainLayout>
  );
}
