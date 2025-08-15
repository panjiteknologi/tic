"use client";

import { useState } from "react";
import DashboardLayout from "@/layout/dashboard-layout";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { trpc } from "@/trpc/react";
import { ProjectsView } from "@/views/apps/carbon-emission/projects/projects-view";
import { DialogInfo } from "@/components/ui/dialog-info";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { CarbonProjectISCCMenu } from "@/constant/menu-sidebar";

export default function ProjectsPage() {
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [idProject, setIdProject] = useState("");

  const [infoDialogTitle, setInfoDialogTitle] = useState("");
  const [infoDialogDesc, setInfoDialogDesc] = useState("");
  const [infoVariant, setInfoVariant] = useState<"success" | "error" | "info">(
    "info"
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: userProfile } = trpc.user.getUserProfile.useQuery();
  const tenantId = userProfile?.tenantId ?? "";

  const { data, isLoading } = trpc.carbonProject.getByTenantId.useQuery({
    tenantId,
  });
  const projects = data?.carbonProjects ?? [];

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = trpc.carbonProject.add.useMutation({
    onSuccess: (data) => {
      utils.carbonProject.getByTenantId.invalidate({ tenantId });
      setName("");
      setOpenDialog(false);
      setEditMode(false);
      setInfoVariant("success");
      setInfoDialogTitle("Project berhasil dibuat");
      setInfoDialogDesc(
        `Project "${data.carbonProject.name}" berhasil ditambahkan.`
      );
      setInfoDialogOpen(true);
    },
    onError: (error: { message: string }) => {
      setInfoVariant("error");
      setInfoDialogTitle("Gagal membuat project");
      setInfoDialogDesc(error.message);
      setInfoDialogOpen(true);
    },
  });

  const handleSaveProject = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (editMode && idProject) {
      updateMutation.mutate({
        id: idProject,
        name: trimmedName,
      });
    } else {
      createMutation.mutate({ tenantId, name: trimmedName });
    }
  };

  const updateMutation = trpc.carbonProject.update.useMutation({
    onSuccess: (data) => {
      utils.carbonProject.getByTenantId.invalidate({ tenantId });
      setName("");
      setOpenDialog(false);
      setEditMode(false);
      setInfoVariant("success");
      setInfoDialogTitle("Project berhasil diperbarui");
      setInfoDialogDesc(
        `Project "${data.carbonProject.name}" berhasil diperbarui.`
      );
      setInfoDialogOpen(true);
    },
    onError: (error: { message: string }) => {
      setInfoVariant("error");
      setInfoDialogTitle("Gagal mengedit project");
      setInfoDialogDesc(error.message);
      setInfoDialogOpen(true);
    },
  });

  const deleteMutation = trpc.carbonProject.delete.useMutation({
    onSuccess: () => {
      utils.carbonProject.getByTenantId.invalidate({ tenantId });
      const project = data?.carbonProjects.find(
        (item) => item.id === idProject
      );
      setIsDelete(false);
      setInfoVariant("success");
      setInfoDialogTitle("Project berhasil dihapus");
      setInfoDialogDesc(`Project "${project?.name}" berhasil dihapus.`);
      setInfoDialogOpen(true);
      setDeleteDialogOpen(false);
    },
    onError: (error: { message: string }) => {
      setIsDelete(false);
      setInfoVariant("error");
      setInfoDialogTitle("Gagal menghapus project");
      setInfoDialogDesc(error.message);
      setInfoDialogOpen(true);
      setDeleteDialogOpen(false);
    },
  });

  const confirmDelete = () => {
    setIsDelete(true);
    deleteMutation.mutate({
      id: idProject,
    });
  };

  return (
    <DashboardLayout
      href="/apps/carbon-emission/iscc/projects"
      titleHeader="All Projects"
      subTitleHeader="All Projects Carbon Emission"
      menuSidebar={CarbonProjectISCCMenu as AppSidebarTypes}
    >
      <ProjectsView
        search={search}
        setSearch={setSearch}
        name={name}
        setName={setName}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleAddProject={handleSaveProject}
        isLoading={isLoading}
        createMutation={createMutation}
        filteredProjects={filteredProjects}
        isCreating={createMutation.isPending || updateMutation.isPending}
        editMode={editMode}
        setEditMode={setEditMode}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setIdProject={setIdProject}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmation Delete Project"
        description={`Are you sure delete this project?`}
        onConfirm={confirmDelete}
        isDelete={isDelete}
        cancelText="Batal"
      />

      <DialogInfo
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        title={infoDialogTitle}
        description={infoDialogDesc}
        variant={infoVariant}
        onClose={() => setInfoDialogOpen(false)}
      />
    </DashboardLayout>
  );
}
