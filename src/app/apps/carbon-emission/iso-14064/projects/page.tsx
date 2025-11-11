'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { DialogInfo } from '@/components/ui/dialog-info';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { ISO14064ProjectDialogForm } from '@/components/iso-14064/iso-14064-project-dialog-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, Building2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { NoData } from '@/components/ui/no-data';

export default function ISO14064ProjectsPage() {
  const router = useRouter();
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
    reportingYear: today.getFullYear().toString(),
    status: 'draft' as 'draft' | 'active' | 'completed' | 'archived',
    boundaryType: 'operational' as 'operational' | 'financial' | 'other',
    standardVersion: '14064-1:2018'
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

  const { data, isLoading } = trpc.iso14064Projects.getByTenantId.useQuery(
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
      project.reportingYear.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = trpc.iso14064Projects.create.useMutation({
    onSuccess: (data) => {
      utils.iso14064Projects.getByTenantId.invalidate({ tenantId });
      setFormData({
        name: '',
        description: '',
        organizationName: '',
        reportingPeriodStart: startOfYear,
        reportingPeriodEnd: endOfYear,
        reportingYear: today.getFullYear().toString(),
        status: 'draft',
        boundaryType: 'operational',
        standardVersion: '14064-1:2018'
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
      reportingYear: formData.reportingYear,
      status: formData.status,
      boundaryType: formData.boundaryType,
      standardVersion: formData.standardVersion
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
        reportingYear: trimmedData.reportingYear,
        status: trimmedData.status,
        boundaryType: trimmedData.boundaryType,
        standardVersion: trimmedData.standardVersion
      });
    } else {
      createMutation.mutate(trimmedData);
    }
  };

  const updateMutation = trpc.iso14064Projects.update.useMutation({
    onSuccess: (data) => {
      utils.iso14064Projects.getByTenantId.invalidate({ tenantId });
      setFormData({
        name: '',
        description: '',
        organizationName: '',
        reportingPeriodStart: startOfYear,
        reportingPeriodEnd: endOfYear,
        reportingYear: today.getFullYear().toString(),
        status: 'draft',
        boundaryType: 'operational',
        standardVersion: '14064-1:2018'
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

  const deleteMutation = trpc.iso14064Projects.delete.useMutation({
    onSuccess: () => {
      utils.iso14064Projects.getByTenantId.invalidate({ tenantId });
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

  const handleEdit = (project: typeof projects[0]) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      organizationName: project.organizationName || '',
      reportingPeriodStart: project.reportingPeriodStart instanceof Date 
        ? project.reportingPeriodStart 
        : new Date(project.reportingPeriodStart),
      reportingPeriodEnd: project.reportingPeriodEnd instanceof Date 
        ? project.reportingPeriodEnd 
        : new Date(project.reportingPeriodEnd),
      reportingYear: project.reportingYear,
      status: project.status as 'draft' | 'active' | 'completed' | 'archived',
      boundaryType: project.boundaryType as 'operational' | 'financial' | 'other',
      standardVersion: project.standardVersion || '14064-1:2018'
    });
    setOpenDialog(true);
    setEditMode(true);
    setIdProject(project.id);
  };

  const handleDelete = (id: string) => {
    setDeleteDialogOpen(true);
    setIdProject(id);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'default';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <div className="space-y-6 mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Input
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <ISO14064ProjectDialogForm
            open={openDialog}
            setOpen={setOpenDialog}
            formData={formData}
            setFormData={setFormData}
            handleAdd={handleSaveProject}
            isCreating={createMutation.isPending || updateMutation.isPending}
            error={createMutation.error || updateMutation.error}
            editMode={editMode}
          />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
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
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/apps/carbon-emission/iso-14064/projects/${project.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {project.description && (
                            <CardDescription className="mt-1 line-clamp-2">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {project.organizationName && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {project.organizationName}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(project.reportingPeriodStart)} - {formatDate(project.reportingPeriodEnd)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          Tahun: {project.reportingYear}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(project);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <NoData message="Belum ada proyek ISO 14064-1:2018 yang tersedia." />
          )}
        </div>
      </div>

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

