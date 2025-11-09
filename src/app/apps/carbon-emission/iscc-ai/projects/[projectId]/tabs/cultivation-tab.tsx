"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import type { IsccCultivation } from "@/db/schema/iscc-schema";

interface ISCCCultivationTabProps {
  projectId: string;
  cultivation: IsccCultivation | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ISCCCultivationTab({
  projectId,
  cultivation,
  onSuccess,
  onError,
}: ISCCCultivationTabProps) {
  const [formData, setFormData] = useState({
    landArea: cultivation?.landArea || "",
    yield: cultivation?.yield || "",
    nitrogenFertilizer: cultivation?.nitrogenFertilizer || "",
    phosphateFertilizer: cultivation?.phosphateFertilizer || "",
    potassiumFertilizer: cultivation?.potassiumFertilizer || "",
    organicFertilizer: cultivation?.organicFertilizer || "",
    dieselConsumption: cultivation?.dieselConsumption || "",
    electricityUse: cultivation?.electricityUse || "",
    pesticides: cultivation?.pesticides || "",
  });

  useEffect(() => {
    if (cultivation) {
      setFormData({
        landArea: cultivation.landArea || "",
        yield: cultivation.yield || "",
        nitrogenFertilizer: cultivation.nitrogenFertilizer || "",
        phosphateFertilizer: cultivation.phosphateFertilizer || "",
        potassiumFertilizer: cultivation.potassiumFertilizer || "",
        organicFertilizer: cultivation.organicFertilizer || "",
        dieselConsumption: cultivation.dieselConsumption || "",
        electricityUse: cultivation.electricityUse || "",
        pesticides: cultivation.pesticides || "",
      });
    }
  }, [cultivation]);

  const utils = trpc.useUtils();
  const createMutation = trpc.isccCultivation.create.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      onSuccess("Cultivation data saved successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to save cultivation data");
    },
  });

  const updateMutation = trpc.isccCultivation.update.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      onSuccess("Cultivation data updated successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to update cultivation data");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cultivation) {
      updateMutation.mutate({
        id: cultivation.id,
        ...formData,
      });
    } else {
      createMutation.mutate({
        projectId,
        ...formData,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Cultivation Data (EEC)</h2>
        <p className="text-muted-foreground">
          Enter emissions from extraction/cultivation of raw materials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="landArea">Land Area (hectare)</Label>
            <Input
              id="landArea"
              type="text"
              value={formData.landArea}
              onChange={(e) =>
                setFormData({ ...formData, landArea: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield">Yield (ton/ha)</Label>
            <Input
              id="yield"
              type="text"
              value={formData.yield}
              onChange={(e) =>
                setFormData({ ...formData, yield: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nitrogenFertilizer">Nitrogen Fertilizer (kg/ha)</Label>
            <Input
              id="nitrogenFertilizer"
              type="text"
              value={formData.nitrogenFertilizer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nitrogenFertilizer: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phosphateFertilizer">Phosphate Fertilizer (kg/ha)</Label>
            <Input
              id="phosphateFertilizer"
              type="text"
              value={formData.phosphateFertilizer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phosphateFertilizer: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="potassiumFertilizer">Potassium Fertilizer (kg/ha)</Label>
            <Input
              id="potassiumFertilizer"
              type="text"
              value={formData.potassiumFertilizer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  potassiumFertilizer: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organicFertilizer">Organic Fertilizer (kg/ha)</Label>
            <Input
              id="organicFertilizer"
              type="text"
              value={formData.organicFertilizer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organicFertilizer: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dieselConsumption">Diesel Consumption (liter/ha)</Label>
            <Input
              id="dieselConsumption"
              type="text"
              value={formData.dieselConsumption}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dieselConsumption: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricityUse">Electricity Use (kWh/ha)</Label>
            <Input
              id="electricityUse"
              type="text"
              value={formData.electricityUse}
              onChange={(e) =>
                setFormData({ ...formData, electricityUse: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pesticides">Pesticides (kg/ha)</Label>
            <Input
              id="pesticides"
              type="text"
              value={formData.pesticides}
              onChange={(e) =>
                setFormData({ ...formData, pesticides: e.target.value })
              }
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : cultivation ? (
              "Update Data"
            ) : (
              "Save Data"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

