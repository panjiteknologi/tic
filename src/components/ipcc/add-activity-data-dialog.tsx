"use client";

import { useState } from "react";
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

interface ActivityDataFormData {
  categoryId: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  source: string;
}

interface AddActivityDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  categoryId: string;
  onActivityAdded: () => void;
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

export function AddActivityDataDialog({
  open,
  onOpenChange,
  projectId,
  categoryId,
  onActivityAdded,
}: AddActivityDataDialogProps) {
  const [formData, setFormData] = useState<ActivityDataFormData>({
    categoryId: categoryId,
    name: "",
    description: "",
    value: 0,
    unit: "",
    source: "",
  });

  // Create activity data mutation
  const createActivityMutation = trpc.ipccActivityData.create.useMutation({
    onSuccess: (data) => {
      console.log("Activity data created successfully:", data);
      onOpenChange(false);
      resetForm();
      onActivityAdded();
    },
    onError: (error) => {
      console.error("Failed to create activity data:", error);
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

    if (!trimmedName || !trimmedUnit || !categoryId || !projectId) {
      console.error("Validation failed:", {
        name: trimmedName,
        unit: trimmedUnit,
        categoryId: categoryId,
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
      categoryId: categoryId, // string (should be UUID)
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
  );
}