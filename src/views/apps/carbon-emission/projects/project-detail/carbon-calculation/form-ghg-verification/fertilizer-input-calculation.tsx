import fertilizerA from "@/constant/step-1/fertilizer-a";
import fertilizerB from "@/constant/step-1/fertilizer-b";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function FertilizerInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="mx-5 mb-6">
      <span className="text-sm font-bold">Nitrogen Fertilizer</span>
      <div className="space-y-4 mt-3">
        <Fragment>
          {Object.entries(fertilizerA).map(([key, value]) => (
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

          {Object.entries(fertilizerB).map(([key, value]) => (
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
  );
}
