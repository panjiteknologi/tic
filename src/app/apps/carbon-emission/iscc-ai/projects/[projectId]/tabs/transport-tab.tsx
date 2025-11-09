"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import type { IsccTransport } from "@/db/schema/iscc-schema";

interface ISCCTransportTabProps {
  projectId: string;
  transport: IsccTransport | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ISCCTransportTab({
  projectId,
  transport,
  onSuccess,
  onError,
}: ISCCTransportTabProps) {
  const [formData, setFormData] = useState({
    feedstockDistance: transport?.feedstockDistance || "",
    feedstockMode: transport?.feedstockMode || "",
    feedstockWeight: transport?.feedstockWeight || "",
    productDistance: transport?.productDistance || "",
    productMode: transport?.productMode || "",
    productWeight: transport?.productWeight || "",
  });

  useEffect(() => {
    if (transport) {
      setFormData({
        feedstockDistance: transport.feedstockDistance || "",
        feedstockMode: transport.feedstockMode || "",
        feedstockWeight: transport.feedstockWeight || "",
        productDistance: transport.productDistance || "",
        productMode: transport.productMode || "",
        productWeight: transport.productWeight || "",
      });
    }
  }, [transport]);

  const utils = trpc.useUtils();
  const createMutation = trpc.isccTransport.create.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      onSuccess("Transport data saved successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to save transport data");
    },
  });

  const updateMutation = trpc.isccTransport.update.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      onSuccess("Transport data updated successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to update transport data");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transport) {
      updateMutation.mutate({
        id: transport.id,
        ...formData,
        feedstockMode: formData.feedstockMode || null,
        productMode: formData.productMode || null,
      });
    } else {
      createMutation.mutate({
        projectId,
        ...formData,
        feedstockMode: formData.feedstockMode || null,
        productMode: formData.productMode || null,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transport Data (ETD)</h2>
        <p className="text-muted-foreground">
          Enter emissions from transport and distribution
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Feedstock Transport</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="feedstockDistance">Distance (km)</Label>
              <Input
                id="feedstockDistance"
                type="text"
                value={formData.feedstockDistance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    feedstockDistance: e.target.value,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedstockMode">Transport Mode</Label>
              <Select
                value={formData.feedstockMode}
                onValueChange={(value) =>
                  setFormData({ ...formData, feedstockMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedstockWeight">Weight (ton)</Label>
              <Input
                id="feedstockWeight"
                type="text"
                value={formData.feedstockWeight}
                onChange={(e) =>
                  setFormData({ ...formData, feedstockWeight: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Product Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="productDistance">Distance (km)</Label>
              <Input
                id="productDistance"
                type="text"
                value={formData.productDistance}
                onChange={(e) =>
                  setFormData({ ...formData, productDistance: e.target.value })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productMode">Transport Mode</Label>
              <Select
                value={formData.productMode}
                onValueChange={(value) =>
                  setFormData({ ...formData, productMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productWeight">Weight (ton)</Label>
              <Input
                id="productWeight"
                type="text"
                value={formData.productWeight}
                onChange={(e) =>
                  setFormData({ ...formData, productWeight: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : transport ? (
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

