'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/layout/dashboard-layout';
import { getCarbonCalculationAIMenu } from '@/constant/menu-sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { trpc } from '@/trpc/react';
import { DialogInfo } from '@/components/ui/dialog-info';
import { ISCCProjectInfoTab } from './tabs/project-info-tab';
import { ISCCCultivationTab } from './tabs/cultivation-tab';
import { ISCCProcessingTab } from './tabs/processing-tab';
import { ISCCTransportTab } from './tabs/transport-tab';
import { ISCCCalculationsTab } from './tabs/calculations-tab';

export default function ISCCProjectDetailPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const searchParams = useSearchParams();
  const isccProjectId = String(projectId);

  // Get active tab from URL or default to project-info
  const activeTab = (searchParams.get('tab') as string) || 'project-info';

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  // Fetch project data with relations
  const { data: projectData, isLoading } = trpc.isccProjects.getById.useQuery({
    id: isccProjectId
  });

  const [infoDialogTitle, setInfoDialogTitle] = useState('');
  const [infoDialogDesc, setInfoDialogDesc] = useState('');
  const [infoVariant, setInfoVariant] = useState<'success' | 'error' | 'info'>(
    'info'
  );
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  const tabs = [
    {
      value: 'project-info',
      label: 'Project Info'
    },
    {
      value: 'cultivation',
      label: 'Cultivation (EEC)'
    },
    {
      value: 'processing',
      label: 'Processing (EP)'
    },
    {
      value: 'transport',
      label: 'Transport (ETD)'
    },
    {
      value: 'calculations',
      label: 'Calculations'
    }
  ];

  return (
    <DashboardLayout
      href={`/apps/carbon-emission/iscc-ai/projects`}
      titleHeader="All Projects (AI)"
      subTitleHeader="ISCC Project Detail"
      menuSidebar={getCarbonCalculationAIMenu(isccProjectId)}
    >
      <div>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-primary text-left"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8 mx-auto">
          <Spinner />
        </div>
      ) : !projectData?.project ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          defaultValue="project-info"
          className="w-full p-2"
        >
          <div className="overflow-x-auto no-scrollbar">
            <TabsList className="flex w-max min-w-full space-x-2 border-b border-muted p-1">
              {tabs.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="px-5 py-3 text-base font-semibold whitespace-nowrap rounded-md
                    data-[state=active]:bg-white data-[state=active]:text-primary
                    hover:bg-muted transition-all"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="project-info">
            <ISCCProjectInfoTab
              project={projectData.project}
              onSuccess={(message: string) => {
                setInfoVariant('success');
                setInfoDialogTitle('Berhasil');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
                utils.isccProjects.getById.invalidate({ id: isccProjectId });
              }}
              onError={(message: string) => {
                setInfoVariant('error');
                setInfoDialogTitle('Error');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="cultivation">
            <ISCCCultivationTab
              projectId={isccProjectId}
              cultivation={projectData.cultivation}
              onSuccess={(message: string) => {
                setInfoVariant('success');
                setInfoDialogTitle('Berhasil');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
                utils.isccProjects.getById.invalidate({ id: isccProjectId });
              }}
              onError={(message: string) => {
                setInfoVariant('error');
                setInfoDialogTitle('Error');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="processing">
            <ISCCProcessingTab
              projectId={isccProjectId}
              processing={projectData.processing}
              onSuccess={(message: string) => {
                setInfoVariant('success');
                setInfoDialogTitle('Berhasil');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
                utils.isccProjects.getById.invalidate({ id: isccProjectId });
              }}
              onError={(message: string) => {
                setInfoVariant('error');
                setInfoDialogTitle('Error');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="transport">
            <ISCCTransportTab
              projectId={isccProjectId}
              transport={projectData.transport}
              onSuccess={(message: string) => {
                setInfoVariant('success');
                setInfoDialogTitle('Berhasil');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
                utils.isccProjects.getById.invalidate({ id: isccProjectId });
              }}
              onError={(message: string) => {
                setInfoVariant('error');
                setInfoDialogTitle('Error');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="calculations">
            <ISCCCalculationsTab
              projectId={isccProjectId}
              project={projectData.project}
              calculations={projectData.calculations || []}
              cultivation={projectData.cultivation}
              processing={projectData.processing}
              transport={projectData.transport}
              onSuccess={(message: string) => {
                setInfoVariant('success');
                setInfoDialogTitle('Berhasil');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
                utils.isccProjects.getById.invalidate({ id: isccProjectId });
                utils.isccCalculations.getByProjectId.invalidate({
                  projectId: isccProjectId
                });
              }}
              onError={(message: string) => {
                setInfoVariant('error');
                setInfoDialogTitle('Error');
                setInfoDialogDesc(message);
                setInfoDialogOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>
      )}

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
