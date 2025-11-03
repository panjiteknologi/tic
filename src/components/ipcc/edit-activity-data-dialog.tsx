"use client";

import React, { useState, useEffect } from "react";
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

// IPCC category-specific units mapping
const CATEGORY_UNIT_MAPPING: { [key: string]: { units: string[]; description: string } } = {
  // Energy Sector (1.A.x)
  "1.A.1": { units: ["ton", "m3", "liter"], description: "Energy Industries - Coal, Natural Gas, Oil" },
  "1.A.2": { units: ["ton", "m3", "liter"], description: "Manufacturing/Construction - Fossil Fuels" },
  "1.A.3.a": { units: ["liter", "m3"], description: "Civil Aviation - Jet Fuel, Avgas" },
  "1.A.3.b": { units: ["liter"], description: "Road Transportation - Gasoline, Diesel" },
  "1.A.3.c": { units: ["liter"], description: "Railways - Diesel" },
  "1.A.3.d": { units: ["liter", "ton"], description: "Water-borne Navigation - Marine Fuels" },
  "1.A.4.a": { units: ["liter", "m3", "kWh"], description: "Commercial/Institutional - Various Fuels, Electricity" },
  "1.A.4.b": { units: ["liter", "m3", "kWh"], description: "Residential - Various Fuels, Electricity" },
  "1.A.4.c": { units: ["liter", "m3"], description: "Agriculture/Forestry/Fishing - Fuels" },
  "1.A.5": { units: ["liter", "m3"], description: "Other - Military, Off-road" },
  
  // Industrial Processes (2.A.x)
  "2.A.1": { units: ["ton"], description: "Cement Production - Limestone, Clinker" },
  "2.A.2": { units: ["ton"], description: "Lime Production - Limestone" },
  "2.A.3": { units: ["ton"], description: "Glass Production - Limestone, Dolomite" },
  "2.A.4": { units: ["ton"], description: "Other Process Uses of Carbonates" },
  "2.B.1": { units: ["ton"], description: "Ammonia Production" },
  "2.B.2": { units: ["ton"], description: "Nitric Acid Production" },
  "2.C.1": { units: ["ton"], description: "Iron and Steel Production" },
  "2.E.1": { units: ["ton"], description: "Integrated Circuit or Semiconductor" },
  "2.F.1": { units: ["kg_charge", "equipment"], description: "Refrigeration and Air Conditioning" },
  "2.G.1": { units: ["equipment"], description: "Electrical Equipment - SF6" },
  
  // Agriculture (3.A.x)
  "3.A.1": { units: ["head"], description: "Enteric Fermentation - Livestock" },
  "3.A.2": { units: ["head"], description: "Manure Management - Livestock" },
  "3.B.1": { units: ["ha"], description: "Forest Land - Area" },
  "3.B.2": { units: ["ha"], description: "Cropland - Area" },
  "3.B.3": { units: ["ha"], description: "Grassland - Area" },
  "3.C.1": { units: ["ha"], description: "Biomass Burning - Forest Fires" },
  "3.C.4": { units: ["ton"], description: "Direct N2O Emissions from Managed Soils" },
  "3.C.5": { units: ["kg_N"], description: "Indirect N2O Emissions from Managed Soils" },
  "3.D.1": { units: ["ton"], description: "Harvested Wood Products" },
  
  // Waste (4.x.x)
  "4.A": { units: ["ton"], description: "Solid Waste Disposal - Municipal Solid Waste" },
  "4.B": { units: ["ton"], description: "Biological Treatment of Solid Waste" },
  "4.C.1": { units: ["ton"], description: "Waste Incineration" },
  "4.D.1": { units: ["kg_BOD"], description: "Domestic Wastewater" },
  "4.D.2": { units: ["kg_BOD"], description: "Industrial Wastewater" },
  
  // Other
  "5.A": { units: ["ton"], description: "Other - Indirect CO2" },
};

// Fallback units for unknown categories
const DEFAULT_UNITS = ["kg", "ton", "liter", "m3", "head", "ha", "kWh", "equipment", "kg_charge", "kg_BOD", "kg_N", "season"];

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

  // Fetch category data to get the category code
  const { data: categoryData } = trpc.ipccEmissionCategories.getById.useQuery(
    { id: categoryId },
    { enabled: !!categoryId }
  );

  // Get available units based on category code
  const getAvailableUnits = (): string[] => {
    if (!categoryData?.category?.code) {
      return DEFAULT_UNITS;
    }
    
    const categoryCode = categoryData.category.code;
    const mapping = CATEGORY_UNIT_MAPPING[categoryCode];
    
    if (mapping) {
      return mapping.units;
    }
    
    // Try partial matching for subcategories (e.g., "1.A.1.a" matches "1.A.1")
    const baseCode = categoryCode.split('.').slice(0, 3).join('.');
    const baseMapping = CATEGORY_UNIT_MAPPING[baseCode];
    
    if (baseMapping) {
      return baseMapping.units;
    }
    
    return DEFAULT_UNITS;
  };

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
      // Note: recalculationResult property may not exist in current response structure
      // if ((data as any).recalculationResult) {
      //   console.log("Emission recalculated automatically:", (data as any).recalculationResult);
      // }
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

  // Reset unit when category changes to avoid invalid unit selection
  React.useEffect(() => {
    if (categoryData?.category?.code) {
      const availableUnits = getAvailableUnits();
      if (formData.unit && !availableUnits.includes(formData.unit)) {
        setFormData(prev => ({ ...prev, unit: "" }));
      }
    }
  }, [categoryData?.category?.code]);

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
                    {getAvailableUnits().map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoryData?.category?.code && CATEGORY_UNIT_MAPPING[categoryData.category.code] && (
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_UNIT_MAPPING[categoryData.category.code].description}
                  </p>
                )}
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