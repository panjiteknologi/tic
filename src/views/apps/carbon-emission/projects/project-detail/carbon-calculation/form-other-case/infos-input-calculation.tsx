import { infos, period } from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function InfosInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="space-y-4 mx-5 mb-6">
        <div className="space-y-4 mt-3">
          {Object.entries(infos).map(([key, value]) => (
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
      </div>

      <div className="space-y-4 mx-5 mb-6">
        <span className="text-sm font-bold">Time period of data input</span>
        <div className="space-y-4 mt-3">
          {Object.entries(period).map(([key, value]) => (
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

        <span className="text-sm font-bold">
          The time frame of data collection should be 12 months. It is
          suggested, if possible, to consider the 12 months prior to the audit
        </span>
      </div>
    </Fragment>
  );
}
