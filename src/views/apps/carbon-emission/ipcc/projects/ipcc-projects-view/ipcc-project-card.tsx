"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";
import { Pencil, Trash, Building, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type IPCCProject =
  inferRouterOutputs<AppRouter>["ipccProjects"]["getAll"]["projects"][number];

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  ACTIVE: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
  ARCHIVED: "bg-orange-100 text-orange-800 hover:bg-orange-200",
};

const statusLabels = {
  DRAFT: "Draft",
  ACTIVE: "Aktif",
  COMPLETED: "Selesai",
  ARCHIVED: "Arsip",
};

export function IPCCProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: IPCCProject;
  onEdit: (project: IPCCProject) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <Card
      onClick={() =>
        router.push(`/apps/carbon-emission/ipcc/projects/${project.id}`)
      }
      className="group relative rounded-xl py-0 border hover:shadow-md transition-all duration-200 cursor-pointer h-full"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-10 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(project);
        }}
        aria-label="Edit project"
      >
        <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
        aria-label="Delete project"
      >
        <Trash className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </Button>

      <CardContent className="h-full flex flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary truncate pr-16">
              {project.name}
            </h3>
          </div>

          <Badge
            className={`${statusColors[project.status]} text-xs font-medium`}
            variant="secondary"
          >
            {statusLabels[project.status]}
          </Badge>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="space-y-2">
            {project.organizationName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building className="w-3 h-3" />
                <span className="truncate">{project.organizationName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Tahun: {project.year}</span>
            </div>

            {project.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{project.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Terakhir diperbarui:{" "}
            {new Date(project.updatedAt).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
