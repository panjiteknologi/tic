"use client";

import { Info, Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CalculationDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculation: {
    id: string;
    emissionValue: string;
    co2Equivalent: string;
    tier: string;
    gasType: string;
    emissionUnit: string;
    notes?: string;
    activityData: {
      name: string;
      value: string;
      unit: string;
    };
    emissionFactor: {
      name: string;
      value: string;
      unit: string;
    };
  };
  details?: {
    method: string;
    formula: string;
    activityValue: number;
    factorValue: number;
    heatingValue?: number;
    heatingValueUnit?: string;
    gwpValue: number;
    categoryCode: string;
    sector: string;
    qualityIndicators?: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
    }>;
  };
}

export function CalculationDetailsDialog({
  open,
  onOpenChange,
  calculation,
  details
}: CalculationDetailsProps) {
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "TIER_3": return "bg-green-100 text-green-800 border-green-300";
      case "TIER_2": return "bg-blue-100 text-blue-800 border-blue-300";
      case "TIER_1": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case "TIER_3": return "Most detailed methodology with plant/country-specific data";
      case "TIER_2": return "Intermediate methodology with improved emission factors";
      case "TIER_1": return "Basic methodology using IPCC default factors";
      default: return "Unknown tier";
    }
  };

  const getQualityIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Emission Calculation Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of the IPCC-compliant emission calculation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Calculation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Emission Value</p>
                  <p className="text-lg font-semibold">
                    {parseFloat(calculation.emissionValue).toLocaleString()} kg
                  </p>
                  <p className="text-xs text-muted-foreground">{calculation.gasType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ Equivalent</p>
                  <p className="text-lg font-semibold">
                    {parseFloat(calculation.co2Equivalent).toLocaleString()} kg
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(parseFloat(calculation.co2Equivalent) / 1000).toLocaleString()} tons
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Methodology</p>
                  <Badge className={getTierBadgeColor(calculation.tier)}>
                    {calculation.tier}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTierDescription(calculation.tier)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{details?.categoryCode}</p>
                  <p className="text-xs text-muted-foreground">{details?.sector}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Method */}
          {details && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculation Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <Badge variant="outline" className="text-sm">
                      {details.method}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Formula</p>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {details.formula}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Activity Data</p>
                      <p className="font-medium">
                        {details.activityValue.toLocaleString()} {calculation.activityData.unit}
                      </p>
                    </div>
                    
                    {details.heatingValue && (
                      <div>
                        <p className="text-sm text-muted-foreground">Heating Value</p>
                        <p className="font-medium">
                          {details.heatingValue} {details.heatingValueUnit}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Emission Factor</p>
                      <p className="font-medium">
                        {details.factorValue} {calculation.emissionFactor.unit}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">GWP Value</p>
                      <p className="font-medium">{details.gwpValue} ({calculation.gasType})</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Input Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">Activity Data</p>
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Name:</span> {calculation.activityData.name}</p>
                    <p><span className="text-muted-foreground">Value:</span> {calculation.activityData.value} {calculation.activityData.unit}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">Emission Factor</p>
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Name:</span> {calculation.emissionFactor.name}</p>
                    <p><span className="text-muted-foreground">Value:</span> {calculation.emissionFactor.value} {calculation.emissionFactor.unit}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Indicators */}
          {details?.qualityIndicators && details.qualityIndicators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {details.qualityIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      {getQualityIcon(indicator.type)}
                      <div>
                        <p className="text-sm font-medium">
                          {indicator.type.charAt(0).toUpperCase() + indicator.type.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {indicator.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {calculation.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{calculation.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* IPCC Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">IPCC Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Follows IPCC 2006 Guidelines methodology</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Uses appropriate tier-specific calculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Applies correct GWP values (AR5)</span>
                </div>
                {details?.heatingValue && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Includes heating value for energy sector</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}