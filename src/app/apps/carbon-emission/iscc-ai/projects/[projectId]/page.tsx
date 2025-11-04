"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/layout/dashboard-layout";
import { getCarbonCalculationAIMenu } from "@/constant/menu-sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useCarbonCalculationData } from "@/hooks";
import CarbonCalaculation from "./carbon-calculation/page";

export default function CalculationListPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const searchParams = useSearchParams();
  const carbonProjectId = String(projectId);

  // Get active step from URL or default to step1
  const activeStep = (searchParams.get("step") as string) || "step1";

  const handleStepChange = (step: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step);
    router.push(`?${params.toString()}`);
  };

  const {
    isLoading,
    verifications,
    calculations,
    process,
    additional,
    otherCase,
    audit,
  } = useCarbonCalculationData();

  const tabs = [
    {
      value: "step1",
      label: "Step 1 | GHG Verification",
      data: verifications?.stepSatuGhgVerifications ?? [],
    },
    {
      value: "step2",
      label: "Step 2 | GHG Calculation",
      data: calculations?.stepDuaGhgCalculations ?? [],
    },
    {
      value: "step3",
      label: "Step 3 | GHG Process",
      data: process?.stepTigaGhgCalculationProcesses ?? [],
    },
    {
      value: "step4",
      label: "Step 4 | Add",
      data: additional?.stepTigaAdditionals ?? [],
    },
    {
      value: "step5",
      label: "Step 5 | Other Case",
      data: otherCase?.stepTigaOtherCases ?? [],
    },
    {
      value: "step6",
      label: "Step 6 | GHG Audit",
      data: audit?.stepEmpatGhgAudits ?? [],
    },
  ];

  return (
    <DashboardLayout
      href={`/apps/carbon-emission/iscc-ai/projects`}
      titleHeader="All Projects (AI)"
      subTitleHeader="All Carbon Calculation"
      menuSidebar={getCarbonCalculationAIMenu(carbonProjectId)}
    >
      <div>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-primary text-left"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <Tabs
        value={activeStep}
        onValueChange={handleStepChange}
        defaultValue="step1"
        className="w-full p-2"
      >
        <div className="overflow-x-auto no-scrollbar">
          <TabsList className="flex w-max min-w-full space-x-2 border-b border-muted p-1">
            {tabs.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="px-5 py-3 text-base font-semibold whitespace-nowrap rounded-md
                  data-[state=active]:bg-white data-[state=active]:text-primary
                  hover:bg-muted transition-all"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8 mx-auto">
            <Spinner />
          </div>
        ) : (
          <Fragment>
            {tabs.map(({ value }) => (
              <TabsContent key={value} value={value}>
                <CarbonCalaculation />
              </TabsContent>
            ))}
          </Fragment>
        )}
      </Tabs>
    </DashboardLayout>
  );
}
