import { FormCalculationTypes } from "@/types/carbon-types";

export default function CultivationEmissionInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <h4 className="text-md font-semibold">Batch 1</h4>
      {renderInput("GHG moist", "ghgMoistBatch1", "kg CO2e/moist-t wheat")}
      {renderInput("GHG dry", "ghgDryBatch1", "kg CO2e/dry-t wheat")}
      {renderInput(
        "Allocated cultivation emission",
        "allocatedCultivationEmissionBatch1",
        "g CO2e/MJ ethanol"
      )}

      <h4 className="text-md font-semibold">Batch 2</h4>
      {renderInput(
        "Allocated cultivation emission",
        "allocatedCultivationEmissionBatch2",
        "g CO2e/MJ ethanol"
      )}

      <h4 className="text-md font-semibold">Batch 3</h4>
      {renderInput("GHG moist", "ghgMoistBatch3", "kg CO2e/moist-t wheat")}
      {renderInput("GHG dry", "ghgDryBatch3", "kg CO2e/dry-t wheat")}
      {renderInput(
        "Allocated cultivation emission",
        "allocatedCultivationEmissionBatch3",
        "g CO2e/MJ ethanol"
      )}
    </div>
  );
}
