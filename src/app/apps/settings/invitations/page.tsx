import MainLayout from "@/layout/main-layout";
import { NavbarApps } from "@/components/navbar-apps";
import InvitationsView from "@/views/apps/settings/invitations";

export default function InvitationsPage() {
  return (
    <MainLayout>
      <NavbarApps />
      <InvitationsView />
    </MainLayout>
  );
}
