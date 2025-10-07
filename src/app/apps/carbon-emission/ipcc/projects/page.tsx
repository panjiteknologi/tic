"use client";

import { useState } from "react";
import DashboardLayout from "@/layout/dashboard-layout";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { trpc } from "@/trpc/react";
import { DialogInfo } from "@/components/ui/dialog-info";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { CarbonProjectIPCCMenu } from "@/constant/menu-sidebar";
import { IPCCProjectsView } from "@/views/apps/carbon-emission/ipcc/projects/ipcc-projects-view";

export default function IPCCProjectsPage() {
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    year: new Date().getFullYear(),
    organizationName: "",
    location: "",
  });
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

  const { data, isLoading } = trpc.ipccProjects.getAll.useQuery();
  const projects = data?.projects ?? [];

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    (project.organizationName && 
     project.organizationName.toLowerCase().includes(search.toLowerCase()))
  );

  const createMutation = trpc.ipccProjects.create.useMutation({
    onSuccess: (data) => {
      utils.ipccProjects.getAll.invalidate();
      setFormData({
        name: "",
        description: "",
        year: new Date().getFullYear(),
        organizationName: "",
        location: "",
      });
      setOpenDialog(false);
      setEditMode(false);
      setInfoVariant("success");
      setInfoDialogTitle("Project berhasil dibuat");
      setInfoDialogDesc(
        `Project "${data.project.name}" berhasil ditambahkan.`
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
    const trimmedData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      year: formData.year,
      organizationName: formData.organizationName?.trim() || "",
      location: formData.location?.trim() || "",
    };

    if (!trimmedData.name) return;

    if (editMode && idProject) {
      updateMutation.mutate({
        id: idProject,
        ...trimmedData,
      });
    } else {
      createMutation.mutate(trimmedData);
    }
  };

  const updateMutation = trpc.ipccProjects.update.useMutation({
    onSuccess: (data) => {
      utils.ipccProjects.getAll.invalidate();
      setFormData({
        name: "",
        description: "",
        year: new Date().getFullYear(),
        organizationName: "",
        location: "",
      });
      setOpenDialog(false);
      setEditMode(false);
      setInfoVariant("success");
      setInfoDialogTitle("Project berhasil diperbarui");
      setInfoDialogDesc(
        `Project "${data.project.name}" berhasil diperbarui.`
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

  const deleteMutation = trpc.ipccProjects.delete.useMutation({
    onSuccess: () => {
      utils.ipccProjects.getAll.invalidate();
      const project = projects.find((item) => item.id === idProject);
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
      href="/apps/carbon-emission/ipcc/projects"
      titleHeader="IPCC Projects"
      subTitleHeader="All IPCC Projects"
      menuSidebar={CarbonProjectIPCCMenu as AppSidebarTypes}
    >
      <IPCCProjectsView
        search={search}
        setSearch={setSearch}
        formData={formData}
        setFormData={setFormData}
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