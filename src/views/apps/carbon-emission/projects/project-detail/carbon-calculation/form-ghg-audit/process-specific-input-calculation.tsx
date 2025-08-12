"use client";

import {
  electricityConsumption,
  heatProduction,
  processEmission,
} from "@/constant/step-6";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function ProcessSpecificInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Emissions of electricity consumption
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(electricityConsumption).map(([key, value]) => (
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

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Emissions of heat production</span>
        <div className="space-y-4 mt-3">
          {Object.entries(heatProduction).map(([key, value]) => (
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

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Sum of process emissions</span>
        <div className="space-y-4 mt-3">
          {Object.entries(processEmission).map(([key, value]) => (
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
