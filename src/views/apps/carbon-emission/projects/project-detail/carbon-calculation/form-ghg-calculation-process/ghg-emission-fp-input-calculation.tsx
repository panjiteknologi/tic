import { emissionFactors, ghgFP, ghgFPName } from "@/constant/step-3";
import totalProcessing from "@/constant/step-3/total-processing";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function GHGEmissionFPInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <div>
        <p className="text-sm font-semibold">A. Input amounts</p>
        {Object.entries(ghgFP).map(([key, value]) => (
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
      {Object.entries(ghgFPName).map(([key, value]) => (
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
      <div>
        <p className="text-sm font-semibold">B. Emission Factors</p>
      </div>
      {Object.entries(emissionFactors).map(([key, value]) => (
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
      <div>
        <p className="text-sm font-semibold">
          C. Total processing GHG emissions
        </p>
      </div>
      {Object.entries(totalProcessing).map(([key, value]) => (
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
  );
}
