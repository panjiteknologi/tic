import { emissionFactors, ghgFP, ghgFPName } from "@/constant/step-3";
import totalProcessing from "@/constant/step-3/total-processing";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function GHGEmissionFPInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">A. Input amounts</span>
        <div className="space-y-4 mt-3">
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
      </div>

      <div className="mx-5 mb-6">
        <div className="space-y-4 mt-3">
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
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">B. Emission Factors</span>
        <div className="space-y-4 mt-3">
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
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          C. Total processing GHG emissions
        </span>
        <div className="space-y-4 mt-3">
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
      </div>
    </Fragment>
  );
}
