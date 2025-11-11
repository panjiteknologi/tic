'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia
} from '@/components/ui/empty';
import {
  BarChart3,
  Building2,
  Calendar,
  Database,
  FileText,
  Leaf,
  PieChart
} from 'lucide-react';
import { trpc } from '@/trpc/react';
import { formatNumber } from '@/lib/utils';
import { DEFRACalculationDialog } from '@/components/defra/defra-calculation-dialog';
import { DEFRACalculationsTable } from '@/components/defra/defra-calculations-table';
import { DialogInfo } from '@/components/ui/dialog-info';
import { useState } from 'react';

const StatusBadge = ({ status }: { status: string }) => {
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

  return <Badge variant={getStatusColor(status)}>{status}</Badge>;
};

export default function DEFRAProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState('');
  const [infoDialogDesc, setInfoDialogDesc] = useState('');
  const [infoVariant, setInfoVariant] = useState<
    'success' | 'error' | 'info'
  >('info');

  const utils = trpc.useUtils();

  // Fetch project data
  const { data: projectData, isLoading: projectLoading } =
    trpc.defraProjects.getById.useQuery(
      { id: projectId },
      { enabled: !!projectId }
    );

  // Fetch calculations separately for better control
  const {
    data: calculationsData,
    isLoading: calculationsLoading,
    refetch: refetchCalculations
  } = trpc.defraCarbonCalculations.getByProjectId.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  if (projectLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!projectData?.project) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>Project Not Found</EmptyTitle>
          <EmptyDescription>
            The DEFRA project you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { project, calculations, summary } = projectData;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalCalculations = calculations?.length || 0;
  const totalCO2e = summary?.totalCo2e
    ? parseFloat(summary.totalCo2e.toString())
    : 0;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(project.reportingPeriodStart)} -{' '}
              {formatDate(project.reportingPeriodEnd)}
            </div>
            {project.organizationName && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.organizationName}
              </div>
            )}
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              DEFRA Year: {project.defraYear}
            </div>
          </div>
        </div>
        <DEFRACalculationDialog
          projectId={projectId}
          defraYear={project.defraYear}
          open={calculationDialogOpen}
          setOpen={setCalculationDialogOpen}
          onSuccess={() => {
            setInfoVariant('success');
            setInfoDialogTitle('Calculation Created');
            setInfoDialogDesc(
              'Carbon emission calculation has been successfully created and calculated using AI.'
            );
            setInfoDialogOpen(true);
            refetchCalculations();
            utils.defraProjects.getById.invalidate({ id: projectId });
          }}
          onError={(message) => {
            setInfoVariant('error');
            setInfoDialogTitle('Calculation Failed');
            setInfoDialogDesc(message);
            setInfoDialogOpen(true);
          }}
        />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total CO₂ Equivalent
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCO2e > 0
                ? `${formatNumber(totalCO2e)} kg CO₂e`
                : '0 kg CO₂e'}
            </div>
            <p className="text-xs text-muted-foreground">Total emissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalculations}</div>
            <p className="text-xs text-muted-foreground">
              Emission calculations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scope 1</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.scope1Total
                ? `${formatNumber(
                    parseFloat(summary.scope1Total.toString())
                  )} kg CO₂e`
                : '0 kg CO₂e'}
            </div>
            <p className="text-xs text-muted-foreground">Direct emissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scope 2</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.scope2Total
                ? `${formatNumber(
                    parseFloat(summary.scope2Total.toString())
                  )} kg CO₂e`
                : '0 kg CO₂e'}
            </div>
            <p className="text-xs text-muted-foreground">
              Indirect emissions (energy)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scope 3 Card */}
      {summary?.scope3Total &&
        parseFloat(summary.scope3Total.toString()) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Scope 3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(parseFloat(summary.scope3Total.toString()))} kg
                CO₂e
              </div>
              <p className="text-xs text-muted-foreground">
                Other indirect emissions
              </p>
            </CardContent>
          </Card>
        )}

      {/* Calculations Table */}
      <DEFRACalculationsTable
        projectId={projectId}
        calculations={calculationsData?.calculations || []}
        onCalculationDeleted={() => {
          refetchCalculations();
          utils.defraProjects.getById.invalidate({ id: projectId });
          setInfoVariant('success');
          setInfoDialogTitle('Calculation Deleted');
          setInfoDialogDesc(
            'Carbon emission calculation has been successfully deleted.'
          );
          setInfoDialogOpen(true);
        }}
      />

      <DialogInfo
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        title={infoDialogTitle}
        description={infoDialogDesc}
        variant={infoVariant}
        onClose={() => setInfoDialogOpen(false)}
      />
    </div>
  );
}
