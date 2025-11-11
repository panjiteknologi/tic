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
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { DEFRACalculationDetailsDialog } from './defra-calculation-details-dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { trpc } from '@/trpc/react';

type DEFRACalculation =
  inferRouterOutputs<AppRouter>['defraCarbonCalculations']['getByProjectId']['calculations'][number];

interface DEFRACalculationsTableProps {
  projectId: string;
  calculations: DEFRACalculation[];
  onCalculationDeleted: () => void;
}

export function DEFRACalculationsTable({
  projectId,
  calculations,
  onCalculationDeleted
}: DEFRACalculationsTableProps) {
  const [selectedCalculation, setSelectedCalculation] =
    useState<DEFRACalculation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] =
    useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const utils = trpc.useUtils();

  const deleteMutation = trpc.defraCarbonCalculations.delete.useMutation({
    onSuccess: () => {
      utils.defraCarbonCalculations.getByProjectId.invalidate({ projectId });
      utils.defraProjects.getById.invalidate({ id: projectId });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCalculationToDelete(null);
      onCalculationDeleted();
    },
    onError: () => {
      setIsDeleting(false);
    }
  });

  const { data: calculationDetails } = trpc.defraCarbonCalculations.getById.useQuery(
    { id: selectedCalculation?.id || '' },
    { enabled: !!selectedCalculation && detailsDialogOpen }
  );

  const handleViewDetails = (calculation: DEFRACalculation) => {
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

  const getScopeBadgeColor = (scope: string | null) => {
    switch (scope) {
      case 'Scope 1':
        return 'bg-red-100 text-red-800';
      case 'Scope 2':
        return 'bg-blue-100 text-blue-800';
      case 'Scope 3':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                  <TableHead>Activity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="text-right">Total CO₂e</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => {
                  const totalCo2e = parseFloat(calc.totalCo2e || '0');
                  return (
                    <TableRow key={calc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{calc.category}</p>
                            {calc.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {calc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(calc.activityDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatNumber(parseFloat(calc.quantity || '0'))}{' '}
                          {calc.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{calc.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {calc.scope ? (
                          <Badge
                            className={getScopeBadgeColor(calc.scope)}
                            variant="secondary"
                          >
                            {calc.scope}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">
                          {formatNumber(totalCo2e)} kg CO₂e
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {(totalCo2e / 1000).toFixed(3)} tons
                        </p>
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
        <DEFRACalculationDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          calculation={selectedCalculation}
          details={
            calculationDetails?.emissionFactor
              ? {
                  emissionFactor: {
                    id: calculationDetails.emissionFactor.id,
                    name: calculationDetails.emissionFactor.activityName,
                    category:
                      calculationDetails.emissionFactor.level1Category ||
                      calculationDetails.emissionFactor.activityName
                  }
                }
              : undefined
          }
        />
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

