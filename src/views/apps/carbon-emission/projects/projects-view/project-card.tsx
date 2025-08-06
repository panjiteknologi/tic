"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";
import { Pencil, Trash } from "lucide-react"; // Tambahkan icon delete
import { Button } from "@/components/ui/button";

type Project =
  inferRouterOutputs<AppRouter>["carbonProject"]["getByTenantId"]["carbonProjects"][number];

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  setName,
}: {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  setName: () => void;
}) {
  const router = useRouter();

  return (
    <Card
      onClick={() =>
        router.push(`/apps/carbon-emission/iscc/projects/${project.id}`)
      }
      className="group relative rounded-xl border hover:shadow-md transition-all duration-200 cursor-pointer h-full"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-10 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(project.id);
          setName();
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

      <CardContent className="h-full flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary truncate">
            {project.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Terakhir diperbarui:{" "}
          {new Date(project.updatedAt).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
