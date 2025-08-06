"use client";

import { FormCalculationTypes } from "@/types/carbon-types";

export default function GHGEmissionReductionInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {renderInput(
        "Reference value fossil fuel",
        "fossilFuelReference",
        "g CO2e/MJ "
      )}
      {renderInput("Batch 1", "", "%")}
      {renderInput("Batch 2", "", "%")}
      {renderInput("Batch 3", "", "%")}
    </div>
  );
}
