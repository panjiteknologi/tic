import { ghgCalculation } from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function GHGSavingsInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <p className="text-sm font-semibold">
        Total emissions bioethanol (Raw material: corn from farm)
      </p>
      {Object.entries(ghgCalculation).map(([key, value]) => (
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
