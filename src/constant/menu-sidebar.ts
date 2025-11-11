import { BadgeCheck, Gauge, FolderOpenDot, Droplets, List } from "lucide-react";

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

export const CarbonProjectISCCMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/apps/carbon-emission/iscc/dashboard",
      icon: Gauge,
      isActive: false,
    },
    {
      title: "All Projects",
      url: "/apps/carbon-emission/iscc/projects",
      icon: FolderOpenDot,
      isActive: false,
    },
  ],
  navSecondary: [],
  projects: [],
};

export const CarbonProjectISCCAIMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/apps/carbon-emission/iscc-ai/dashboard",
      icon: Gauge,
      isActive: false,
    },
    {
      title: "All Projects",
      url: "/apps/carbon-emission/iscc-ai/projects",
      icon: FolderOpenDot,
      isActive: false,
    },
  ],
  navSecondary: [],
  projects: [],
};

export const CarbonProjectIPCCMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/apps/carbon-emission/ipcc/dashboard",
      icon: Gauge,
      isActive: false,
    },
    {
      title: "All Projects",
      url: "/apps/carbon-emission/ipcc/projects",
      icon: FolderOpenDot,
      isActive: false,
    },
  ],
  navSecondary: [],
  projects: [],
};

export const CarbonProjectDEFRAMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/apps/carbon-emission/defra/dashboard",
      icon: Gauge,
      isActive: false,
    },
    {
      title: "All Projects",
      url: "/apps/carbon-emission/defra/projects",
      icon: FolderOpenDot,
      isActive: false,
    },
  ],
  navSecondary: [],
  projects: [],
};

export const getCarbonCalculationMenu = (projectId: string) => ({
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      id: "carbon-calculation",
      title: "Carbon Calculation",
      url: `/apps/carbon-emission/iscc/projects/${projectId}`,
      icon: Droplets,
      isActive: false,
      children: [
        {
          id: "list-calculation",
          title: "List Calculation",
          url: `/apps/carbon-emission/iscc/projects/${projectId}`,
          icon: List,
        },
      ],
    },
  ],
  navSecondary: [],
  projects: [],
});

export const getCarbonCalculationAIMenu = (projectId: string) => ({
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      id: "carbon-calculation",
      title: "Carbon Calculation",
      url: `/apps/carbon-emission/iscc-ai/projects/${projectId}`,
      icon: Droplets,
      isActive: false,
      children: [
        {
          id: "list-calculation",
          title: "List Calculation",
          url: `/apps/carbon-emission/iscc-ai/projects/${projectId}`,
          icon: List,
        },
      ],
    },
  ],
  navSecondary: [],
  projects: [],
});
