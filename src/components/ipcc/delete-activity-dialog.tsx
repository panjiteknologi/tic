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

interface DeleteActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  activityName: string;
  categoryCode: string;
  categoryName: string;
  onActivityDeleted?: () => void;
}

export function DeleteActivityDialog({
  open,
  onOpenChange,
  activityId,
  activityName,
  categoryCode,
  categoryName,
  onActivityDeleted,
}: DeleteActivityDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete activity mutation
  const deleteActivityMutation = trpc.ipccActivityData.delete.useMutation({
    onSuccess: () => {
      setIsDeleting(false);
      onOpenChange(false);
      onActivityDeleted?.();
    },
    onError: () => {
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!activityId) return;
    
    setIsDeleting(true);
    deleteActivityMutation.mutate({ id: activityId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Activity Data
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the activity data
            and all associated emission calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryCode}
                </Badge>
                <span className="text-sm font-medium">{categoryName}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Activity:</span> {activityName}
              </div>
            </div>
          </div>

          {deleteActivityMutation.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {deleteActivityMutation.error.message}
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
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Activity
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}