"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  Calendar,
  FilePlus,
  FileText,
  LayoutDashboard,
  LineChart,
  Link2,
  ListChecks,
  Search,
  Upload,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppsSearchAndView } from "./app-search-view";
import { AppListView } from "./app-list-view";
import { AppsHero } from "./app-hero";

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
  icon: LucideIcon;
  url: string;
  badge?: string;
  isNew?: boolean;
}

// Sample app data
const appCategories: AppCategory[] = [
  {
    id: "main",
    title: "Main Applications",
    apps: [
      {
        id: "dashboard",
        title: "Dashboard",
        description: "Overview of your activities and metrics",
        icon: LayoutDashboard,
        url: "/apps/dashboard",
      },
      {
        id: "price-simulation",
        title: "Price Simulation",
        description: "Test pricing scenarios for your products and services",
        icon: LineChart,
        url: "/apps/price-simulation",
      },
      {
        id: "mandays",
        title: "Perhitungan Mandays",
        description: "Calculate project timelines and resource allocations",
        icon: Calendar,
        url: "/apps/mandays",
      },
    ],
  },
  {
    id: "audit",
    title: "Audit & Certification",
    apps: [
      {
        id: "audit-status",
        title: "Audit Status",
        description: "Check the current status of your audits",
        icon: ListChecks,
        url: "/apps/audit-status",
      },
      {
        id: "audit-plan",
        title: "Audit Plan",
        description: "View and manage your audit plans",
        icon: FileText,
        url: "/apps/audit-plan",
      },
      {
        id: "audit-plan-stage-1",
        title: "Audit Plan Stage 1",
        description: "Manage stage 1 of your audit process",
        icon: FileText,
        url: "/apps/audit-plan-stage-1",
      },
      {
        id: "audit-plan-stage-2",
        title: "Audit Plan Stage 2",
        description: "Manage stage 2 of your audit process",
        icon: FileText,
        url: "/apps/audit-plan-stage-2",
      },
      {
        id: "audit-notification",
        title: "Audit Notifikasi dari Odoo",
        description: "Notifications from Odoo to Dashboard Client",
        icon: Bell,
        url: "/apps/audit-notification",
      },
      {
        id: "terbit-sertifikat",
        title: "Terbit Sertifikat",
        description: "Generate and manage certification documents",
        icon: Award,
        url: "/apps/terbit-sertifikat",
      },
    ],
  },
  {
    id: "review",
    title: "Review & Documentation",
    apps: [
      {
        id: "review-scope",
        title: "Review Scope",
        description: "Review and define certification scopes",
        icon: Search,
        url: "/apps/review-scope",
        badge: "OPEN",
      },
      {
        id: "upload-traceability",
        title: "Upload Traceability",
        description: "Upload and manage traceability documents",
        icon: Upload,
        url: "/apps/upload-traceability",
      },
      {
        id: "reminder-surveillance",
        title: "Reminder Surveillance",
        description: "Set and manage surveillance reminders",
        icon: Bell,
        url: "/apps/reminder-surveillance",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Administration",
    apps: [
      {
        id: "invoice",
        title: "Invoice Pembayaran dan Laporan PnL",
        description: "Manage invoices and PnL reports",
        icon: FileText,
        url: "/apps/invoice",
      },
      {
        id: "proposal-status",
        title: "Proposal Status Closing Generate",
        description: "Track and generate proposal closing status",
        icon: FileText,
        url: "/apps/proposal-status",
      },
      {
        id: "generate-proposal",
        title: "Generate Proposal dan Proposan Number",
        description:
          "Generate proposals and proposal numbers from Odoo ERP TSI",
        icon: FilePlus,
        url: "/apps/generate-proposal",
      },
    ],
  },
  {
    id: "integration",
    title: "Integration & Tools",
    apps: [
      {
        id: "integration",
        title: "Integrasi dengan Panggil Aku",
        description:
          "Integration with Panggil Aku (on discuss), Db Odoo, Linkin",
        icon: Link2,
        url: "/apps/integration",
      },
    ],
  },
];

const AppsView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter apps based on search query
  const filteredCategories = appCategories
    .map((category) => {
      const filteredApps = category.apps.filter(
        (app) =>
          app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return {
        ...category,
        apps: filteredApps,
      };
    })
    .filter((category) => category.apps.length > 0);

  return (
    <div className="space-y-8">
      <AppsHero />
      <AppsSearchAndView
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No applications found matching your search.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <AppListView categories={filteredCategories} />
      ) : (
        filteredCategories.map((category) => (
          <section key={category.id} className="space-y-4 mb-16">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{category.title}</h2>
              <Separator className="bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.apps.map((app) => (
                <Link
                  key={app.id}
                  href={app.url}
                  className="block transition hover:scale-[1.01] duration-200"
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-primary/10 p-2 rounded">
                          <app.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex space-x-2">
                          {app.isNew && (
                            <Badge variant="default" className="bg-primary">
                              New
                            </Badge>
                          )}
                          {app.badge && (
                            <Badge variant="outline">{app.badge}</Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {app.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-muted-foreground">
                        {app.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default AppsView;
