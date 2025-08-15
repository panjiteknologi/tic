import { processSpecificInputs } from "@/constant/step-4";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function ProcessSpecificInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {Object.entries(processSpecificInputs).map(([key, value]) => (
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
