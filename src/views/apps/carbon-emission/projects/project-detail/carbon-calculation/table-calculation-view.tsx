"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmissionsTypes } from "@/types/carbon-types";

type TableCalculationViewProps = {
  data: EmissionsTypes[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isEmpty?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPrev?: () => void;
  onNext?: () => void;
  setCurrentPage?: (page: number) => void;
};

export function TableCalculationView({
  data,
  onEdit,
  onDelete,
  isEmpty,
  totalPages = 1,
  currentPage = 1,
  onPrev,
  onNext,
  setCurrentPage,
}: TableCalculationViewProps) {
  const startIndex = (currentPage - 1) * data.length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md overflow-hidden border shadow-inner">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Carbon Name</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((emission, index) => (
                <TableRow key={emission.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>{emission.keterangan ?? "-"}</TableCell>
                  <TableCell>
                    {emission.nilaiInt ?? emission.nilaiString}
                  </TableCell>
                  <TableCell>{emission.satuan ?? "-"}</TableCell>
                  <TableCell>{emission.source ?? "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(emission.id)}
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete?.(emission.id)}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isEmpty && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={currentPage === 1}
          >
            Prev
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage?.(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
