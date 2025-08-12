import {
  allofactor,
  electricity,
  emissionFactor,
  processSpecificInputs,
  steamConsumption,
} from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function ProcessSpecificInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Electricity consumption</span>
        <div className="space-y-4 mt-3">
          {Object.entries(electricity).map(([key, value]) => (
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
        <span className="text-sm font-bold">Steam consumption</span>
        <div className="space-y-4 mt-3">
          {Object.entries(steamConsumption).map(([key, value]) => (
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
        <span className="text-sm font-bold">Process-specific inputs</span>
        <div className="space-y-4 mt-3">
          {Object.entries(processSpecificInputs).map(([key, value]) => (
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
          Emission factors for processing
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(emissionFactor).map(([key, value]) => (
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
          Emissions from process-specific inputs (not allocated)
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(allofactor).map(([key, value]) => (
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
