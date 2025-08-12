import { Fragment } from "react";
import { FormCalculationTypes } from "@/types/carbon-types";
import emissionsLUC from "@/constant/step-2/emissions-luc";
import referenceLandUse from "@/constant/step-2/reference-land-use";
import actualLandUse from "@/constant/step-2/actual-land-use";
import GHGEmissionLUC from "@/constant/step-2/ghg-emission-luc";

export default function EmissionLUCInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <div className="space-y-4 mt-3">
          {Object.entries(emissionsLUC).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">LUC emissions per ton canola</span>
        <div className="space-y-4 mt-3">
          {Object.entries(referenceLandUse).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
          {Object.entries(actualLandUse).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <div className="space-y-4 mt-3">
          {Object.entries(GHGEmissionLUC).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder,
                value.labelColor,
                value.bold
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
