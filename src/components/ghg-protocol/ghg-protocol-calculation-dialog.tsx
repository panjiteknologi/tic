'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { trpc } from '@/trpc/react';

type GHGProtocolCalculationFormData = {
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  category: string;
  quantity: string;
  unit: string;
  activityName: string;
  description: string;
  gasType: 'CO2' | 'CH4' | 'N2O' | 'HFCs' | 'PFCs' | 'SF6' | 'NF3' | '';
  calculationMethod: 'tier1' | 'tier2' | 'tier3' | 'custom' | '';
  emissionFactorValue: string;
  emissionFactorUnit: string;
  emissionFactorSource: string;
  notes: string;
  evidence: string;
};

interface GHGProtocolCalculationDialogProps {
  projectId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function GHGProtocolCalculationDialog({
  projectId,
  open,
  setOpen,
  onSuccess,
  onError
}: GHGProtocolCalculationDialogProps) {
  const [formData, setFormData] = useState<GHGProtocolCalculationFormData>({
    scope: 'Scope1',
    category: '',
    quantity: '',
    unit: '',
    activityName: '',
    description: '',
    gasType: '',
    calculationMethod: '',
    emissionFactorValue: '',
    emissionFactorUnit: '',
    emissionFactorSource: '',
    notes: '',
    evidence: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomEmissionFactor, setUseCustomEmissionFactor] = useState(false);
  const utils = trpc.useUtils();

  const createMutation = trpc.ghgProtocolCalculations.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setOpen(false);
      resetForm();
      utils.ghgProtocolCalculations.getByProjectId.invalidate({ projectId });
      utils.ghgProtocolProjects.getById.invalidate({ id: projectId });
      onSuccess();
    },
    onError: (error: { message: string }) => {
      setIsSubmitting(false);
      onError(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      scope: 'Scope1',
      category: '',
      quantity: '',
      unit: '',
      activityName: '',
      description: '',
      gasType: '',
      calculationMethod: '',
      emissionFactorValue: '',
      emissionFactorUnit: '',
      emissionFactorSource: '',
      notes: '',
      evidence: ''
    });
    setUseCustomEmissionFactor(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || !formData.unit || !formData.category) {
      onError('Quantity, unit, and category are required');
      return;
    }

    const quantityNum = parseFloat(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      onError('Quantity must be a positive number');
      return;
    }

    setIsSubmitting(true);

    const activityData = {
      quantity: quantityNum,
      unit: formData.unit.trim(),
      description: formData.description || undefined,
      activityName: formData.activityName || undefined
    };

    const emissionFactor = useCustomEmissionFactor && formData.emissionFactorValue
      ? {
          value: parseFloat(formData.emissionFactorValue),
          unit: formData.emissionFactorUnit || 'kg CO2/unit',
          source: formData.emissionFactorSource || 'Custom',
          gasType: formData.gasType || undefined
        }
      : undefined;

    createMutation.mutate({
      projectId,
      scope: formData.scope,
      category: formData.category.trim(),
      activityData,
      emissionFactor,
      gasType: formData.gasType || undefined,
      calculationMethod: formData.calculationMethod || undefined,
      notes: formData.notes || null,
      evidence: formData.evidence || null,
      status: 'calculated'
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Calculation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              New GHG Protocol Calculation
            </DialogTitle>
            <DialogDescription>
              Create a new GHG emission calculation. AI will automatically select the best emission factor if not provided.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scope">
                  Scope <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value: 'Scope1' | 'Scope2' | 'Scope3') =>
                    setFormData({ ...formData, scope: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scope1">Scope 1 - Direct Emissions</SelectItem>
                    <SelectItem value="Scope2">Scope 2 - Indirect (Energy)</SelectItem>
                    <SelectItem value="Scope3">Scope 3 - Other Indirect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="category"
                  placeholder="e.g., Stationary Combustion, Purchased Electricity"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activityName">Activity Name</Label>
              <Input
                id="activityName"
                placeholder="e.g., Natural gas consumption, Company vehicle travel"
                value={formData.activityName}
                onChange={(e) =>
                  setFormData({ ...formData, activityName: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Describe the activity to help AI select the right emission factor
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  placeholder="kWh, m³, km, kg, litres"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  e.g., kWh, m³, km, kg, litres
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gasType">Gas Type (Optional)</Label>
                <Select
                  value={formData.gasType || 'auto'}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, gasType: value === 'auto' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect (AI will choose)</SelectItem>
                    <SelectItem value="CO2">CO₂</SelectItem>
                    <SelectItem value="CH4">CH₄</SelectItem>
                    <SelectItem value="N2O">N₂O</SelectItem>
                    <SelectItem value="HFCs">HFCs</SelectItem>
                    <SelectItem value="PFCs">PFCs</SelectItem>
                    <SelectItem value="SF6">SF₆</SelectItem>
                    <SelectItem value="NF3">NF₃</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="calculationMethod">Calculation Method</Label>
                <Select
                  value={formData.calculationMethod || 'default'}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, calculationMethod: value === 'default' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="tier1">Tier 1 - Default factors</SelectItem>
                    <SelectItem value="tier2">Tier 2 - Country-specific</SelectItem>
                    <SelectItem value="tier3">Tier 3 - Site-specific</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCustomFactor"
                checked={useCustomEmissionFactor}
                onChange={(e) => setUseCustomEmissionFactor(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useCustomFactor" className="cursor-pointer">
                Use custom emission factor (otherwise AI will select)
              </Label>
            </div>

            {useCustomEmissionFactor && (
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid gap-2">
                  <Label htmlFor="emissionFactorValue">Factor Value</Label>
                  <Input
                    id="emissionFactorValue"
                    type="number"
                    step="any"
                    placeholder="2.0"
                    value={formData.emissionFactorValue}
                    onChange={(e) =>
                      setFormData({ ...formData, emissionFactorValue: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emissionFactorUnit">Factor Unit</Label>
                  <Input
                    id="emissionFactorUnit"
                    placeholder="kg CO2/kWh"
                    value={formData.emissionFactorUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, emissionFactorUnit: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emissionFactorSource">Source</Label>
                  <Input
                    id="emissionFactorSource"
                    placeholder="GHG Protocol, IPCC, DEFRA"
                    value={formData.emissionFactorSource}
                    onChange={(e) =>
                      setFormData({ ...formData, emissionFactorSource: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional notes about this calculation"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Calculation notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="evidence">Evidence (Optional)</Label>
                <Input
                  id="evidence"
                  placeholder="URL or path to supporting document"
                  value={formData.evidence}
                  onChange={(e) =>
                    setFormData({ ...formData, evidence: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                createMutation.isPending ||
                !formData.quantity ||
                !formData.unit ||
                !formData.category
              }
            >
              {isSubmitting || createMutation.isPending
                ? 'Calculating...'
                : 'Calculate & Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

