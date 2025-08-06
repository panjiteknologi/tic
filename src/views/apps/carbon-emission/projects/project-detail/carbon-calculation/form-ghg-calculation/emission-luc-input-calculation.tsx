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
      <div className="space-y-4 mx-5 mb-6">
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

      <div className="space-y-4 mx-5 mb-6">
        <h4 className="text-md font-semibold">Reference Land Use (CSR)</h4>
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

        <h4 className="text-md font-semibold mt-6">Actual Land Use (CSA)</h4>
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

      <div className="space-y-4 mx-5 mb-6">
        {Object.entries(GHGEmissionLUC).map(([key, value]) => (
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
    </Fragment>
  );
}
