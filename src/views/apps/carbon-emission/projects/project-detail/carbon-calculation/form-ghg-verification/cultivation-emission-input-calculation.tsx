import cultivation from "@/constant/step-1/cultivation";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function CultivationEmissionInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {Object.entries(cultivation).map(([key, value]) => (
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
