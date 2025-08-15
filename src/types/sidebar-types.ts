/* eslint-disable @typescript-eslint/no-explicit-any */
import { LucideIcon } from "lucide-react";

export interface SidebarChildItem {
  id?: string;
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarItem extends SidebarChildItem {
  isActive?: boolean;
  children?: SidebarChildItem[];
}

export interface AppSidebarTypes {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: SidebarItem[];
  navSecondary: SidebarItem[]; // <- ubah dari `[]` menjadi `SidebarItem[]`
  projects: any[]; // atau definisikan jika kamu punya tipe project
}
