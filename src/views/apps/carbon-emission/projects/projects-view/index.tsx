/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

type Project =
  inferRouterOutputs<AppRouter>["carbonProject"]["getByTenantId"]["carbonProjects"][number];

type ProjectsViewProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  handleAddProject: () => void;
  isLoading: boolean;
  createMutation: any;
  filteredProjects: Project[];
};

export function ProjectsView({
  search,
  setSearch,
  name,
  setName,
  openDialog,
  setOpenDialog,
  handleAddProject,
  isLoading,
  createMutation,
  filteredProjects,
}: ProjectsViewProps) {
  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Search project name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>Add Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={handleAddProject}
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? "Saving..." : "Submit"}
              </Button>
              {createMutation.error && (
                <p className="text-sm text-red-500">Failed to add project.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading projects...</p>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg hover:scale-[1.02] transition duration-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Carbon Emission Analysis Project
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No project found.</p>
      )}
    </div>
  );
}
