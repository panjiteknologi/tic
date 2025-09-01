"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmissionsTypes } from "@/types/carbon-types";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

type TableCalculationViewProps = {
  data: EmissionsTypes[];
  onEdit?: (id: EmissionsTypes) => void;
  onDelete?: (id: number) => void;
  isEmpty?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPrev?: () => void;
  onNext?: () => void;
  setCurrentPage?: (page: number) => void;
  isRefreshing: boolean;
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
  isRefreshing,
}: TableCalculationViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<EmissionsTypes>>({});

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const disabledAll = isLoading || isRefreshing;

  const startEditing = (row: EmissionsTypes) => {
    setEditingRowId(row.id);
    setEditedData({ ...row });
  };

  const handleInputChange = (field: keyof EmissionsTypes, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (onEdit && editedData.id) {
      setIsLoading(true);
      try {
        await onEdit(editedData as EmissionsTypes);
        setEditingRowId(null);
        setEditedData({});
      } catch (error) {
        console.error("Error saat mengupdate:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-md border shadow-inner">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-10">#</TableHead>
                <TableHead>Carbon Name</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Deskripsi</TableHead>
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
                data.map((row, index) => {
                  const isEditing = editingRowId === row.id;

                  return (
                    <TableRow key={row.id}>
                      <TableCell>{startIndex + index + 1}</TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedData.keterangan ?? ""}
                            onChange={(e) =>
                              handleInputChange("keterangan", e.target.value)
                            }
                            disabled={disabledAll}
                            className="w-full"
                          />
                        ) : (
                          row.keterangan ?? "-"
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedData.nilaiInt?.toString() ?? ""}
                            onChange={(e) =>
                              handleInputChange("nilaiInt", e.target.value)
                            }
                            disabled={disabledAll}
                            className="w-full"
                          />
                        ) : (
                          row.nilaiInt ?? "-"
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedData.nilaiString?.toString() ?? ""}
                            onChange={(e) =>
                              handleInputChange("nilaiString", e.target.value)
                            }
                            disabled={disabledAll}
                            className="w-full"
                          />
                        ) : (
                          row.nilaiString ?? "-"
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedData.satuan ?? ""}
                            onChange={(e) =>
                              handleInputChange("satuan", e.target.value)
                            }
                            disabled={disabledAll}
                            className="w-full"
                          />
                        ) : (
                          row.satuan ?? "-"
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editedData.source ?? ""}
                            onChange={(e) =>
                              handleInputChange("source", e.target.value)
                            }
                            disabled={disabledAll}
                            className="w-full"
                          />
                        ) : (
                          row.source ?? "-"
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        {isEditing ? (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={saveChanges}
                              disabled={disabledAll}
                            >
                              {isLoading ? (
                                <Spinner className="w-4 h-4 text-green-600" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditing(row)}
                              disabled={disabledAll}
                              className="hover:bg-blue-100 transition-all"
                            >
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDelete?.(row.id)}
                              disabled={disabledAll}
                              className="hover:bg-red-100 transition-all"
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isEmpty && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={currentPage === 1}
            className="w-full sm:w-auto"
          >
            Prev
          </Button>

          <div className="flex flex-wrap justify-center gap-1 max-w-full overflow-x-auto">
            {(() => {
              const pageButtons = [];
              const maxVisiblePages = 10;

              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisiblePages / 2)
              );
              let endPage = startPage + maxVisiblePages - 1;

              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pageButtons.push(
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage?.(i)}
                    className="min-w-[36px]"
                  >
                    {i}
                  </Button>
                );
              }

              return pageButtons;
            })()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
