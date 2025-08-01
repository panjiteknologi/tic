"use client";

import { SquareStack, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function AppsHero() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const sessionUser = session?.user;

  // Get user's tenants to check role
  const { data: tenantsData } = trpc.tenant.getUserTenants.useQuery(undefined, {
    enabled: !!sessionUser,
  });

  // Get current user's role in the first tenant
  const userRole = tenantsData?.tenants?.[0]?.role;
  const isSuperAdmin = userRole === "superadmin";

  const handleInviteMember = () => {
    // TODO: Open invite member modal/dialog
    router.push("/apps/settings/members");
  };

  return (
    <div className="flex flex-col items-center justify-between gap-6 mt-8 py-6">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-primary/10 p-6 rounded-full">
          <SquareStack className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Access all your TIC services and tools from one place. Find and
            launch the applications you need to streamline your work.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            onClick={handleInviteMember}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>
    </div>
  );
}
