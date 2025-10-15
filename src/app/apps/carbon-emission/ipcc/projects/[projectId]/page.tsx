"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
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
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/trpc/react";
import { formatNumber } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("overview");

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

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!hasEmissions ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TrendingUp className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Emission Data</EmptyTitle>
                <EmptyDescription>
                  Start by adding activity data to calculate emissions for this
                  project.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity Data
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Sector Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData?.sectorBreakdown?.map((sector) => (
                      <div
                        key={sector.sector}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span className="text-sm font-medium">
                            {sector.sector}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(
                            parseFloat(sector.totalCO2Equivalent || "0")
                          )}{" "}
                          tCO�e
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gas Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Gas Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData?.gasBreakdown?.map((gas) => (
                      <div
                        key={gas.gasType}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-secondary rounded-full"></div>
                          <span className="text-sm font-medium">
                            {gas.gasType}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatNumber(
                              parseFloat(gas.totalEmissions || "0")
                            )}{" "}
                            t
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(
                              parseFloat(gas.totalCO2Equivalent || "0")
                            )}{" "}
                            tCO�e
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {!hasActivities ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Database className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Activity Data</EmptyTitle>
                <EmptyDescription>
                  Add activity data to track emission sources and calculate
                  environmental impact.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity Data
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Activity Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData?.activityData?.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{activity.name}</div>
                        {activity.description && (
                          <div className="text-sm text-muted-foreground">
                            {activity.description}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Category: {activity.category?.name} (
                          {activity.category?.sector})
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">
                          {formatNumber(parseFloat(activity.value))}{" "}
                          {activity.unit}
                        </div>
                        {activity.source && (
                          <div className="text-xs text-muted-foreground">
                            Source: {activity.source}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calculations">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3 className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Emission Calculations</EmptyTitle>
              <EmptyDescription>
                View detailed emission calculations and methodologies used for
                this project.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline">View Calculations</Button>
            </EmptyContent>
          </Empty>
        </TabsContent>

        <TabsContent value="summaries">
          {!hasSummaries ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Project Summaries</EmptyTitle>
                <EmptyDescription>
                  Project summaries will be automatically generated once
                  emission calculations are completed.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline">Generate Summaries</Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Summaries by Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {summariesData?.summaries?.map((summary) => (
                      <div key={summary.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            {summary.sector}
                          </h3>
                          <Badge variant="outline">
                            {formatNumber(
                              parseFloat(summary.totalCO2Equivalent || "0")
                            )}{" "}
                            tCO�e
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              CO�
                            </div>
                            <div className="font-medium">
                              {formatNumber(
                                parseFloat(summary.totalCO2 || "0")
                              )}{" "}
                              t
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              CH�
                            </div>
                            <div className="font-medium">
                              {formatNumber(
                                parseFloat(summary.totalCH4 || "0")
                              )}{" "}
                              t
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              N�O
                            </div>
                            <div className="font-medium">
                              {formatNumber(
                                parseFloat(summary.totalN2O || "0")
                              )}{" "}
                              t
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Others
                            </div>
                            <div className="font-medium">
                              {formatNumber(
                                parseFloat(summary.totalOtherGases || "0")
                              )}{" "}
                              t
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {summariesData?.grandTotal && (
                <Card>
                  <CardHeader>
                    <CardTitle>Grand Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatNumber(
                            summariesData.grandTotal.totalCO2Equivalent
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total CO� Equivalent (t)
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {formatNumber(summariesData.grandTotal.totalCO2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          CO� (t)
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {formatNumber(summariesData.grandTotal.totalCH4)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          CH� (t)
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {formatNumber(summariesData.grandTotal.totalN2O)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          N�O (t)
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {formatNumber(
                            summariesData.grandTotal.totalOtherGases
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Other Gases (t)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrendingUp className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Analytics Dashboard</EmptyTitle>
              <EmptyDescription>
                View detailed analytics, trends, and insights for this IPCC
                project.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline">View Analytics</Button>
            </EmptyContent>
          </Empty>
        </TabsContent>

        <TabsContent value="settings">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Settings className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Project Settings</EmptyTitle>
              <EmptyDescription>
                Configure project settings, permissions, and data validation
                rules.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </TabsContent>
      </Tabs>
    </div>
  );
}
