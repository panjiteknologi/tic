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
import { trpc } from '@/trpc/react';

type DEFRACalculationFormData = {
  activityDate: Date;
  quantity: string;
  unit: string;
  description: string;
  location: string;
  category: string;
  activityName: string;
};

interface DEFRACalculationDialogProps {
  projectId: string;
  defraYear: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function DEFRACalculationDialog({
  projectId,
  defraYear,
  open,
  setOpen,
  onSuccess,
  onError
}: DEFRACalculationDialogProps) {
  const [formData, setFormData] = useState<DEFRACalculationFormData>({
    activityDate: new Date(),
    quantity: '',
    unit: '',
    description: '',
    location: '',
    category: '',
    activityName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  const createMutation = trpc.defraCarbonCalculations.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setOpen(false);
      resetForm();
      utils.defraCarbonCalculations.getByProjectId.invalidate({ projectId });
      utils.defraProjects.getById.invalidate({ id: projectId });
      onSuccess();
    },
    onError: (error: { message: string }) => {
      setIsSubmitting(false);
      onError(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      activityDate: new Date(),
      quantity: '',
      unit: '',
      description: '',
      location: '',
      category: '',
      activityName: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || !formData.unit) {
      onError('Quantity and unit are required');
      return;
    }

    const quantityNum = parseFloat(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      onError('Quantity must be a positive number');
      return;
    }

    setIsSubmitting(true);

    createMutation.mutate({
      projectId,
      activityDate: formData.activityDate,
      quantity: quantityNum,
      unit: formData.unit.trim(),
      description: formData.description || null,
      location: formData.location || null,
      category: formData.category || undefined,
      activityName: formData.activityName || undefined
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              New DEFRA Calculation
            </DialogTitle>
            <DialogDescription>
              Create a new carbon emission calculation using DEFRA {defraYear}{' '}
              factors. AI will automatically select the best emission factor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activityName">
                Activity Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="activityName"
                placeholder="e.g., Petrol car journey, Natural gas consumption"
                value={formData.activityName}
                onChange={(e) =>
                  setFormData({ ...formData, activityName: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Describe the activity (e.g., &quot;Petrol car - medium&quot;)
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
                  placeholder="km, kWh, litres, kg"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  e.g., km, kWh, litres, kg
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Fuels, Business travel, Material use"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Help AI select the right factor (e.g., Fuels, Business travel)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activityDate">Activity Date</Label>
              <Input
                id="activityDate"
                type="date"
                value={
                  formData.activityDate instanceof Date
                    ? formData.activityDate.toISOString().split('T')[0]
                    : formData.activityDate
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activityDate: new Date(e.target.value)
                  })
                }
              />
            </div>

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

            <div className="grid gap-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="Where did this activity occur?"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
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
                !formData.activityName
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

