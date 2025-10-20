"use client";

import { useState } from "react";
import { Plus, Tag, Database, FileText, Edit, Trash2, Calculator, TrendingUp, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/trpc/react";
import { formatNumber } from "@/lib/utils";
import { AddActivityDataDialog } from "@/components/ipcc/add-activity-data-dialog";
import { CalculateEmissionDialog } from "@/components/ipcc/calculate-emission-dialog";

interface Category {
  id: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  sector: string;
  assignedAt: Date;
}

interface CategoriesBySector {
  [sector: string]: Category[];
}

interface IPCCProjectCategoryItemProps {
  projectId: string;
  categories: Category[];
  categoriesBySector: CategoriesBySector;
}



export function IPCCProjectCategoryItem({
  projectId,
  categories,
  categoriesBySector,
}: IPCCProjectCategoryItemProps) {
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [calculateDialogOpen, setCalculateDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<{id: string, name: string}>({id: "", name: ""});

  // Fetch activity data for the project
  const { data: activityData, refetch: refetchActivityData } = trpc.ipccActivityData.getByProject.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Fetch calculations for all activity data in the project
  const { data: calculationsData, refetch: refetchCalculations } = trpc.ipccEmissionCalculations.getByProject.useQuery(
    { projectId },
    { enabled: !!projectId }
  );



  const getSectorLabel = (sector: string) => {
    const sectorLabels = {
      ENERGY: "Energy",
      IPPU: "Industrial Processes & Product Use",
      AFOLU: "Agriculture, Forestry & Other Land Use",
      WASTE: "Waste",
      OTHER: "Other",
    };
    return sectorLabels[sector as keyof typeof sectorLabels] || sector;
  };

  // Group activity data by category
  const getActivityDataForCategory = (categoryId: string) => {
    return activityData?.activityData?.filter(
      (activity) => activity.categoryId === categoryId
    ) || [];
  };

  // Get calculations for specific activity
  const getCalculationsForActivity = (activityId: string) => {
    return calculationsData?.calculations?.filter(
      (calc) => calc.activityDataId === activityId
    ) || [];
  };

  // Format emission value for display
  const formatEmissionValue = (value: string, unit?: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 1000000) {
      return `${formatNumber(numValue / 1000000)} M${unit || 'kg'}`;
    } else if (numValue >= 1000) {
      return `${formatNumber(numValue / 1000)} k${unit || 'kg'}`;
    }
    return `${formatNumber(numValue)} ${unit || 'kg'}`;
  };



  const handleAddActivity = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setAddActivityDialogOpen(true);
  };


  const handleActivityAdded = () => {
    refetchActivityData();
  };

  const handleCalculateEmission = (activityId: string, activityName: string) => {
    setSelectedActivity({id: activityId, name: activityName});
    setCalculateDialogOpen(true);
  };


  const handleEmissionCalculated = () => {
    refetchCalculations();
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Assigned Emission Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoriesBySector).map(
              ([sector, sectorCategories]) => (
                <div key={sector} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    {getSectorLabel(sector)}
                  </h4>
                  <div className="space-y-3">
                    {sectorCategories.map((category) => {
                      const categoryActivities = getActivityDataForCategory(category.categoryId);
                      
                      return (
                        <div key={category.categoryId} className="border rounded-lg overflow-hidden">
                          {/* Category Header */}
                          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {category.categoryCode}
                              </Badge>
                              <span className="font-medium text-sm">
                                {category.categoryName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {categoryActivities.length} activities
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddActivity(category.categoryId)}
                              className="gap-1"
                            >
                              <Database className="h-3 w-3" />
                              Add Activity Data
                            </Button>
                          </div>

                          {/* Activity Data List */}
                          {categoryActivities.length > 0 && (
                            <div className="p-3">
                              <div className="space-y-2">
                                {categoryActivities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="p-3 bg-background rounded border space-y-3"
                                  >
                                    {/* Activity Header */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium text-sm">
                                            {activity.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                          <span>Value: {formatNumber(parseFloat(activity.value))} {activity.unit}</span>
                                          {activity.description && (
                                            <span>Description: {activity.description}</span>
                                          )}
                                          {activity.source && (
                                            <span>Source: {activity.source}</span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1 ml-4">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Edit Activity Data</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className={`h-7 w-7 p-0 ${
                                                  getCalculationsForActivity(activity.id).length > 0 
                                                    ? 'text-green-600' 
                                                    : 'text-blue-600'
                                                }`}
                                                onClick={() => handleCalculateEmission(activity.id, activity.name)}
                                              >
                                                {getCalculationsForActivity(activity.id).length > 0 ? (
                                                  <Activity className="h-3 w-3" />
                                                ) : (
                                                  <Calculator className="h-3 w-3" />
                                                )}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                {getCalculationsForActivity(activity.id).length > 0 
                                                  ? 'Recalculate Emissions' 
                                                  : 'Calculate Emissions'
                                                }
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Delete Activity Data</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>

                                    {/* Emission Calculations Results */}
                                    {(() => {
                                      const calculations = getCalculationsForActivity(activity.id);
                                      return calculations.length > 0 && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded text-xs">
                                          <div className="flex items-center gap-1 mb-2">
                                            <Zap className="h-3 w-3 text-green-600" />
                                            <span className="font-medium text-green-800">Emission Results:</span>
                                          </div>
                                          <div className="space-y-2">
                                            {calculations.map((calc) => (
                                              <div key={calc.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                                    {calc.gasType}
                                                  </Badge>
                                                  <span className="text-green-700">
                                                    {formatEmissionValue(calc.emissionValue, calc.emissionUnit)}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-green-600 font-medium">
                                                    {formatEmissionValue(calc.co2Equivalent)} CO2-eq
                                                  </span>
                                                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                                    {calc.tier}
                                                  </Badge>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          {calculations[0]?.notes && (
                                            <div className="mt-2 text-green-600">
                                              <span className="font-medium">Notes:</span> {calculations[0].notes}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Empty State */}
                          {categoryActivities.length === 0 && (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              No activity data yet. Click "Add Activity Data" to get started.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Activity Data Dialog */}
      <AddActivityDataDialog
        open={addActivityDialogOpen}
        onOpenChange={setAddActivityDialogOpen}
        projectId={projectId}
        categoryId={selectedCategoryId}
        onActivityAdded={handleActivityAdded}
      />

      {/* Calculate Emission Dialog */}
      <CalculateEmissionDialog
        open={calculateDialogOpen}
        onOpenChange={setCalculateDialogOpen}
        activityDataId={selectedActivity.id}
        activityName={selectedActivity.name}
        onEmissionCalculated={handleEmissionCalculated}
      />
    </>
  );
}
