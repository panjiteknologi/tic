"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, Users, Shield, Settings as SettingsIcon, UserCog } from "lucide-react";

export interface SettingsMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface SettingsSidebarProps {
  className?: string;
}

const menuItems: SettingsMenuItem[] = [
  {
    title: "Organization",
    url: "/apps/settings/organization",
    icon: Building2,
    description: "Manage organization details, logo, and settings",
  },
  {
    title: "Members",
    url: "/apps/settings/members",
    icon: Users,
    description: "Manage team members and their roles",
  },
  {
    title: "Invitations",
    url: "/apps/settings/invitations",
    icon: UserCog,
    description: "Send and manage team invitations",
  },
  {
    title: "Security",
    url: "/apps/settings/security",
    icon: Shield,
    description: "Security settings and permissions",
  },
  {
    title: "General",
    url: "/apps/settings/general",
    icon: SettingsIcon,
    description: "General application settings",
  },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <div className={cn("w-64 bg-card border-r border-border", className)}>
      <div className="p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your application settings
          </p>
        </div>
      </div>
      
      <nav className="px-4 pb-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
            
            return (
              <li key={item.url}>
                <Link
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default SettingsSidebar;