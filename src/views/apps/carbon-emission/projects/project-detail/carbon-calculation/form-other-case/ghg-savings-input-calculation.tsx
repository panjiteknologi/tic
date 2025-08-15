import { ghgCalculation } from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function GHGSavingsInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="mx-5 mb-6">
      <span className="text-sm font-bold">
        Total emissions bioethanol (Raw material: corn from farm)
      </span>
      <div className="space-y-4 mt-3">
        {Object.entries(ghgCalculation).map(([key, value]) => (
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
  );
}
