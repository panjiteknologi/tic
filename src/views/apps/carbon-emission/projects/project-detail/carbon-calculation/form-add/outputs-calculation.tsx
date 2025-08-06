import outputs from "@/constant/step-4/outputs";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function OutputsCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {Object.entries(outputs).map(([key, value]) => (
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
