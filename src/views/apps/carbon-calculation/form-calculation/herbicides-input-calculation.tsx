import { Label } from "@/components/ui/label";
import { FormCalculationTypes } from "@/types/form-types";
import { Fragment } from "react";

export default function HerbicidesInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mb-2 mx-3">
        <Label className="text-md font-medium text-blue-500 block">
          b) Herbicides/Pesticides
        </Label>
      </div>
      <div className="space-y-4 mt-4 mx-5">
        {renderInput("Acetochlor", "acetochlor", "kg/ha/yr")}
        {renderInput(
          "Emission factor pesticides",
          "emissionFactorPesticides",
          "kgCO2eq/kg"
        )}
        {renderInput(
          "CO2eq emissions herbicides/pesticides",
          "co2eqEmissionsHerbicidesPesticidesHaYr",
          "kgCO2eq/ha/yr"
        )}

        {renderInput(
          "",
          "co2eqEmissionsHerbicidesPesticidesTFFB",
          "kgCO2eq/t FFB",
          true
        )}
      </div>
    </Fragment>
  );
}
