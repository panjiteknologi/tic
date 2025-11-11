'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/react';
import { DialogInfo } from '@/components/ui/dialog-info';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { DEFRAProjectsView } from '@/views/apps/carbon-emission/defra/projects/defra-projects-view';

export default function DEFRAProjectsPage() {
  const utils = trpc.useUtils();

  const [search, setSearch] = useState('');
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizationName: '',
    reportingPeriodStart: startOfYear,
    reportingPeriodEnd: endOfYear,
    defraYear: today.getFullYear().toString(),
    status: 'draft' as 'draft' | 'active' | 'completed' | 'archived'
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

  const { data, isLoading } = trpc.defraProjects.getByTenantId.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );
  const projects = data?.projects ?? [];

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.organizationName &&
        project.organizationName
          .toLowerCase()
          .includes(search.toLowerCase())) ||
      project.defraYear.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = trpc.defraProjects.create.useMutation({
    onSuccess: (data) => {
      utils.defraProjects.getByTenantId.invalidate({ tenantId });
      setFormData({
        name: '',
        description: '',
        organizationName: '',
        reportingPeriodStart: startOfYear,
        reportingPeriodEnd: endOfYear,
        defraYear: today.getFullYear().toString(),
        status: 'draft'
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
      tenantId,
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      organizationName: formData.organizationName?.trim() || null,
      reportingPeriodStart: formData.reportingPeriodStart,
      reportingPeriodEnd: formData.reportingPeriodEnd,
      defraYear: formData.defraYear,
      status: formData.status
    };

    if (!trimmedData.name) return;

    if (editMode && idProject) {
      updateMutation.mutate({
        id: idProject,
        name: trimmedData.name,
        description: trimmedData.description,
        organizationName: trimmedData.organizationName,
        reportingPeriodStart: trimmedData.reportingPeriodStart,
        reportingPeriodEnd: trimmedData.reportingPeriodEnd,
        defraYear: trimmedData.defraYear,
        status: trimmedData.status
      });
    } else {
      createMutation.mutate(trimmedData);
    }
  };

  const updateMutation = trpc.defraProjects.update.useMutation({
    onSuccess: (data) => {
      utils.defraProjects.getByTenantId.invalidate({ tenantId });
      setFormData({
        name: '',
        description: '',
        organizationName: '',
        reportingPeriodStart: startOfYear,
        reportingPeriodEnd: endOfYear,
        defraYear: today.getFullYear().toString(),
        status: 'draft'
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

  const deleteMutation = trpc.defraProjects.delete.useMutation({
    onSuccess: () => {
      utils.defraProjects.getByTenantId.invalidate({ tenantId });
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
    <>
      <DEFRAProjectsView
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
    </>
  );
}
