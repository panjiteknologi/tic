import energyA from "@/constant/step-1/energy-a";
import energyB from "@/constant/step-1/energy-b";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function EnergyInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="space-y-4 mx-5 mb-6">
        {Object.entries(energyA).map(([key, value]) => (
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
        {Object.entries(energyB).map(([key, value]) => (
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
