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
    <Fragment>
      <div className="mx-5 mb-6">
        <p className="text-sm font-semibold">Raw material: </p>
        <div className="space-y-4 mt-3">
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
        </div>
      </div>

      <div className="mx-5 mb-6">
        <p className="text-sm font-semibold">Raw material: </p>
        <div className="space-y-4 mt-3">
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
        </div>
      </div>

      <div className="mx-5 mb-6">
        <p className="text-sm font-semibold">
          Application to Cultivation emissions (eec){" "}
        </p>
        <div className="space-y-4 mt-3">
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
    </Fragment>
  );
}
