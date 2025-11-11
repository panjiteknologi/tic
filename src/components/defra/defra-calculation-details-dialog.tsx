'use client';

import { Calculator, Info, Leaf, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatNumber } from '@/lib/utils';

interface DEFRACalculationDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculation: {
    id: string;
    activityDate: Date | string;
    quantity: string;
    unit: string;
    co2Emissions: string;
    ch4Emissions: string;
    n2oEmissions: string;
    totalCo2e: string;
    category: string;
    scope: string | null;
    description: string | null;
    location: string | null;
  };
  details?: {
    explanation?: string;
    reasoning?: string;
    formula?: string;
    emissionFactor?: {
      id: string;
      name: string;
      category: string;
    };
  };
}

export function DEFRACalculationDetailsDialog({
  open,
  onOpenChange,
  calculation,
  details
}: DEFRACalculationDetailsProps) {
  const co2 = parseFloat(calculation.co2Emissions || '0');
  const ch4 = parseFloat(calculation.ch4Emissions || '0');
  const n2o = parseFloat(calculation.n2oEmissions || '0');
  const totalCo2e = parseFloat(calculation.totalCo2e || '0');

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getScopeBadgeColor = (scope: string | null) => {
    switch (scope) {
      case 'Scope 1':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Scope 2':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Scope 3':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            DEFRA Calculation Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of the DEFRA-compliant emission calculation
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
                  <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(co2)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Carbon Dioxide</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CH₄ Emissions</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(ch4)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Methane</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">N₂O Emissions</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(n2o)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Nitrous Oxide</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total CO₂e</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatNumber(totalCo2e)} kg CO₂e
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(totalCo2e / 1000).toFixed(3)} tons CO₂e
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(parseFloat(calculation.quantity))}{' '}
                    {calculation.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity Date</p>
                  <p className="text-lg font-semibold">
                    {formatDate(calculation.activityDate)}
                  </p>
                </div>
              </div>
              {calculation.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-base font-medium">{calculation.location}</p>
                </div>
              )}
              {calculation.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-base">{calculation.description}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">{calculation.category}</Badge>
                </div>
                {calculation.scope && (
                  <div>
                    <p className="text-sm text-muted-foreground">Scope</p>
                    <Badge className={getScopeBadgeColor(calculation.scope)}>
                      {calculation.scope}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Calculation Details */}
          {details && (
            <>
              {details.emissionFactor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Emission Factor Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Activity Name
                      </p>
                      <p className="text-base font-medium">
                        {details.emissionFactor.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-base">{details.emissionFactor.category}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {details.reasoning && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Reasoning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {details.reasoning}
                    </p>
                  </CardContent>
                </Card>
              )}

              {details.formula && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Calculation Formula</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      {details.formula}
                    </div>
                  </CardContent>
                </Card>
              )}

              {details.explanation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Leaf className="h-5 w-5" />
                      Calculation Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {details.explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* GHG Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Greenhouse Gas Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">CO₂ (Carbon Dioxide)</span>
                  </div>
                  <span className="font-semibold">{formatNumber(co2)} kg</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">CH₄ (Methane) × 28 GWP</span>
                  </div>
                  <span className="font-semibold">
                    {formatNumber(ch4)} kg × 28 = {formatNumber(ch4 * 28)} kg
                    CO₂e
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">N₂O (Nitrous Oxide) × 265 GWP</span>
                  </div>
                  <span className="font-semibold">
                    {formatNumber(n2o)} kg × 265 = {formatNumber(n2o * 265)}{' '}
                    kg CO₂e
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-semibold">Total CO₂ Equivalent</span>
                  <span className="text-lg font-bold text-primary">
                    {formatNumber(totalCo2e)} kg CO₂e
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

