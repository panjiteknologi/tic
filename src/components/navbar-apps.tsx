"use client";

import { LogOut, Settings, Home } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/react";
import { TenantLogo } from "@/components/tenant-logo";

export function NavbarApps() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;
  const [scrolled, setScrolled] = useState(false);

  // Get user's tenants to find the current tenant
  const { data: tenantsData } = trpc.tenant.getUserTenants.useQuery(undefined, {
    enabled: !!sessionUser,
  });

  // For now, use the first tenant as the current tenant
  // You might want to add logic to select the current tenant based on context
  const currentTenant = tenantsData?.tenants?.[0]?.tenant;

  // Add scroll event listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    // Clean up event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const displayName = sessionUser?.name || "User";
  const userRole = tenantsData?.tenants?.[0]?.role || "member";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header
      className={`z-50 w-full bg-transparent transition-shadow duration-200`}
    >
      <div className="container mx-auto py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TenantLogo
            tenantId={currentTenant?.id}
            size="small"
            alt={`${currentTenant?.name || "DMS"} Logo`}
          />
          <span className="font-black text-lg text-gray-700">
            {currentTenant?.name || "TIC"}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/apps">
              <Home className="mr-2 h-4 w-4" />
              <span>Apps</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 flex items-center gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={sessionUser?.image || ""}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {userRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Settings submenu - only show for superadmin/admin */}
              {["superadmin", "admin"].includes(userRole) && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/apps/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
