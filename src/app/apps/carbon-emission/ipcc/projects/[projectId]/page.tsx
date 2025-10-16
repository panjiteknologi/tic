"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  BarChart3,
  Building2,
  Calendar,
  Database,
  Factory,
  FileText,
  Leaf,
  PieChart,
  Plus,
  Settings,
} from "lucide-react";
import { trpc } from "@/trpc/react";
import { formatNumber } from "@/lib/utils";
import { AddProjectCategoryDialog } from "@/components/ipcc/add-project-category-dialog";
import { IPCCProjectCategoryItem } from "@/components/ipcc/ipcc-project-category-item";

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "ACTIVE":
        return "default";
      case "COMPLETED":
        return "default";
      case "ARCHIVED":
        return "outline";
      default:
        return "secondary";
    }
  };

  return <Badge variant={getStatusColor(status)}>{status}</Badge>;
};

export default function IPCCProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Fetch project data
  const { data: projectData, isLoading: projectLoading } =
    trpc.ipccProjects.getById.useQuery(
      { id: projectId },
      { enabled: !!projectId }
    );

  // Fetch project stats
  const { data: statsData, isLoading: statsLoading } =
    trpc.ipccProjects.getStats.useQuery(
      { id: projectId },
      { enabled: !!projectId }
    );

  // Fetch project summaries
  const { data: summariesData, isLoading: summariesLoading } =
    trpc.ipccProjectSummaries.getByProject.useQuery(
      { projectId },
      { enabled: !!projectId }
    );

  // Fetch activity data
  const { data: activityData, isLoading: activityLoading } =
    trpc.ipccActivityData.getByProject.useQuery(
      { projectId },
      { enabled: !!projectId }
    );

  // Fetch dashboard overview
  const { data: dashboardData, isLoading: dashboardLoading } =
    trpc.ipccDashboard.getOverview.useQuery({});

  // Fetch project categories
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } =
    trpc.ipccProjectCategories.getCategoriesByProject.useQuery(
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
            The IPCC project you're looking for doesn't exist or has been
            removed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { project } = projectData;
  const hasEmissions = statsData?.totalStats?.totalCO2Equivalent !== "0";
  const hasSummaries =
    summariesData?.summaries && summariesData.summaries.length > 0;
  const hasActivities =
    activityData?.activityData && activityData.activityData.length > 0;

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
            {project.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {project.year}
              </div>
            )}
            {project.organizationName && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.organizationName}
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-1">
                <Factory className="h-4 w-4" />
                {project.location}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <AddProjectCategoryDialog 
            projectId={projectId} 
            onCategoryAdded={() => refetchCategories()} 
          />
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total CO� Equivalent
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.totalStats?.totalCO2Equivalent
                ? `${formatNumber(
                    parseFloat(statsData.totalStats.totalCO2Equivalent)
                  )} tCO�e`
                : "0 tCO�e"}
            </div>
            <p className="text-xs text-muted-foreground">Across all sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.totalStats?.totalCalculations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Emission calculations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sectors</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.sectorBreakdown?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityData?.activityData?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Activity data entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Categories Section */}
      {categoriesData?.categories && categoriesData.categories.length > 0 && (
        <IPCCProjectCategoryItem
          projectId={projectId}
          categories={categoriesData.categories}
          categoriesBySector={categoriesData.categoriesBySector}
        />
      )}
    </div>
  );
}
