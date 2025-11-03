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
  ChevronDown,
  ChevronRight,
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
import { DeleteActivityDialog } from "@/components/ipcc/delete-activity-dialog";

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
  type: "category" | "activity";
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
  totalActivities?: number;
  totalEmissions?: number;
  isExpanded?: boolean;
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
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    useState(false);
  const [deleteActivityDialogOpen, setDeleteActivityDialogOpen] =
    useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedEditActivity, setSelectedEditActivity] = useState<{
    id: string;
    name: string;
    value: string;
    unit: string;
    description: string;
    source: string;
    categoryId: string;
  }>({
    id: "",
    name: "",
    value: "",
    unit: "",
    description: "",
    source: "",
    categoryId: "",
  });
  const [selectedDeleteCategory, setSelectedDeleteCategory] = useState<{
    id: string;
    code: string;
    name: string;
    sector: string;
    hasActivities: boolean;
    activityCount: number;
    activityId?: string;
    activityName?: string;
  }>({
    id: "",
    code: "",
    name: "",
    sector: "",
    hasActivities: false,
    activityCount: 0,
  });

  const [selectedDeleteActivity, setSelectedDeleteActivity] = useState<{
    id: string;
    name: string;
    categoryId: string;
    categoryCode: string;
    categoryName: string;
  }>({
    id: "",
    name: "",
    categoryId: "",
    categoryCode: "",
    categoryName: "",
  });

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
      activityName,
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

  const handleDeleteActivity = (
    activityId: string,
    activityName: string,
    categoryId: string,
    categoryCode: string,
    categoryName: string
  ) => {
    setSelectedDeleteActivity({
      id: activityId,
      name: activityName,
      categoryId,
      categoryCode,
      categoryName,
    });
    setDeleteActivityDialogOpen(true);
  };

  const handleActivityDeleted = () => {
    // Refresh activity data and calculations
    refetchActivityData();
    refetchCalculations();
    // No need to refetch categories since we're only deleting activity data
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const tableData = useMemo(() => {
    const data: TableRowData[] = [];

    Object.entries(categoriesBySector).forEach(([sector, sectorCategories]) => {
      sectorCategories.forEach((category) => {
        const categoryActivities = getActivityDataForCategory(
          category.categoryId
        );
        const isExpanded = expandedCategories.has(category.categoryId);

        // Calculate totals for this category
        let totalEmissions = 0;
        const allCalculations: EmissionCalculation[] = [];

        categoryActivities.forEach((activity) => {
          const calculations = getCalculationsForActivity(activity.id);
          allCalculations.push(
            ...calculations.map((calc) => ({
              ...calc,
              notes: calc.notes ?? undefined,
            }))
          );

          calculations.forEach((calc) => {
            totalEmissions += parseFloat(calc.co2Equivalent);
          });
        });

        // Always add the parent category row
        data.push({
          id: category.categoryId,
          type: "category",
          sector: getSectorLabel(sector),
          categoryId: category.categoryId,
          categoryCode: category.categoryCode,
          categoryName: category.categoryName,
          calculations: allCalculations,
          hasActivity: categoryActivities.length > 0,
          totalActivities: categoryActivities.length,
          totalEmissions: totalEmissions,
          isExpanded: isExpanded,
        });

        // Add child activity rows if expanded and has activities
        if (isExpanded && categoryActivities.length > 0) {
          categoryActivities.forEach((activity) => {
            const calculations = getCalculationsForActivity(activity.id);

            data.push({
              id: `${category.categoryId}-${activity.id}`,
              type: "activity",
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
        }
      });
    });

    console.log("IPCC Project Category Table Data:", data);
    return data;
  }, [categoriesBySector, activityData, calculationsData, expandedCategories]);

  const columns = [
    columnHelper.accessor("sector", {
      header: "Sector / Category",
      cell: ({ row, getValue }) => {
        const sector = getValue();
        const isCategory = row.original.type === "category";
        const isExpanded = row.original.isExpanded;
        const hasActivities = row.original.hasActivity;

        if (isCategory) {
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{sector}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasActivities && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      toggleCategoryExpansion(row.original.categoryId)
                    }
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {!hasActivities && <div className="w-6" />}
                <Badge variant="secondary" className="text-xs">
                  {row.original.categoryCode}
                </Badge>
                <span className="font-medium text-sm">
                  {row.original.categoryName}
                </span>
              </div>
            </div>
          );
        } else {
          // Activity row - indented
          return (
            <div className="ml-8 flex items-center gap-2">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{row.original.activityName}</span>
            </div>
          );
        }
      },
    }),
    columnHelper.accessor("totalActivities", {
      header: "Total Activity",
      cell: ({ row }) => {
        const isCategory = row.original.type === "category";

        if (isCategory) {
          const totalActivities = row.original.totalActivities || 0;
          return (
            <span className="text-sm font-medium">
              {totalActivities}{" "}
              {totalActivities === 1 ? "activity" : "activities"}
            </span>
          );
        } else {
          // Activity row - show activity description
          return (
            <div className="space-y-1">
              {row.original.activityDescription && (
                <p className="text-xs text-muted-foreground">
                  {row.original.activityDescription}
                </p>
              )}
            </div>
          );
        }
      },
    }),
    columnHelper.accessor("activityValue", {
      header: "Value",
      cell: ({ row, getValue }) => {
        const isCategory = row.original.type === "category";
        const value = getValue();

        if (isCategory) {
          return <span className="text-sm text-muted-foreground">-</span>;
        } else {
          // Activity row
          if (!value) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }
          return (
            <span className="text-sm">
              {formatNumber(parseFloat(value))} {row.original.activityUnit}
            </span>
          );
        }
      },
    }),
    columnHelper.accessor("calculations", {
      header: "Total Emissions",
      cell: ({ row, getValue }) => {
        const isCategory = row.original.type === "category";
        const calculations = getValue();

        if (calculations && calculations.length > 0) {
          const totalCO2 = calculations.reduce(
            (sum, calc) => sum + parseFloat(calc.co2Equivalent),
            0
          );

          return (
            <div className="flex items-center gap-2">
              <Zap
                className={`h-3 w-3 ${
                  isCategory ? "text-green-600" : "text-green-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isCategory ? "font-bold text-green-700" : "text-green-600"
                }`}
              >
                {formatEmissionValue(totalCO2.toString())} CO2-eq
              </span>
            </div>
          );
        }

        if (isCategory) {
          return (
            <span className="text-xs text-muted-foreground">
              No emissions calculated
            </span>
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
        const { categoryId, activityId, activityName, hasActivity, type } =
          row.original;
        const isCategory = type === "category";

        if (isCategory) {
          // Parent category row actions
          return (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddActivity(categoryId)}
                className="gap-1 text-xs"
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
                      onClick={() =>
                        handleDeleteCategory(
                          categoryId,
                          row.original.categoryCode,
                          row.original.categoryName,
                          Object.keys(categoriesBySector).find((sector) =>
                            categoriesBySector[sector].some(
                              (cat) => cat.categoryId === categoryId
                            )
                          ) || "",
                          hasActivity,
                          row.original.totalActivities || 0
                        )
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Category & All Activities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        } else {
          // Child activity row actions
          return (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        handleEditActivity(
                          activityId!,
                          activityName!,
                          row.original.activityValue!,
                          row.original.activityUnit!,
                          row.original.activityDescription || "",
                          row.original.activitySource || "",
                          categoryId
                        )
                      }
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
                      onClick={() =>
                        handleDeleteActivity(
                          activityId!,
                          activityName!,
                          categoryId,
                          row.original.categoryCode,
                          row.original.categoryName
                        )
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Activity Data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }
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
                table.getRowModel().rows.map((row, index) => {
                  const isCategory = row.original.type === "category";
                  const isActivity = row.original.type === "activity";

                  // Check if this is the last activity in an expanded category group
                  const isLastActivityInGroup =
                    isActivity &&
                    (index === table.getRowModel().rows.length - 1 ||
                      table.getRowModel().rows[index + 1]?.original.type ===
                        "category");

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`${
                        isCategory
                          ? "bg-muted/50 font-medium border-b-2 border-muted"
                          : "bg-background/50"
                      } ${
                        isLastActivityInGroup ? "border-b-4 border-muted" : ""
                      }`}
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
                  );
                })
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

      <DeleteActivityDialog
        open={deleteActivityDialogOpen}
        onOpenChange={setDeleteActivityDialogOpen}
        // projectId={projectId}
        activityId={selectedDeleteActivity.id}
        activityName={selectedDeleteActivity.name}
        // categoryId={selectedDeleteActivity.categoryId}
        categoryCode={selectedDeleteActivity.categoryCode}
        categoryName={selectedDeleteActivity.categoryName}
        onActivityDeleted={handleActivityDeleted}
      />
    </>
  );
}
