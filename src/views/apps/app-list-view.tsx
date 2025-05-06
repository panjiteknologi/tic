"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

// Define the app interfaces
interface AppCategory {
  id: string;
  title: string;
  apps: App[];
}

interface App {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  badge?: string;
  isNew?: boolean;
}

interface AppListViewProps {
  categories: AppCategory[];
}

export function AppListView({ categories }: AppListViewProps) {
  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category.id} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{category.title}</h2>
            <Separator className="bg-border" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-16 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <app.icon className="h-5 w-5 text-primary" />
                      <span>{app.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {app.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {app.isNew && (
                        <Badge variant="default" className="bg-primary">
                          New
                        </Badge>
                      )}
                      {app.badge && (
                        <Badge variant="outline">{app.badge}</Badge>
                      )}
                      {!app.isNew && !app.badge && (
                        <span className="text-muted-foreground text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={app.url}
                      className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open {app.title}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ))}
    </div>
  );
}
