'use client';

import { useState } from 'react';
import DashboardLayout from '@/layout/dashboard-layout';
import { AppSidebarTypes } from '@/types/sidebar-types';
import { trpc } from '@/trpc/react';
import { ISCCProjectsView } from '@/views/apps/carbon-emission/iscc/projects/iscc-projects-view';
import { DialogInfo } from '@/components/ui/dialog-info';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { CarbonProjectISCCAIMenu } from '@/constant/menu-sidebar';

export default function ProjectsPage() {
  const utils = trpc.useUtils();

  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    productType:
      | 'biodiesel'
      | 'bioethanol'
      | 'biomass'
      | 'biomethane'
      | 'bio_jet_fuel'
      | 'other';
    feedstockType:
      | 'palm_oil'
      | 'corn'
      | 'sugarcane'
      | 'used_cooking_oil'
      | 'wheat'
      | 'rapeseed'
      | 'soybean'
      | 'waste'
      | 'other';
    productionVolume: string;
    lhv: string;
    lhvUnit: 'MJ/kg' | 'MJ/liter';
  }>({
    name: '',
    description: '',
    productType: 'biodiesel',
    feedstockType: 'palm_oil',
    productionVolume: '',
    lhv: '',
    lhvUnit: 'MJ/kg'
  });
  const [idProject, setIdProject] = useState('');

  const [infoDialogTitle, setInfoDialogTitle] = useState('');
  const [infoDialogDesc, setInfoDialogDesc] = useState('');
  const [infoVariant, setInfoVariant] = useState<'success' | 'error' | 'info'>(
    'info'
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: userProfile } = trpc.user.getUserProfile.useQuery();
  const tenantId = userProfile?.tenantId ?? '';

  const { data, isLoading } = trpc.isccProjects.getByTenantId.useQuery({
    tenantId
  });
  const projects = data?.projects ?? [];

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(search.toLowerCase())) ||
      project.productType.toLowerCase().includes(search.toLowerCase()) ||
      project.feedstockType.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = trpc.isccProjects.create.useMutation({
    onSuccess: (data) => {
      utils.isccProjects.getByTenantId.invalidate({ tenantId });
      setFormData({
        name: '',
        description: '',
        productType: 'biodiesel',
        feedstockType: 'palm_oil',
        productionVolume: '',
        lhv: '',
        lhvUnit: 'MJ/kg'
      });
      setOpenDialog(false);
      setEditMode(false);
      setInfoVariant('success');
      setInfoDialogTitle('Project berhasil dibuat');
      setInfoDialogDesc(`Project "${data.project.name}" berhasil ditambahkan.`);
      setInfoDialogOpen(true);
    },
    onError: (error: { message: string }) => {
      setInfoVariant('error');
      setInfoDialogTitle('Gagal membuat project');
      setInfoDialogDesc(error.message);
      setInfoDialogOpen(true);
    }
  });

  const handleSaveProject = () => {
    const trimmedData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      productType: formData.productType,
      feedstockType: formData.feedstockType,
      productionVolume: formData.productionVolume || '',
      lhv: formData.lhv || '',
      lhvUnit: formData.lhvUnit
    };

    if (!trimmedData.name) return;

    if (editMode && idProject) {
      updateMutation.mutate({
        id: idProject,
        name: trimmedData.name,
        description: trimmedData.description || null,
        productType: trimmedData.productType,
        feedstockType: trimmedData.feedstockType,
        productionVolume: trimmedData.productionVolume || null,
        lhv: trimmedData.lhv || null,
        lhvUnit: trimmedData.lhvUnit
      });
    } else {
      createMutation.mutate({
        tenantId,
        name: trimmedData.name,
        description: trimmedData.description || null,
        productType: trimmedData.productType,
        feedstockType: trimmedData.feedstockType,
        productionVolume: trimmedData.productionVolume || null,
        lhv: trimmedData.lhv || null,
        lhvUnit: trimmedData.lhvUnit
      });
    }
  };

  const updateMutation = trpc.isccProjects.update.useMutation({
    onSuccess: (data) => {
      utils.isccProjects.getByTenantId.invalidate({ tenantId });
      setFormData({
        name: '',
        description: '',
        productType: 'biodiesel',
        feedstockType: 'palm_oil',
        productionVolume: '',
        lhv: '',
        lhvUnit: 'MJ/kg'
      });
      setOpenDialog(false);
      setEditMode(false);
      setInfoVariant('success');
      setInfoDialogTitle('Project berhasil diperbarui');
      setInfoDialogDesc(`Project "${data.project.name}" berhasil diperbarui.`);
      setInfoDialogOpen(true);
    },
    onError: (error: { message: string }) => {
      setInfoVariant('error');
      setInfoDialogTitle('Gagal mengedit project');
      setInfoDialogDesc(error.message);
      setInfoDialogOpen(true);
    }
  });

  const deleteMutation = trpc.isccProjects.delete.useMutation({
    onSuccess: () => {
      utils.isccProjects.getByTenantId.invalidate({ tenantId });
      const project = projects.find((item) => item.id === idProject);
      setIsDelete(false);
      setInfoVariant('success');
      setInfoDialogTitle('Project berhasil dihapus');
      setInfoDialogDesc(`Project "${project?.name}" berhasil dihapus.`);
      setInfoDialogOpen(true);
      setDeleteDialogOpen(false);
    },
    onError: (error: { message: string }) => {
      setIsDelete(false);
      setInfoVariant('error');
      setInfoDialogTitle('Gagal menghapus project');
      setInfoDialogDesc(error.message);
      setInfoDialogOpen(true);
      setDeleteDialogOpen(false);
    }
  });

  const confirmDelete = () => {
    setIsDelete(true);
    deleteMutation.mutate({
      id: idProject
    });
  };

  return (
    <DashboardLayout
      href="/apps/carbon-emission/iscc-ai/projects"
      titleHeader="All Projects (AI)"
      subTitleHeader="All Projects Carbon Emission"
      menuSidebar={CarbonProjectISCCAIMenu as AppSidebarTypes}
    >
      <ISCCProjectsView
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
