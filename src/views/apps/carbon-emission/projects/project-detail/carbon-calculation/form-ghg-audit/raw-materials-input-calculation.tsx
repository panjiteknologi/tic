"use client";

import { FormCalculationTypes } from "@/types/carbon-types";

export default function RawMaterialsnputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {renderInput("Main product:", "mainProduct", "t/yr")}
      {renderInput("", "", "MJ/kg")}
      {renderInput("Co-products", "coProducts", "t/yr")}
      {renderInput("", "", "MJ/kg")}
      {renderInput("LHV (dry) corn (example)", "lhwDryCorn", "MJ/kg")}

      <h4 className="text-md font-semibold">Batch 1 of corn</h4>
      {renderInput("Origin", "originBatch1", "")}
      {renderInput("Amount", "amountBatch1", "")}
      {renderInput("Moisture content", "moistureContentBatch1", "%")}
      {renderInput(
        "GHG emission eec",
        "emissionEECatch1",
        "kg CO2e/moist-ton corn"
      )}
      {renderInput("GHG emission etd", "emissionETDatch1", "")}

      <h4 className="text-md font-semibold">Batch 2 of corn</h4>
      {renderInput("Origin", "originBatch2", "")}
      {renderInput("Amount", "amountBatch2", "")}
      {renderInput("Moisture content", "moistureContentBatch2", "%")}
      {renderInput("GHG emission", "emissionGHGBatch2", "")}

      <h4 className="text-md font-semibold">Batch 3 of corn</h4>
      {renderInput("Origin", "originBatch3", "")}
      {renderInput("Amount", "amountBatch3", "")}
      {renderInput("Moisture content", "moistureContentBatch3", "%")}
      {renderInput(
        "GHG emission eec",
        "emissionEECBatch3",
        "kg CO2e/moist-ton corn"
      )}
      {renderInput("GHG emission etd", "emissionETDBatch3", "")}
    </div>
  );
}
