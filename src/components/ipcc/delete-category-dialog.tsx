"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/trpc/react";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  sector: string;
  hasActivities: boolean;
  activityCount?: number;
  activityId?: string;
  activityName?: string;
  onCategoryDeleted?: () => void;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  projectId,
  categoryId,
  categoryCode,
  categoryName,
  sector,
  hasActivities,
  activityCount = 0,
  activityId,
  activityName,
  onCategoryDeleted,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete category mutation
  const deleteCategoryMutation = trpc.ipccProjectCategories.removeCategory.useMutation({
    onSuccess: () => {
      console.log("Category deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      setIsDeleting(false);
    },
  });

  // Delete activity mutation (for parallel deletion)
  const deleteActivityMutation = trpc.ipccActivityData.delete.useMutation({
    onSuccess: () => {
      console.log("Activity deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete activity:", error);
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!projectId || !categoryId) return;
    
    setIsDeleting(true);

    try {
      if (hasActivities && activityId) {
        // Case 1: Delete both activity and category in parallel
        console.log("Deleting activity and category in parallel...");
        
        await Promise.all([
          new Promise((resolve, reject) => {
            deleteActivityMutation.mutate(
              { id: activityId },
              {
                onSuccess: resolve,
                onError: reject
              }
            );
          }),
          new Promise((resolve, reject) => {
            deleteCategoryMutation.mutate(
              { projectId, categoryId },
              {
                onSuccess: resolve,
                onError: reject
              }
            );
          })
        ]);
        
        console.log("Both activity and category deleted successfully");
      } else {
        // Case 2: Delete category only
        console.log("Deleting category only...");
        
        await new Promise((resolve, reject) => {
          deleteCategoryMutation.mutate(
            { projectId, categoryId },
            {
              onSuccess: resolve,
              onError: reject
            }
          );
        });
        
        console.log("Category deleted successfully");
      }

      // Success - close dialog and trigger refresh
      setIsDeleting(false);
      onOpenChange(false);
      onCategoryDeleted?.();
      
    } catch (error) {
      console.error("Delete operation failed:", error);
      setIsDeleting(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {hasActivities && activityId 
              ? "Delete Activity & Remove Category" 
              : "Remove Category from Project"}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. 
            {hasActivities && activityId 
              ? " This will delete the activity data and remove the category from this project, including all emission calculations."
              : " This will remove the category from this project"
            }
            {hasActivities && !activityId && " and delete all associated activity data and emission calculations"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Sector:</span> {getSectorLabel(sector)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryCode}
                </Badge>
                <span className="font-medium">{categoryName}</span>
              </div>
              
              {hasActivities && activityId && activityName && (
                <div className="pt-2 border-t">
                  <div className="text-sm">
                    <span className="font-medium">Activity to delete:</span> {activityName}
                  </div>
                  <div className="text-sm text-destructive mt-1">
                    <span className="font-medium">⚠️ Warning:</span> This will delete the activity data and all its emission calculations.
                  </div>
                </div>
              )}
              
              {hasActivities && !activityId && (
                <div className="text-sm text-destructive">
                  <span className="font-medium">⚠️ Warning:</span> This will also delete {activityCount} activity {activityCount === 1 ? 'entry' : 'entries'} and all emission calculations.
                </div>
              )}
            </div>
          </div>

          {(deleteCategoryMutation.error || deleteActivityMutation.error) && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {deleteCategoryMutation.error?.message || deleteActivityMutation.error?.message}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              hasActivities && activityId ? "Deleting..." : "Removing..."
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {hasActivities && activityId ? "Delete Activity & Category" : "Remove Category"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}