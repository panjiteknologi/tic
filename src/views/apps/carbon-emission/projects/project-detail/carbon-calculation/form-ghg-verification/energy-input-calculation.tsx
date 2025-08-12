import energyA from "@/constant/step-1/energy-a";
import energyB from "@/constant/step-1/energy-b";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function EnergyInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Emissions from electricity consumption
        </span>
        <div className="space-y-4 mt-3">
          <Fragment>
            {Object.entries(energyA).map(([key, value]) => (
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
          </Fragment>
        </div>
      </div>

      <span className="text-sm font-bold">
        Emissions from diesel consumption
      </span>
      <div className="mx-5 mb-6">
        <div className="space-y-4 mt-3">
          {Object.entries(energyB).map(([key, value]) => (
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
