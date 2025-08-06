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
    <div className="space-y-4 mx-5 mb-6">
      <p className="text-sm font-semibold">Electricity consumption </p>
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

      <p className="text-sm font-semibold">Steam consumption</p>
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

      <p className="text-sm font-semibold">Process-specific inputs</p>
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

      <p className="text-sm font-semibold">Emission factors for processing</p>
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

      <p className="text-sm font-semibold">
        Emissions from process-specific inputs (not allocated)
      </p>
      {Object.entries(allofactor).map(([key, value]) => (
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
