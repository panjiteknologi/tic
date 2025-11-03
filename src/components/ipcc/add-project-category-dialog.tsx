"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/react";

interface AddProjectCategoryDialogProps {
  projectId: string;
  onCategoryAdded?: () => void;
}

export function AddProjectCategoryDialog({
  projectId,
  onCategoryAdded,
}: AddProjectCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch available categories
  const { data: availableData, isLoading: availableLoading } =
    trpc.ipccProjectCategories.getAvailableCategories.useQuery(
      { projectId },
      { enabled: !!projectId }
    );

  const utils = trpc.useUtils();

  // Assign categories mutation
  const assignCategoriesMutation = trpc.ipccProjectCategories.bulkAssign.useMutation({
    onSuccess: () => {
      setOpen(false);
      setSelectedCategories([]);
      utils.ipccProjectCategories.getAvailableCategories.invalidate({ projectId });
      onCategoryAdded?.();
    },
  });

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAssignCategories = () => {
    if (selectedCategories.length > 0) {
      assignCategoriesMutation.mutate({
        projectId,
        categoryIds: selectedCategories,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedCategories([]);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Emission Categories</DialogTitle>
          <DialogDescription>
            Select emission categories to assign to this project. Categories are grouped by sector.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {availableLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : availableData?.allCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No categories found.</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-4">
              <div className="space-y-6">
                {availableData?.allCategoriesBySector &&
                  Object.entries(availableData.allCategoriesBySector).map(
                    ([sector, categories]) => (
                      <div key={sector} className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {getSectorLabel(sector)}
                          </h4>
                          <Separator className="mt-1" />
                        </div>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <div
                              key={category.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                category.isAssigned
                                  ? "bg-muted/30 border-muted cursor-not-allowed opacity-60"
                                  : selectedCategories.includes(category.id)
                                  ? "bg-primary/10 border-primary cursor-pointer"
                                  : "hover:bg-muted/50 cursor-pointer"
                              }`}
                              onClick={() => !category.isAssigned && handleToggleCategory(category.id)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {category.code}
                                  </Badge>
                                  <span className="font-medium text-sm">
                                    {category.name}
                                  </span>
                                  {category.isAssigned && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                      Already Assigned
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {category.isAssigned ? (
                                  <Check className="h-4 w-4 text-muted-foreground" />
                                ) : selectedCategories.includes(category.id) ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <div className="h-4 w-4 border rounded border-muted-foreground/30" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}
        </div>

        {assignCategoriesMutation.error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {assignCategoriesMutation.error.message}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignCategories}
            disabled={
              selectedCategories.length === 0 ||
              assignCategoriesMutation.isPending
            }
          >
            {assignCategoriesMutation.isPending ? (
              "Assigning..."
            ) : (
              `Assign ${selectedCategories.length} ${
                selectedCategories.length === 1 ? "Category" : "Categories"
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}