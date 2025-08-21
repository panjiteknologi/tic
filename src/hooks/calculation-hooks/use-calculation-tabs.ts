import { useState } from "react";
import { useCarbonCalculationData } from "./use-carbon-calculation-data";

export function useCalculationTabs() {
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

  return { isLoading, tabs, activeStep, setActiveStep };
}
