import {
  applicationETC,
  rawMaterial,
  rawMaterialBunchesFBB,
} from "@/constant/step-3";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function RawMaterialsnputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <p className="text-sm font-semibold">Raw material: </p>
      {Object.entries(rawMaterial).map(([key, value]) => (
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
      <p className="text-sm font-semibold">Raw material: </p>
      {Object.entries(rawMaterialBunchesFBB).map(([key, value]) => (
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
          Application to Cultivation emissions (eec){" "}
        </p>
        {Object.entries(applicationETC).map(([key, value]) => (
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
  );
}
