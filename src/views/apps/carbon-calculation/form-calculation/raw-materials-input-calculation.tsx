import { Label } from "@/components/ui/label";
import { FormCalculationTypes } from "@/types/form-types";
import { Fragment } from "react";

export default function RawMaterialsnputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mb-6">
        <div className="flex flex-row items-center align-middle mb-2">
          <Label className="text-lg font-semibold block">
            2. Raw Materials Input
          </Label>
        </div>
        <div className="space-y-4 mt-4 mx-5">
          {renderInput(
            "Amount of corn seeds needed",
            "cornSeedsAmount",
            "kg/ha/yr"
          )}
          {renderInput(
            "Emission factor corn seeds",
            "emissionFactorCornSeeds",
            "kgCO₂eq/kg"
          )}

          {renderInput(
            "CO₂eq emissions raw material input",
            "co2eqEmissionsRawMaterialInputHaYr",
            "kgCO₂eq/ha/yr",
            true
          )}
          {renderInput(
            "",
            "co2eqEmissionsRawMaterialInputTFFB",
            "kgCO₂eq/t FFB",
            true
          )}
        </div>
      </div>
    </Fragment>
  );
}
