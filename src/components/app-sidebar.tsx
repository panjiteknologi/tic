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
import Link from "next/link";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { ChevronDown, ChevronRight } from "lucide-react";

export function AppSidebar({ data, ...props }: { data: AppSidebarTypes }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  const toggleMenu = (url: string) => {
    setExpandedMenus((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const isMenuExpanded = (url: string) => expandedMenus.includes(url);

  const updatedNavMain = data.navMain.map((item) => ({
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
        <SidebarMenu>
          {updatedNavMain.map((menu: any) => (
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
                  {menu.children.map(
                    (child: {
                      url: string;
                      icon: string | any;
                      title: string;
                    }) => (
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
                    )
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </SidebarMenu>

        <NavSecondary items={data?.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
