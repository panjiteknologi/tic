import { Fragment } from "react";
import { FormCalculationTypes } from "@/types/carbon-types";
import landUse from "@/constant/step-1/land-use";

export default function LandUseChangeInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="space-y-4 mx-5 mb-6">
        {Object.entries(landUse).map(([key, value]) => (
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
    </Fragment>
  );
}
