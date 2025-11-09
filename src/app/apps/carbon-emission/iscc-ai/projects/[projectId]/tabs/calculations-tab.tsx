"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingDown, TrendingUp } from "lucide-react";
import type { IsccProject, IsccCalculation, IsccCultivation, IsccProcessing, IsccTransport } from "@/db/schema/iscc-schema";

interface ISCCCalculationsTabProps {
  projectId: string;
  project: IsccProject;
  calculations: IsccCalculation[];
  cultivation: IsccCultivation | null;
  processing: IsccProcessing | null;
  transport: IsccTransport | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ISCCCalculationsTab({
  projectId,
  project,
  calculations,
  cultivation,
  processing,
  transport,
  onSuccess,
  onError,
}: ISCCCalculationsTabProps) {
  const utils = trpc.useUtils();
  const calculateMutation = trpc.isccCalculations.calculate.useMutation({
    onSuccess: () => {
      utils.isccProjects.getById.invalidate({ id: projectId });
      utils.isccCalculations.getByProjectId.invalidate({ projectId });
      onSuccess("Calculation completed successfully");
    },
    onError: (error) => {
      onError(error.message || "Failed to calculate emissions");
    },
  });

  const canCalculate =
    project.lhv &&
    cultivation &&
    processing &&
    transport;

  const handleCalculate = () => {
    if (!canCalculate) {
      onError("Please fill in all required data (Project LHV, Cultivation, Processing, and Transport) before calculating");
      return;
    }
    calculateMutation.mutate({ projectId });
  };

  const formatNumber = (value: string | null | undefined, decimals: number = 2) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    if (isNaN(num)) return "N/A";
    return num.toFixed(decimals);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      calculated: "default",
      verified: "secondary",
      approved: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">GHG Calculations</h2>
          <p className="text-muted-foreground">
            View calculation results and trigger new AI-powered calculations
          </p>
        </div>
        <Button
          onClick={handleCalculate}
          disabled={!canCalculate || calculateMutation.isPending}
          size="lg"
        >
          {calculateMutation.isPending ? (
            <>
              <Spinner className="mr-2" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="mr-2" />
              Calculate Emissions
            </>
          )}
        </Button>
      </div>

      {!canCalculate && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              Please complete all required data before calculating:
              {!project.lhv && <span className="ml-1">• Project LHV</span>}
              {!cultivation && <span className="ml-1">• Cultivation Data</span>}
              {!processing && <span className="ml-1">• Processing Data</span>}
              {!transport && <span className="ml-1">• Transport Data</span>}
            </p>
          </CardContent>
        </Card>
      )}

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No calculations yet. Click "Calculate Emissions" to run your first calculation.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {calculations.map((calc) => (
            <Card key={calc.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Calculation Result</CardTitle>
                    <CardDescription>
                      Calculated at: {new Date(calc.calculatedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(calc.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">EEC</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(calc.eec, 4)} <span className="text-sm font-normal">g CO₂eq/MJ</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">EP</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(calc.ep, 4)} <span className="text-sm font-normal">g CO₂eq/MJ</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ETD</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(calc.etd, 4)} <span className="text-sm font-normal">g CO₂eq/MJ</span>
                    </p>
                  </div>
                </div>

                {calc.el && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">EL (Land Use Change)</p>
                    <p className="text-xl font-semibold">
                      {formatNumber(calc.el, 4)} <span className="text-sm font-normal">g CO₂eq/MJ</span>
                    </p>
                  </div>
                )}

                {calc.eccr && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ECCR (Carbon Capture)</p>
                    <p className="text-xl font-semibold">
                      {formatNumber(calc.eccr, 4)} <span className="text-sm font-normal">g CO₂eq/MJ</span>
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Emissions</p>
                      <p className="text-3xl font-bold">
                        {formatNumber(calc.totalEmissions, 4)} <span className="text-lg font-normal">g CO₂eq/MJ</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">GHG Savings</p>
                      <div className="flex items-center gap-2">
                        {calc.ghgSavings && parseFloat(calc.ghgSavings) > 0 ? (
                          <TrendingDown className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-600" />
                        )}
                        <p className="text-2xl font-bold">
                          {formatNumber(calc.ghgSavings, 2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {calc.fossilFuelBaseline && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Baseline (Fossil Fuel): {formatNumber(calc.fossilFuelBaseline, 4)} g CO₂eq/MJ
                    </p>
                  </div>
                )}

                {calc.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{calc.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

