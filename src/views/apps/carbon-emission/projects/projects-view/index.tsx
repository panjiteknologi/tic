/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";
import { ProjectCardSkeleton } from "./project-card-skeleton";
import { ProjectCard } from "./project-card";
import { ProjectDialogForm } from "./project-dialog-form";
import { ProjectSearchInput } from "./project-search-input";
import { NoData } from "@/components/ui/no-data";

type Project =
  inferRouterOutputs<AppRouter>["carbonProject"]["getByTenantId"]["carbonProjects"][number];

type ProjectsViewProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  handleAddProject: () => void;
  isLoading: boolean;
  createMutation: any;
  filteredProjects: Project[];
  isCreating: boolean;
  editMode: boolean;
  setEditMode: (e: boolean) => void;
  setDeleteDialogOpen: (e: boolean) => void;
  setIdProject: Dispatch<SetStateAction<string>>;
};

export function ProjectsView({
  search,
  setSearch,
  name,
  setName,
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
}: ProjectsViewProps) {
  const onEdit = (id: string) => {
    setOpenDialog(true);
    setEditMode(true);
    setIdProject(id);
  };

  const onDelete = (id: string) => {
    setDeleteDialogOpen(true);
    setIdProject(id);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <ProjectSearchInput value={search} onChange={setSearch} />
        <ProjectDialogForm
          open={openDialog}
          setOpen={setOpenDialog}
          name={name}
          setName={setName}
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
              <ProjectCardSkeleton key={i} />
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
                <ProjectCard
                  project={project}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  setName={() => setName(project.name)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <NoData message="Belum ada proyek yang tersedia." />
        )}
      </div>
    </div>
  );
}
