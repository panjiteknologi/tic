import { cultivation1, cultivation2, cultivation3 } from "@/constant/step-6";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function CultivationEmissionInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="space-y-4 mx-5 mb-6">
        <span className="text-sm font-bold">Batch 1</span>
        <div className="space-y-4 mt-3">
          {Object.entries(cultivation1).map(([key, value]) => (
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

      <div className="space-y-4 mx-5 mb-6">
        <span className="text-sm font-bold">Batch 2</span>
        <div className="space-y-4 mt-3">
          {Object.entries(cultivation2).map(([key, value]) => (
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

        <span className="text-sm font-bold">Batch 3</span>
        <div className="mt-2">
          {Object.entries(cultivation3).map(([key, value]) => (
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
