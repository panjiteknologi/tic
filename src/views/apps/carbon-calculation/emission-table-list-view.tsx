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

export type Emission = {
  id: string;
  source: string;
  type: string;
  amount: number;
  unit: string;
};

type EmissionTableListViewProps = {
  emissions: Emission[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function EmissionTableListView({
  emissions,
  onEdit,
  onDelete,
}: EmissionTableListViewProps) {
  return (
    <div className="overflow-x-auto rounded-md overflow-hidden border sshadow-inner">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="w-10">#</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emissions.map((emission, index) => (
            <TableRow key={emission.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{emission.source}</TableCell>
              <TableCell>{emission.type}</TableCell>
              <TableCell>{emission.amount}</TableCell>
              <TableCell>{emission.unit}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
