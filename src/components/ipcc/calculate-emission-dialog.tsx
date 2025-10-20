"use client";

import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/react";

interface CalculationDialogData {
  activityDataId: string;
  activityName: string;
  notes?: string;
}

interface CalculateEmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityDataId: string;
  activityName: string;
  onEmissionCalculated: () => void;
}

export function CalculateEmissionDialog({
  open,
  onOpenChange,
  activityDataId,
  activityName,
  onEmissionCalculated,
}: CalculateEmissionDialogProps) {
  const [calculationData, setCalculationData] = useState<CalculationDialogData>({
    activityDataId: activityDataId,
    activityName: activityName,
    notes: "",
  });

  // Calculate emission mutation
  const calculateEmissionMutation = trpc.ipccEmissionCalculations.calculate.useMutation({
    onSuccess: (data) => {
      console.log("Emission calculated successfully:", data);
      onOpenChange(false);
      resetCalculationForm();
      onEmissionCalculated();
    },
    onError: (error) => {
      console.error("Failed to calculate emission:", error);
    },
  });

  const resetCalculationForm = () => {
    setCalculationData({
      activityDataId: activityDataId,
      activityName: activityName,
      notes: "",
    });
  };

  const handleCalculationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculationData.activityDataId) {
      console.error("Activity data ID is required");
      return;
    }

    calculateEmissionMutation.mutate({
      activityDataId: calculationData.activityDataId,
      notes: calculationData.notes || undefined,
    });
  };

  const handleCalculationDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetCalculationForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCalculationDialogClose}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleCalculationSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Calculate Emissions
            </DialogTitle>
            <DialogDescription>
              Calculate CO2 equivalent emissions for: <strong>{activityName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="calculation-notes">Notes (Optional)</Label>
              <Textarea
                id="calculation-notes"
                placeholder="Add calculation notes or comments"
                value={calculationData.notes}
                onChange={(e) =>
                  setCalculationData({ ...calculationData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border">
              <p className="font-medium mb-1">Calculation Process:</p>
              <ul className="text-xs space-y-1">
                <li>• Auto-select best emission factor</li>
                <li>• Apply GWP values for gas conversion</li>
                <li>• Formula: Activity × Factor × GWP = CO2-eq</li>
              </ul>
            </div>

            {calculateEmissionMutation.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {calculateEmissionMutation.error.message}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCalculationDialogClose(false)}
              disabled={calculateEmissionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={calculateEmissionMutation.isPending || !calculationData.activityDataId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {calculateEmissionMutation.isPending ? (
                <>
                  <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Emissions
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}