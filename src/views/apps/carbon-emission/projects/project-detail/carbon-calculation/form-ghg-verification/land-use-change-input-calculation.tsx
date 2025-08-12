import { Fragment } from "react";
import { FormCalculationTypes } from "@/types/carbon-types";
import { landUseA, landUseB } from "@/constant/step-1";

export default function LandUseChangeInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Parameters for determination of actual carbon stock in soil
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(landUseA).map(([key, value]) => (
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
          Parameters for determination of reference carbon stock in soil
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(landUseB).map(([key, value]) => (
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
