"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { AppSidebarTypes } from "@/types/sidebar-types";
import NavMain from "./nav-main";

export function AppSidebar({ data, ...props }: { data: AppSidebarTypes }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  const toggleMenu = (url: string) => {
    setExpandedMenus((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const isMenuExpanded = (url: string) => expandedMenus.includes(url);

  const dataNavMain = data.navMain.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg">
                  <Image
                    src="/images/tsi-logo.png"
                    width={32}
                    height={32}
                    priority
                    alt="TSI Logo"
                  />
                </div>
                <div className="text-left text-sm leading-tight">
                  <span className="truncate font-bold text-blue-950 text-lg">
                    Certification
                  </span>
                  <span className="truncate text-xs">Client</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={dataNavMain}
          toggleMenu={toggleMenu}
          isMenuExpanded={isMenuExpanded}
        />
        <NavSecondary items={data?.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
