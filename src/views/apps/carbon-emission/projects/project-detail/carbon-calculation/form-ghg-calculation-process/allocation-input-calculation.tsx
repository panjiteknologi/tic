import { allocation } from "@/constant/step-3";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function AllocationInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="space-y-4 mx-5 mb-6">
        {Object.entries(allocation).map(([key, value]) => (
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
    </Fragment>
  );
}
