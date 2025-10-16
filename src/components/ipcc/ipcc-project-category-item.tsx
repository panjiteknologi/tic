"use client";

import { useState } from "react";
import { Plus, Tag, Database, FileText, Edit, Trash2, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/react";
import { formatNumber } from "@/lib/utils";

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

interface ActivityDataFormData {
  categoryId: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  source: string;
}

export function IPCCProjectCategoryItem({
  projectId,
  categories,
  categoriesBySector,
}: IPCCProjectCategoryItemProps) {
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [formData, setFormData] = useState<ActivityDataFormData>({
    categoryId: "",
    name: "",
    description: "",
    value: 0,
    unit: "",
    source: "",
  });

  // Fetch activity data for the project
  const { data: activityData, refetch: refetchActivityData } = trpc.ipccActivityData.getByProject.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Create activity data mutation
  const createActivityMutation = trpc.ipccActivityData.create.useMutation({
    onSuccess: (data) => {
      console.log("Activity data created successfully:", data);
      setAddActivityDialogOpen(false);
      resetForm();
      refetchActivityData(); // Refresh activity data after creation
    },
    onError: (error) => {
      console.error("Failed to create activity data:", error);
      console.error("Error details:", {
        code: error.data?.code,
        message: error.message,
      });
    },
  });

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

  const resetForm = () => {
    setFormData({
      categoryId: "",
      name: "",
      description: "",
      value: 0,
      unit: "",
      source: "",
    });
    setSelectedCategoryId("");
  };

  const handleAddActivity = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setFormData({ ...formData, categoryId });
    setAddActivityDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const trimmedName = formData.name.trim();
    const trimmedUnit = formData.unit.trim();

    if (!trimmedName || !trimmedUnit || !selectedCategoryId || !projectId) {
      console.error("Validation failed:", {
        name: trimmedName,
        unit: trimmedUnit,
        categoryId: selectedCategoryId,
        projectId: projectId,
      });
      return;
    }

    // Ensure value is a valid number >= 0
    const numericValue = Number(formData.value);
    if (isNaN(numericValue) || numericValue < 0) {
      console.error("Invalid value:", formData.value);
      return;
    }

    // Ensure all data types match the tRPC schema
    const payload = {
      projectId: projectId, // string (should be UUID)
      categoryId: selectedCategoryId, // string (should be UUID)
      name: trimmedName, // string (non-empty)
      description: formData.description.trim() || undefined, // string | undefined
      value: numericValue, // number (>= 0)
      unit: trimmedUnit, // string (non-empty)
      source: formData.source.trim() || undefined, // string | undefined
    };

    console.log("Submitting activity data payload:", payload);
    createActivityMutation.mutate(payload);
  };

  const handleDialogClose = (isOpen: boolean) => {
    setAddActivityDialogOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
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
                                    className="flex items-center justify-between p-2 bg-background rounded border"
                                  >
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
                                    <div className="flex items-center gap-1">
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
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-600">
                                              <Calculator className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Calculate Emissions</p>
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
      <Dialog open={addActivityDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Activity Data</DialogTitle>
              <DialogDescription>
                Add new activity data for the selected emission category.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Activity Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter activity name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value">
                    Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={
                      formData.value === 0 ? "" : formData.value.toString()
                    }
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const numericValue =
                        inputValue === "" ? 0 : parseFloat(inputValue);
                      setFormData({
                        ...formData,
                        value: isNaN(numericValue) ? 0 : numericValue,
                      });
                    }}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="unit">
                    Unit <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="unit"
                    placeholder="e.g., kg, liters, kWh"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  placeholder="Data source (optional)"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                />
              </div>

              {createActivityMutation.error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {createActivityMutation.error.message}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={createActivityMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createActivityMutation.isPending ||
                  !formData.name.trim() ||
                  !formData.unit.trim()
                }
              >
                {createActivityMutation.isPending
                  ? "Adding..."
                  : "Add Activity Data"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
