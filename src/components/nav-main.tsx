"use client";

import { ChevronRight, ChevronDown, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";

export type NavChildItem = {
  url: string;
  icon?: LucideIcon;
  title: string;
};

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  children?: NavChildItem[];
};

type NavMainProps = {
  items: NavItem[];
  toggleMenu: (url: string) => void;
  isMenuExpanded: (url: string) => boolean;
};

export default function NavMain({
  items,
  toggleMenu,
  isMenuExpanded,
}: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((menu) => (
          <React.Fragment key={menu.title}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => toggleMenu(menu.url)}
                className={`flex justify-between items-center w-full ${
                  menu.isActive ? "bg-muted font-semibold" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {menu.icon && <menu.icon className="h-4 w-4" />}
                  <span>{menu.title}</span>
                </div>
                {menu.children?.length > 0 &&
                  (isMenuExpanded(menu.url) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ))}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {menu.children && isMenuExpanded(menu.url) && (
              <div className="ml-6 space-y-1 text-sm">
                {menu.children.map((child) => (
                  <Link
                    key={child.url}
                    href={child.url}
                    className={`block px-2 py-1 rounded hover:bg-muted ${
                      pathname.startsWith(child.url)
                        ? "text-primary font-medium bg-muted"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {child.icon && <child.icon className="h-4 w-4" />}
                      <span>{child.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
