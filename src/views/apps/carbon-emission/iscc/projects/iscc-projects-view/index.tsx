/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";
import { ISCCProjectCardSkeleton } from "./iscc-project-card-skeleton";
import { ISCCProjectCard } from "./iscc-project-card";
import { ISCCProjectDialogForm } from "./iscc-project-dialog-form";
import { ISCCProjectSearchInput } from "./iscc-project-search-input";
import { NoData } from "@/components/ui/no-data";

type ISCCProject =
  inferRouterOutputs<AppRouter>["isccProjects"]["getByTenantId"]["projects"][number];

type ISCCProjectsViewProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  formData: {
    name: string;
    description: string;
    productType: 'biodiesel' | 'bioethanol' | 'biomass' | 'biomethane' | 'bio_jet_fuel' | 'other';
    feedstockType: 'palm_oil' | 'corn' | 'sugarcane' | 'used_cooking_oil' | 'wheat' | 'rapeseed' | 'soybean' | 'waste' | 'other';
    productionVolume: string;
    lhv: string;
    lhvUnit: 'MJ/kg' | 'MJ/liter';
  };
  setFormData: Dispatch<SetStateAction<{
    name: string;
    description: string;
    productType: 'biodiesel' | 'bioethanol' | 'biomass' | 'biomethane' | 'bio_jet_fuel' | 'other';
    feedstockType: 'palm_oil' | 'corn' | 'sugarcane' | 'used_cooking_oil' | 'wheat' | 'rapeseed' | 'soybean' | 'waste' | 'other';
    productionVolume: string;
    lhv: string;
    lhvUnit: 'MJ/kg' | 'MJ/liter';
  }>>;
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  handleAddProject: () => void;
  isLoading: boolean;
  createMutation: any;
  filteredProjects: ISCCProject[];
  isCreating: boolean;
  editMode: boolean;
  setEditMode: (e: boolean) => void;
  setDeleteDialogOpen: (e: boolean) => void;
  setIdProject: Dispatch<SetStateAction<string>>;
};

export function ISCCProjectsView({
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
}: ISCCProjectsViewProps) {
  const onEdit = (project: ISCCProject) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      productType: project.productType,
      feedstockType: project.feedstockType,
      productionVolume: project.productionVolume || "",
      lhv: project.lhv || "",
      lhvUnit: (project.lhvUnit as 'MJ/kg' | 'MJ/liter') || 'MJ/kg',
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
        <ISCCProjectSearchInput value={search} onChange={setSearch} />
        <ISCCProjectDialogForm
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
              <ISCCProjectCardSkeleton key={i} />
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
                <ISCCProjectCard
                  project={project}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <NoData message="Belum ada proyek ISCC yang tersedia." />
        )}
      </div>
    </div>
  );
}

