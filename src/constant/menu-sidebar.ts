import { BadgeCheck, Leaf, Gauge } from "lucide-react";

export const AuditStatusMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Audit Status",
      url: "/apps/audit-status",
      icon: BadgeCheck,
      isActive: true,
    },
  ],
  navSecondary: [],
  projects: [],
};

export const CarbonCalculationMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/apps/carbon-calculation/dashboard",
      icon: Gauge,
      isActive: false,
    },
    {
      title: "Carbon Emission",
      url: "/apps/carbon-calculation/list-emission",
      icon: Leaf,
      isActive: false,
      children: [
        {
          title: "List Emission",
          url: "/apps/carbon-calculation/list-emission",
          icon: BadgeCheck,
        },
        {
          title: "Add Emission",
          url: "/apps/carbon-calculation/add-emission",
          icon: BadgeCheck,
        },
        {
          title: "Emission Report",
          url: "/apps/carbon-calculation/emission-report",
          icon: BadgeCheck,
        },
      ],
    },
  ],
  navSecondary: [],
  projects: [],
};
