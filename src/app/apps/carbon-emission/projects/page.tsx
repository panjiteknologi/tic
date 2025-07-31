"use client";

import { useState } from "react";
import DashboardLayout from "@/layout/dashboard-layout";
import { CarbonCalculationMenu } from "@/constant/menu-sidebar";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { trpc } from "@/trpc/react";
import { ProjectsView } from "@/views/apps/carbon-emission/projects/projects-view";

export default function ProjectsPage() {
  const tenantId = "tenant-uuid";
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const { data, isLoading } = trpc.carbonProject.getByTenantId.useQuery({
    tenantId,
  });
  const projects = data?.carbonProjects ?? [];

  const createMutation = trpc.carbonProject.add.useMutation({
    onSuccess: () => {
      utils.carbonProject.getByTenantId.invalidate({ tenantId });
      setName("");
      setOpenDialog(false);
    },
    onError: (error: { message: string }) => {
      console.error("Error creating project:", error);
      alert(`Failed to create project: ${error.message}`);
    },
  });

  const handleAddProject = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createMutation.mutate({ tenantId, name: trimmedName });
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      href="/apps/carbon-emission/projects"
      titleHeader="All Projects"
      subTitleHeader="All Projects Carbon Emission"
      menuSidebar={CarbonCalculationMenu as AppSidebarTypes}
    >
      <ProjectsView
        search={search}
        setSearch={setSearch}
        name={name}
        setName={setName}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleAddProject={handleAddProject}
        isLoading={isLoading}
        createMutation={createMutation}
        filteredProjects={filteredProjects}
      />
    </DashboardLayout>
  );
}
