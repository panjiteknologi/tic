'use client';

import { useState } from 'react';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '@/trpc/routers/_app';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye,
  Trash2,
  FileText
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { trpc } from '@/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

type GHGProtocolCalculation =
  inferRouterOutputs<AppRouter>['ghgProtocolCalculations']['getByProjectId']['calculations'][number];

interface GHGProtocolCalculationsTableProps {
  projectId: string;
  calculations: GHGProtocolCalculation[];
  onCalculationDeleted: () => void;
}

export function GHGProtocolCalculationsTable({
  projectId,
  calculations,
  onCalculationDeleted
}: GHGProtocolCalculationsTableProps) {
  const [selectedCalculation, setSelectedCalculation] =
    useState<GHGProtocolCalculation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] =
    useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const utils = trpc.useUtils();

  const deleteMutation = trpc.ghgProtocolCalculations.delete.useMutation({
    onSuccess: () => {
      utils.ghgProtocolCalculations.getByProjectId.invalidate({ projectId });
      utils.ghgProtocolProjects.getById.invalidate({ id: projectId });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCalculationToDelete(null);
      onCalculationDeleted();
    },
    onError: () => {
      setIsDeleting(false);
    }
  });

  const handleViewDetails = (calculation: GHGProtocolCalculation) => {
    setSelectedCalculation(calculation);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCalculationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (calculationToDelete) {
      setIsDeleting(true);
      deleteMutation.mutate({ id: calculationToDelete });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getScopeBadgeColor = (scope: string) => {
    switch (scope) {
      case 'Scope1':
        return 'bg-red-100 text-red-800';
      case 'Scope2':
        return 'bg-blue-100 text-blue-800';
      case 'Scope3':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'calculated':
        return 'default';
      case 'verified':
        return 'default';
      case 'approved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carbon Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No calculations found. Add your first calculation to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Carbon Calculations ({calculations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Gas Type</TableHead>
                  <TableHead className="text-right">CO₂e</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => {
                  const activityData = calc.activityData as any;
                  const emissionFactor = calc.emissionFactor as any;
                  const co2e = parseFloat(calc.co2Equivalent || '0');
                  return (
                    <TableRow key={calc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{calc.category}</p>
                            {calc.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {calc.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getScopeBadgeColor(calc.scope)}
                          variant="secondary"
                        >
                          {calc.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {activityData?.activityName || activityData?.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatNumber(activityData?.quantity || 0)}{' '}
                          {activityData?.unit || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{calc.gasType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">
                          {formatNumber(co2e)} kg CO₂e
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {(co2e / 1000).toFixed(3)} tons
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(calc.status)}>
                          {calc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(calc)}
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(calc.id)}
                            aria-label="Delete calculation"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCalculation && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Calculation Details</DialogTitle>
              <DialogDescription>
                Detailed information about this emission calculation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{selectedCalculation.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scope</p>
                  <Badge className={getScopeBadgeColor(selectedCalculation.scope)}>
                    {selectedCalculation.scope}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gas Type</p>
                  <p className="text-sm">{selectedCalculation.gasType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeColor(selectedCalculation.status)}>
                    {selectedCalculation.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Activity Data</p>
                <div className="bg-muted/50 p-3 rounded-md">
                  {(() => {
                    const activityData = selectedCalculation.activityData as any;
                    return (
                      <div className="space-y-1 text-sm">
                        <p><strong>Quantity:</strong> {formatNumber(activityData?.quantity || 0)} {activityData?.unit || '-'}</p>
                        {activityData?.activityName && (
                          <p><strong>Activity:</strong> {activityData.activityName}</p>
                        )}
                        {activityData?.description && (
                          <p><strong>Description:</strong> {activityData.description}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Emission Factor</p>
                <div className="bg-muted/50 p-3 rounded-md">
                  {(() => {
                    const emissionFactor = selectedCalculation.emissionFactor as any;
                    return (
                      <div className="space-y-1 text-sm">
                        <p><strong>Value:</strong> {emissionFactor?.value || '-'} {emissionFactor?.unit || '-'}</p>
                        <p><strong>Source:</strong> {emissionFactor?.source || '-'}</p>
                        <p><strong>Gas Type:</strong> {emissionFactor?.gasType || '-'}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emission Value</p>
                  <p className="text-sm font-semibold">
                    {formatNumber(parseFloat(selectedCalculation.emissionValue || '0'))} kg {selectedCalculation.gasType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CO₂ Equivalent</p>
                  <p className="text-sm font-semibold">
                    {formatNumber(parseFloat(selectedCalculation.co2Equivalent || '0'))} kg CO₂e
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">GWP Value</p>
                  <p className="text-sm">{selectedCalculation.gwpValue}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Calculation Method</p>
                  <p className="text-sm">{selectedCalculation.calculationMethod || '-'}</p>
                </div>
              </div>

              {selectedCalculation.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{selectedCalculation.notes}</p>
                </div>
              )}

              {selectedCalculation.evidence && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Evidence</p>
                  <a
                    href={selectedCalculation.evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedCalculation.evidence}
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Calculated At</p>
                <p className="text-sm">
                  {formatDate(selectedCalculation.calculatedAt)}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Calculation"
        description="Are you sure you want to delete this calculation? This action cannot be undone."
        onConfirm={confirmDelete}
        isDelete={isDeleting}
        cancelText="Cancel"
      />
    </>
  );
}

