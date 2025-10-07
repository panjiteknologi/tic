/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";
import { IPCCProjectCardSkeleton } from "./ipcc-project-card-skeleton";
import { IPCCProjectCard } from "./ipcc-project-card";
import { IPCCProjectDialogForm } from "./ipcc-project-dialog-form";
import { IPCCProjectSearchInput } from "./ipcc-project-search-input";
import { NoData } from "@/components/ui/no-data";

type IPCCProject = inferRouterOutputs<AppRouter>["ipccProjects"]["getAll"]["projects"][number];

type IPCCProjectFormData = {
  name: string;
  description: string;
  year: number;
  organizationName: string;
  location: string;
};

type IPCCProjectsViewProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  formData: IPCCProjectFormData;
  setFormData: Dispatch<SetStateAction<IPCCProjectFormData>>;
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  handleAddProject: () => void;
  isLoading: boolean;
  createMutation: any;
  filteredProjects: IPCCProject[];
  isCreating: boolean;
  editMode: boolean;
  setEditMode: (e: boolean) => void;
  setDeleteDialogOpen: (e: boolean) => void;
  setIdProject: Dispatch<SetStateAction<string>>;
};

export function IPCCProjectsView({
  search,
  setSearch,
  formData,
  setFormData,
  openDialog,
  setOpenDialog,
  handleAddProject,
  isLoading,
  createMutation,
  filteredProjects,
  isCreating,
  editMode,
  setEditMode,
  setDeleteDialogOpen,
  setIdProject,
}: IPCCProjectsViewProps) {
  const onEdit = (project: IPCCProject) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      year: project.year,
      organizationName: project.organizationName || "",
      location: project.location || "",
    });
    setOpenDialog(true);
    setEditMode(true);
    setIdProject(project.id);
  };

  const onDelete = (id: string) => {
    setDeleteDialogOpen(true);
    setIdProject(id);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <IPCCProjectSearchInput value={search} onChange={setSearch} />
        <IPCCProjectDialogForm
          open={openDialog}
          setOpen={setOpenDialog}
          formData={formData}
          setFormData={setFormData}
          handleAdd={handleAddProject}
          isCreating={isCreating}
          error={createMutation.error}
          editMode={editMode}
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <IPCCProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <IPCCProjectCard
                  project={project}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <NoData message="Belum ada proyek IPCC yang tersedia." />
        )}
      </div>
    </div>
  );
}