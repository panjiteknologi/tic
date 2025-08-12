import { allocationFactor, feedstockFactor } from "@/constant/step-6";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function FeedstockAllocationInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Feedstock factor</span>
        <div className="space-y-4 mt-3">
          {Object.entries(feedstockFactor).map(([key, value]) => (
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

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Allocation factor</span>
        <div className="space-y-4 mt-3">
          {Object.entries(allocationFactor).map(([key, value]) => (
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
    </Fragment>
  );
}
