/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";
import { DEFRAProjectCardSkeleton } from "./defra-project-card-skeleton";
import { DEFRAProjectCard } from "./defra-project-card";
import { DEFRAProjectDialogForm } from "./defra-project-dialog-form";
import { DEFRAProjectSearchInput } from "./defra-project-search-input";
import { NoData } from "@/components/ui/no-data";

type DEFRAProject =
  inferRouterOutputs<AppRouter>["defraProjects"]["getByTenantId"]["projects"][number];

type DEFRAProjectFormData = {
  name: string;
  description: string;
  organizationName: string;
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  defraYear: string;
  status: "draft" | "active" | "completed" | "archived";
};

type DEFRAProjectsViewProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  formData: DEFRAProjectFormData;
  setFormData: Dispatch<SetStateAction<DEFRAProjectFormData>>;
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  handleAddProject: () => void;
  isLoading: boolean;
  createMutation: any;
  filteredProjects: DEFRAProject[];
  isCreating: boolean;
  editMode: boolean;
  setEditMode: (e: boolean) => void;
  setDeleteDialogOpen: (e: boolean) => void;
  setIdProject: Dispatch<SetStateAction<string>>;
};

export function DEFRAProjectsView({
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
}: DEFRAProjectsViewProps) {
  const onEdit = (project: DEFRAProject) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      organizationName: project.organizationName || "",
      reportingPeriodStart: project.reportingPeriodStart instanceof Date 
        ? project.reportingPeriodStart 
        : new Date(project.reportingPeriodStart),
      reportingPeriodEnd: project.reportingPeriodEnd instanceof Date 
        ? project.reportingPeriodEnd 
        : new Date(project.reportingPeriodEnd),
      defraYear: project.defraYear,
      status: project.status as "draft" | "active" | "completed" | "archived",
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
        <DEFRAProjectSearchInput value={search} onChange={setSearch} />
        <DEFRAProjectDialogForm
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
              <DEFRAProjectCardSkeleton key={i} />
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
                <DEFRAProjectCard
                  project={project}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <NoData message="Belum ada proyek DEFRA yang tersedia." />
        )}
      </div>
    </div>
  );
}

