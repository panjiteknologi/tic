export interface AppSidebarTypes {
  navMain: {
    title: string;
    url: string;
    icon: any;
    isActive?: boolean | undefined;
    items?: { title: string; url: string }[] | undefined;
  }[];
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navSecondary: [];
  projects: [];
}
