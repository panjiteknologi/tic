import { coProduct, inputNeeded, product } from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function RawMaterialsnputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <p className="text-sm font-semibold">Production main product</p>
      {Object.entries(product).map(([key, value]) => (
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

      <p className="text-sm font-semibold">Production co-products</p>
      {Object.entries(coProduct).map(([key, value]) => (
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

      <p className="text-sm font-semibold">Total input needed</p>
      {Object.entries(inputNeeded).map(([key, value]) => (
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
