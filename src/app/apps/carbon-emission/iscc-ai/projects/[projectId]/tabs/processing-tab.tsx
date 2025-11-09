"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import type { IsccProcessing } from "@/db/schema/iscc-schema";

interface ISCCProcessingTabProps {
  projectId: string;
  processing: IsccProcessing | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ISCCProcessingTab({
  projectId,
  processing,
  onSuccess,
  onError,
}: ISCCProcessingTabProps) {
  const [formData, setFormData] = useState({
    electricityUse: processing?.electricityUse || "",
    steamUse: processing?.steamUse || "",
    naturalGasUse: processing?.naturalGasUse || "",
    dieselUse: processing?.dieselUse || "",
    methanol: processing?.methanol || "",
    catalyst: processing?.catalyst || "",
    acid: processing?.acid || "",
    waterConsumption: processing?.waterConsumption || "",
  });

  useEffect(() => {
    if (processing) {
      setFormData({
        electricityUse: processing.electricityUse || "",
        steamUse: processing.steamUse || "",
        naturalGasUse: processing.naturalGasUse || "",
        dieselUse: processing.dieselUse || "",
        methanol: processing.methanol || "",
        catalyst: processing.catalyst || "",
        acid: processing.acid || "",
        waterConsumption: processing.waterConsumption || "",
      });
    }
  }, [processing]);

  const utils = trpc.useUtils();
  const createMutation = trpc.isccProcessing.create.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      onSuccess("Processing data saved successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to save processing data");
    },
  });

  const updateMutation = trpc.isccProcessing.update.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      onSuccess("Processing data updated successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to update processing data");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) {
      updateMutation.mutate({
        id: processing.id,
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
        <h2 className="text-2xl font-bold mb-2">Processing Data (EP)</h2>
        <p className="text-muted-foreground">
          Enter emissions from processing and manufacturing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="electricityUse">Electricity Use (kWh)</Label>
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
            <Label htmlFor="steamUse">Steam Use (ton)</Label>
            <Input
              id="steamUse"
              type="text"
              value={formData.steamUse}
              onChange={(e) =>
                setFormData({ ...formData, steamUse: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="naturalGasUse">Natural Gas Use (m³)</Label>
            <Input
              id="naturalGasUse"
              type="text"
              value={formData.naturalGasUse}
              onChange={(e) =>
                setFormData({ ...formData, naturalGasUse: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dieselUse">Diesel Use (liter)</Label>
            <Input
              id="dieselUse"
              type="text"
              value={formData.dieselUse}
              onChange={(e) =>
                setFormData({ ...formData, dieselUse: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="methanol">Methanol (kg)</Label>
            <Input
              id="methanol"
              type="text"
              value={formData.methanol}
              onChange={(e) =>
                setFormData({ ...formData, methanol: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catalyst">Catalyst (kg)</Label>
            <Input
              id="catalyst"
              type="text"
              value={formData.catalyst}
              onChange={(e) =>
                setFormData({ ...formData, catalyst: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acid">Acid (kg)</Label>
            <Input
              id="acid"
              type="text"
              value={formData.acid}
              onChange={(e) =>
                setFormData({ ...formData, acid: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waterConsumption">Water Consumption (m³)</Label>
            <Input
              id="waterConsumption"
              type="text"
              value={formData.waterConsumption}
              onChange={(e) =>
                setFormData({ ...formData, waterConsumption: e.target.value })
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
            ) : processing ? (
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

