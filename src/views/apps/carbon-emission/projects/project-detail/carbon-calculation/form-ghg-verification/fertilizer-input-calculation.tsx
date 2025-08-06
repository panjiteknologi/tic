import { Label } from "@/components/ui/label";
import fertilizerA from "@/constant/step-1/fertilizer-a";
import fertilizerB from "@/constant/step-1/fertilizer-b";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function FertilizerInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
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

      <div className="mb-2">
        <Label className="text-md font-semibold block">
          Fertilizer field N2O-Emissions
        </Label>
      </div>
      {Object.entries(fertilizerB).map(([key, value]) => (
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
