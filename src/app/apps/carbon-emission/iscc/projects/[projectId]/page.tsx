"use client";

import { useParams, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/layout/dashboard-layout";
import { getCarbonCalculationMenu } from "@/constant/menu-sidebar";
import { CarbonCalculationView } from "@/views/apps/carbon-emission/projects/project-detail/carbon-calculation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCarbonCalculationData } from "@/hooks/use-carbon-calculation-data";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function CalculationListPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const id = typeof projectId === "string" ? projectId : "";

  const [activeStep, setActiveStep] = useState("step1");

  const {
    isLoading,
    verifications,
    calculations,
    process,
    additional,
    otherCase,
    audit,
  } = useCarbonCalculationData();

  const onEdit = () => {};
  const onDelete = () => {};

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
      href={`/apps/carbon-emission/iscc/projects`}
      titleHeader="All Projects"
      subTitleHeader="All Carbon Calculation"
      menuSidebar={getCarbonCalculationMenu(projectId as string)}
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
        onValueChange={setActiveStep}
        defaultValue="step1"
        className="w-full p-2"
      >
        <div className="overflow-x-auto">
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
            {tabs.map(({ value, data }) => (
              <TabsContent key={value} value={value}>
                <CarbonCalculationView
                  projectId={id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  activeStep={activeStep}
                  data={data as []}
                />
              </TabsContent>
            ))}
          </Fragment>
        )}
      </Tabs>
    </DashboardLayout>
  );
}
