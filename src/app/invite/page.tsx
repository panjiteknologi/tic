import { Suspense } from "react";
import MainLayout from "@/layout/main-layout";
import InviteView from "@/views/invite";

export default function InvitePage() {
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <InviteView />
      </Suspense>
    </MainLayout>
  );
}
