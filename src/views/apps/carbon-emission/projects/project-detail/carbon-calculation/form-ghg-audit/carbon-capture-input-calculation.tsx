"use client";

import { FormCalculationTypes } from "@/types/carbon-types";

export default function CarbonCaptureInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {renderInput("CO2 captured", "co2Capture", "kg CO2/yr")}
      {renderInput("CO2e emissions", "co2eEmission", "kg CO2e/t ethanol")}
      {renderInput("", "", "g CO2e/MJ ethanol")}
    </div>
  );
}
