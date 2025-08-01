import { NavbarApps } from "@/components/navbar-apps";
import MainLayout from "@/layout/main-layout";
import InviteView from "@/views/apps/settings/members/invite";

export default function InviteMemberPage() {
  return (
    <MainLayout>
      <NavbarApps />
      <InviteView />
    </MainLayout>
  );
}
