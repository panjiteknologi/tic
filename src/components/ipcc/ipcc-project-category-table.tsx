"use client";

import { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Tag,
  Database,
  Edit,
  Trash2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/trpc/react";
import { formatNumber } from "@/lib/utils";
import { AddActivityDataDialog } from "@/components/ipcc/add-activity-data-dialog";
import { EditActivityDataDialog } from "@/components/ipcc/edit-activity-data-dialog";
import { DeleteCategoryDialog } from "@/components/ipcc/delete-category-dialog";

interface Category {
  id: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  sector: string;
  assignedAt: Date;
}

interface EmissionCalculation {
  id: string;
  activityDataId: string;
  gasType: string;
  emissionValue: string;
  emissionUnit: string;
  co2Equivalent: string;
  tier: string;
  notes?: string;
}

interface TableRowData {
  id: string;
  sector: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  activityId?: string;
  activityName?: string;
  activityValue?: string;
  activityUnit?: string;
  activityDescription?: string;
  activitySource?: string;
  calculations: EmissionCalculation[];
  hasActivity: boolean;
}

interface IPCCProjectCategoryTableProps {
  projectId: string;
  categories: Category[];
  categoriesBySector: { [sector: string]: Category[] };
  onCategoryDeleted?: () => void;
}

const columnHelper = createColumnHelper<TableRowData>();

export function IPCCProjectCategoryTable({
  projectId,
  categories,
  categoriesBySector,
  onCategoryDeleted: onCategoryDeletedProp,
}: IPCCProjectCategoryTableProps) {
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedEditActivity, setSelectedEditActivity] = useState<{
    id: string;
    name: string;
    value: string;
    unit: string;
    description: string;
    source: string;
    categoryId: string;
  }>({ id: "", name: "", value: "", unit: "", description: "", source: "", categoryId: "" });
  const [selectedDeleteCategory, setSelectedDeleteCategory] = useState<{
    id: string;
    code: string;
    name: string;
    sector: string;
    hasActivities: boolean;
    activityCount: number;
    activityId?: string;
    activityName?: string;
  }>({ id: "", code: "", name: "", sector: "", hasActivities: false, activityCount: 0 });

  const { data: activityData, refetch: refetchActivityData } =
    trpc.ipccActivityData.getByProject.useQuery(
      { projectId },
      { enabled: !!projectId }
    );

  const { data: calculationsData, refetch: refetchCalculations } =
    trpc.ipccEmissionCalculations.getByProject.useQuery(
      { projectId },
      { enabled: !!projectId }
    );

  const getSectorLabel = (sector: string) => {
    const sectorLabels = {
      ENERGY: "Energy",
      IPPU: "Industrial Processes & Product Use",
      AFOLU: "Agriculture, Forestry & Other Land Use",
      WASTE: "Waste",
      OTHER: "Other",
    };
    return sectorLabels[sector as keyof typeof sectorLabels] || sector;
  };

  const getActivityDataForCategory = (categoryId: string) => {
    return (
      activityData?.activityData?.filter(
        (activity) => activity.categoryId === categoryId
      ) || []
    );
  };

  const getCalculationsForActivity = (activityId: string) => {
    return (
      calculationsData?.calculations?.filter(
        (calc) => calc.activityDataId === activityId
      ) || []
    );
  };

  const formatEmissionValue = (value: string, unit?: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 1000000) {
      return `${formatNumber(numValue / 1000000)} M${unit || "kg"}`;
    } else if (numValue >= 1000) {
      return `${formatNumber(numValue / 1000)} k${unit || "kg"}`;
    }
    return `${formatNumber(numValue)} ${unit || "kg"}`;
  };

  const handleAddActivity = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setAddActivityDialogOpen(true);
  };

  const handleActivityAdded = () => {
    refetchActivityData();
    refetchCalculations(); // Also refetch calculations since they are auto-created
  };

  const handleEditActivity = (
    activityId: string,
    activityName: string,
    activityValue: string,
    activityUnit: string,
    activityDescription: string,
    activitySource: string,
    categoryId: string
  ) => {
    setSelectedEditActivity({
      id: activityId,
      name: activityName,
      value: activityValue,
      unit: activityUnit,
      description: activityDescription,
      source: activitySource,
      categoryId: categoryId,
    });
    setEditActivityDialogOpen(true);
  };

  const handleActivityUpdated = () => {
    refetchActivityData();
    refetchCalculations(); // Also refetch calculations since they are auto-recalculated
  };


  const handleDeleteCategory = (
    categoryId: string,
    categoryCode: string,
    categoryName: string,
    sector: string,
    hasActivities: boolean,
    activityCount: number,
    activityId?: string,
    activityName?: string
  ) => {
    setSelectedDeleteCategory({ 
      id: categoryId, 
      code: categoryCode, 
      name: categoryName, 
      sector,
      hasActivities,
      activityCount,
      activityId,
      activityName
    });
    setDeleteCategoryDialogOpen(true);
  };


  const handleCategoryDeleted = () => {
    // Trigger parent component to refetch categories
    onCategoryDeletedProp?.();
    // Also refresh activity data and calculations
    refetchActivityData();
    refetchCalculations();
  };

  const tableData = useMemo(() => {
    const data: TableRowData[] = [];

    Object.entries(categoriesBySector).forEach(([sector, sectorCategories]) => {
      sectorCategories.forEach((category) => {
        const categoryActivities = getActivityDataForCategory(category.categoryId);
        
        if (categoryActivities.length > 0) {
          // Show each activity as a row
          categoryActivities.forEach((activity) => {
            const calculations = getCalculationsForActivity(activity.id);
            
            data.push({
              id: activity.id,
              sector: getSectorLabel(sector),
              categoryId: category.categoryId,
              categoryCode: category.categoryCode,
              categoryName: category.categoryName,
              activityId: activity.id,
              activityName: activity.name,
              activityValue: activity.value,
              activityUnit: activity.unit,
              activityDescription: activity.description ?? undefined,
              activitySource: activity.source ?? undefined,
              calculations: calculations.map((calc) => ({
                ...calc,
                notes: calc.notes ?? undefined,
              })),
              hasActivity: true,
            });
          });
        } else {
          // Show category without activities
          data.push({
            id: category.categoryId,
            sector: getSectorLabel(sector),
            categoryId: category.categoryId,
            categoryCode: category.categoryCode,
            categoryName: category.categoryName,
            calculations: [],
            hasActivity: false,
          });
        }
      });
    });

    return data;
  }, [categoriesBySector, activityData, calculationsData]);

  const columns = [
    columnHelper.accessor("sector", {
      header: "Sector / Category",
      cell: ({ row, getValue }) => {
        const sector = getValue();
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{sector}</span>
            </div>
            <div className="flex items-center gap-2 ml-6">
              <Badge variant="secondary" className="text-xs">
                {row.original.categoryCode}
              </Badge>
              <span className="font-medium text-sm">{row.original.categoryName}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("activityName", {
      header: "Activity",
      cell: ({ row, getValue }) => {
        const activityName = getValue();
        if (!row.original.hasActivity) {
          return (
            <span className="text-sm text-muted-foreground italic">
              No activities yet
            </span>
          );
        }
        return (
          <div className="space-y-1">
            <span className="font-medium">{activityName}</span>
            {row.original.activityDescription && (
              <p className="text-xs text-muted-foreground">
                {row.original.activityDescription}
              </p>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("activityValue", {
      header: "Value",
      cell: ({ row, getValue }) => {
        const value = getValue();
        if (!row.original.hasActivity || !value) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <span className="text-sm">
            {formatNumber(parseFloat(value))} {row.original.activityUnit}
          </span>
        );
      },
    }),
    columnHelper.accessor("calculations", {
      header: "Emissions",
      cell: ({ row, getValue }) => {
        const calculations = getValue();
        if (calculations && calculations.length > 0) {
          const totalCO2 = calculations.reduce(
            (sum, calc) => sum + parseFloat(calc.co2Equivalent),
            0
          );
          return (
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {formatEmissionValue(totalCO2.toString())} CO2-eq
              </span>
            </div>
          );
        }
        return (
          <span className="text-xs text-muted-foreground">No calculations</span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const { categoryId, activityId, activityName, calculations, hasActivity } = row.original;

        if (!hasActivity) {
          // Show "Add Activity" and "Delete Category" buttons for categories without activities
          return (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddActivity(categoryId)}
                className="gap-1"
              >
                <Database className="h-3 w-3" />
                Add Activity
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => handleDeleteCategory(
                        categoryId,
                        row.original.categoryCode,
                        row.original.categoryName,
                        Object.keys(categoriesBySector).find(sector => 
                          categoriesBySector[sector].some(cat => cat.categoryId === categoryId)
                        ) || "",
                        false,
                        0
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove Category</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }

        // Show activity management buttons for activities
        return (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleEditActivity(
                      activityId!,
                      activityName!,
                      row.original.activityValue!,
                      row.original.activityUnit!,
                      row.original.activityDescription || "",
                      row.original.activitySource || "",
                      categoryId
                    )}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Activity Data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => handleDeleteCategory(
                      categoryId,
                      row.original.categoryCode,
                      row.original.categoryName,
                      Object.keys(categoriesBySector).find(sector => 
                        categoriesBySector[sector].some(cat => cat.categoryId === categoryId)
                      ) || "",
                      true, // hasActivities = true
                      1, // activityCount = 1 (since this row represents an activity)
                      activityId, // pass activityId for parallel deletion
                      activityName // pass activityName for display
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Activity & Category</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Assigned Emission Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No categories assigned yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddActivityDataDialog
        open={addActivityDialogOpen}
        onOpenChange={setAddActivityDialogOpen}
        projectId={projectId}
        categoryId={selectedCategoryId}
        onActivityAdded={handleActivityAdded}
      />

      <EditActivityDataDialog
        open={editActivityDialogOpen}
        onOpenChange={setEditActivityDialogOpen}
        projectId={projectId}
        activityId={selectedEditActivity.id}
        activityName={selectedEditActivity.name}
        activityValue={selectedEditActivity.value}
        activityUnit={selectedEditActivity.unit}
        activityDescription={selectedEditActivity.description}
        activitySource={selectedEditActivity.source}
        categoryId={selectedEditActivity.categoryId}
        onActivityUpdated={handleActivityUpdated}
      />

      <DeleteCategoryDialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        projectId={projectId}
        categoryId={selectedDeleteCategory.id}
        categoryCode={selectedDeleteCategory.code}
        categoryName={selectedDeleteCategory.name}
        sector={selectedDeleteCategory.sector}
        hasActivities={selectedDeleteCategory.hasActivities}
        activityCount={selectedDeleteCategory.activityCount}
        activityId={selectedDeleteCategory.activityId}
        activityName={selectedDeleteCategory.activityName}
        onCategoryDeleted={handleCategoryDeleted}
      />
    </>
  );
}
