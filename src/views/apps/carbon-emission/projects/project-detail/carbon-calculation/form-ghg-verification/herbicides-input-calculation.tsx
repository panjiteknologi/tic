import herbicides from "@/constant/step-1/herbicides";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function HerbicidesInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {Object.entries(herbicides).map(([key, value]) => (
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
