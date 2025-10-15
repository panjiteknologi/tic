"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { 
  ChevronDown, 
  ChevronRight, 
  BadgeCheck,
  Gauge,
  FolderOpenDot,
  Droplets,
  List
} from "lucide-react";
import clsx from "clsx";

type NavItem = {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  children?: {
    title: string;
    url: string;
    icon: string;
  }[];
};

interface NavMainProps {
  items: NavItem[];
  toggleMenu: (url: string) => void;
  isMenuExpanded: (url: string) => boolean;
}

const iconMap = {
  BadgeCheck,
  Gauge,
  FolderOpenDot,
  Droplets,
  List,
};

export default function NavMain({
  items,
  toggleMenu,
  isMenuExpanded,
}: NavMainProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Gauge;
  };

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.url);
        const IconComponent = getIcon(item.icon);
        
        return (
          <SidebarMenuItem
            key={item.url}
            className={clsx({ "bg-muted": isActive })}
          >
            <SidebarMenuButton
              onClick={() => {
                if (item.children) {
                  toggleMenu(item.url);
                } else {
                  router.push(item.url);
                }
              }}
              className="flex justify-between items-center w-full cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                {item.title}
              </div>
              {item.children &&
                (isMenuExpanded(item.url) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                ))}
            </SidebarMenuButton>

            {item.children && isMenuExpanded(item.url) && (
              <SidebarMenu className="ml-4">
                {item.children.map((child) => {
                  const ChildIconComponent = getIcon(child.icon);
                  return (
                    <SidebarMenuItem
                      key={child.url}
                      className={clsx({
                        "bg-muted": pathname === child.url,
                      })}
                    >
                      <SidebarMenuButton onClick={() => router.push(child.url)}>
                        <ChildIconComponent className="w-4 h-4 mr-2" />
                        {child.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
