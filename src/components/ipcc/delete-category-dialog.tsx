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
  onCategoryDeleted,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete category mutation
  const deleteCategoryMutation = trpc.ipccProjectCategories.removeCategory.useMutation({
    onSuccess: () => {
      setIsDeleting(false);
      onOpenChange(false);
      onCategoryDeleted?.();
    },
    onError: () => {
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!projectId || !categoryId) return;
    
    setIsDeleting(true);
    deleteCategoryMutation.mutate({ 
      projectId, 
      categoryId 
    });
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
            Remove Category from Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will remove the category from this project
            {hasActivities && " and delete all associated activity data and emission calculations"}.
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
              {hasActivities && (
                <div className="text-sm text-destructive">
                  <span className="font-medium">⚠️ Warning:</span> This will also delete {activityCount} activity {activityCount === 1 ? 'entry' : 'entries'} and all emission calculations.
                </div>
              )}
            </div>
          </div>

          {deleteCategoryMutation.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {deleteCategoryMutation.error.message}
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
              "Removing..."
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Remove Category
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}