"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import type { IsccProject } from "@/db/schema/iscc-schema";

interface ISCCProjectInfoTabProps {
  project: IsccProject;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ISCCProjectInfoTab({
  project,
  onSuccess,
  onError,
}: ISCCProjectInfoTabProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    productType: project.productType,
    feedstockType: project.feedstockType,
    productionVolume: project.productionVolume || "",
    lhv: project.lhv || "",
    lhvUnit: project.lhvUnit || "MJ/kg",
  });

  const utils = trpc.useUtils();
  const updateMutation = trpc.isccProjects.update.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: project.id });
      onSuccess("Project information updated successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to update project");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: project.id,
      name: formData.name,
      description: formData.description || null,
      productType: formData.productType,
      feedstockType: formData.feedstockType,
      productionVolume: formData.productionVolume || null,
      lhv: formData.lhv || null,
      lhvUnit: formData.lhvUnit,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Information</h2>
        <p className="text-muted-foreground">
          Update basic project information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productType">Product Type *</Label>
            <Select
              value={formData.productType}
              onValueChange={(value) =>
                setFormData({ ...formData, productType: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="biodiesel">Biodiesel</SelectItem>
                <SelectItem value="bioethanol">Bioethanol</SelectItem>
                <SelectItem value="biomass">Biomass</SelectItem>
                <SelectItem value="biomethane">Biomethane</SelectItem>
                <SelectItem value="bio_jet_fuel">Bio Jet Fuel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedstockType">Feedstock Type *</Label>
            <Select
              value={formData.feedstockType}
              onValueChange={(value) =>
                setFormData({ ...formData, feedstockType: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="palm_oil">Palm Oil</SelectItem>
                <SelectItem value="corn">Corn</SelectItem>
                <SelectItem value="sugarcane">Sugarcane</SelectItem>
                <SelectItem value="used_cooking_oil">Used Cooking Oil</SelectItem>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="rapeseed">Rapeseed</SelectItem>
                <SelectItem value="soybean">Soybean</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionVolume">Production Volume (ton/year)</Label>
            <Input
              id="productionVolume"
              type="text"
              value={formData.productionVolume}
              onChange={(e) =>
                setFormData({ ...formData, productionVolume: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lhv">Lower Heating Value (LHV) *</Label>
            <Input
              id="lhv"
              type="text"
              value={formData.lhv}
              onChange={(e) =>
                setFormData({ ...formData, lhv: e.target.value })
              }
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lhvUnit">LHV Unit</Label>
            <Select
              value={formData.lhvUnit}
              onValueChange={(value) =>
                setFormData({ ...formData, lhvUnit: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MJ/kg">MJ/kg</SelectItem>
                <SelectItem value="MJ/liter">MJ/liter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            placeholder="Enter project description..."
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

