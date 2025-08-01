import MainLayout from "@/layout/main-layout";
import { NavbarApps } from "@/components/navbar-apps";
import MembersView from "@/views/apps/settings/members";

export default function MembersPage() {
  return (
    <MainLayout>
      <NavbarApps />
      <MembersView />
    </MainLayout>
  );
}
