import { upstream, upstreamTransport } from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function UpstreamTransportInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      {Object.entries(upstream).map(([key, value]) => (
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

      <p className="text-sm font-semibold">Emission factor for transport</p>
      {Object.entries(upstreamTransport).map(([key, value]) => (
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
