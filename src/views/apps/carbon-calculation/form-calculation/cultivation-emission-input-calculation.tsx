import { Label } from "@/components/ui/label";
import { FormCalculationTypes } from "@/types/form-types";
import { Fragment } from "react";

export default function CultivationEmissionInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mb-2">
        <Label className="text-lg font-semibold block">
          5. Total cultivation emissions
        </Label>
      </div>
      <div className="mb-12 space-y-4 mx-5">
        {renderInput(
          "GHG emissions raw material input",
          "ghgEmissionsRawMaterialInput",
          "kg CO2eq/mt FFB"
        )}
        {renderInput(
          "GHG emissions fertilizers",
          "ghgEmissionsFertilizers",
          "kg CO2eq/mt FFB"
        )}
        {renderInput(
          "GHG emissions herbicides/pesticides",
          "ghgEmissionsHerbicidesPesticides",
          "kg CO2eq/mt FFB"
        )}
        {renderInput(
          "GHG emissions energy",
          "ghgEmissionsEnergy",
          "kg CO2eq/mt FFB",
          true
        )}
        {renderInput(
          "Total emissions corn",
          "totalEmissionsCorn",
          "kg CO2eq/t FFB",
          true
        )}
      </div>
    </Fragment>
  );
}
