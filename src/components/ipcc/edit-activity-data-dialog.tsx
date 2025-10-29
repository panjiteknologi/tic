"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";

interface EditActivityDataFormData {
  categoryId: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  source: string;
}

interface EditActivityDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  activityId: string;
  activityName: string;
  activityValue: string;
  activityUnit: string;
  activityDescription: string;
  activitySource: string;
  categoryId: string;
  onActivityUpdated: () => void;
}

// Common base units extracted from emission factors
const BASE_UNITS = [
  "head", // for livestock
  "liter", // for fuels
  "kg", // for general mass
  "ton", // for large mass
  "m3", // for gases/volume
  "ha", // for land area
  "kWh", // for energy
  "equipment", // for SF6 equipment
  "kg_charge", // for refrigerants
  "kg_BOD", // for wastewater
  "kg_N", // for nitrogen
  "season", // for seasonal activities
];

export function EditActivityDataDialog({
  open,
  onOpenChange,
  projectId,
  activityId,
  activityName,
  activityValue,
  activityUnit,
  activityDescription,
  activitySource,
  categoryId,
  onActivityUpdated,
}: EditActivityDataDialogProps) {
  const [formData, setFormData] = useState<EditActivityDataFormData>({
    categoryId: categoryId,
    name: "",
    description: "",
    value: 0,
    unit: "",
    source: "",
  });

  // Update form data when dialog opens with new activity data
  useEffect(() => {
    if (open && activityId) {
      setFormData({
        categoryId: categoryId,
        name: activityName,
        description: activityDescription,
        value: parseFloat(activityValue) || 0,
        unit: activityUnit,
        source: activitySource,
      });
    }
  }, [open, activityId, activityName, activityValue, activityUnit, activityDescription, activitySource, categoryId]);

  // Update activity data mutation
  const updateActivityMutation = trpc.ipccActivityData.update.useMutation({
    onSuccess: (data) => {
      console.log("Activity data updated successfully:", data);
      if (data.recalculationResult) {
        console.log("Emission recalculated automatically:", data.recalculationResult);
      }
      onOpenChange(false);
      resetForm();
      onActivityUpdated();
    },
    onError: (error) => {
      console.error("Failed to update activity data:", error);
      console.error("Error details:", {
        code: error.data?.code,
        message: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      categoryId: categoryId,
      name: "",
      description: "",
      value: 0,
      unit: "",
      source: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const trimmedName = formData.name.trim();
    const trimmedUnit = formData.unit.trim();

    if (!trimmedName || !trimmedUnit || !activityId) {
      console.error("Validation failed:", {
        name: trimmedName,
        unit: trimmedUnit,
        activityId: activityId,
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
      id: activityId, // string (should be UUID)
      categoryId: categoryId, // string (should be UUID)
      name: trimmedName, // string (non-empty)
      description: formData.description.trim() || undefined, // string | undefined
      value: numericValue, // number (>= 0)
      unit: trimmedUnit, // string (non-empty)
      source: formData.source.trim() || undefined, // string | undefined
    };

    console.log("Updating activity data payload:", payload);
    updateActivityMutation.mutate(payload);
  };

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Activity Data</DialogTitle>
            <DialogDescription>
              Update activity data for the selected emission category. Emissions will be recalculated automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Activity Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Enter activity name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
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
                <Label htmlFor="edit-value">
                  Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-value"
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
                <Label htmlFor="edit-unit">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-source">Source</Label>
              <Input
                id="edit-source"
                placeholder="Data source (optional)"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              />
            </div>

            {updateActivityMutation.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {updateActivityMutation.error.message}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={updateActivityMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateActivityMutation.isPending ||
                !formData.name.trim() ||
                !formData.unit.trim()
              }
            >
              {updateActivityMutation.isPending
                ? "Updating & Recalculating..."
                : "Update Activity Data"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}