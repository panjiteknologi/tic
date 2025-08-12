import { coProduct, inputNeeded, product } from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function RawMaterialsnputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Production main product</span>
        <div className="space-y-4 mt-3">
          {Object.entries(product).map(([key, value]) => (
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
        <span className="text-sm font-bold">Production co-products</span>
        <div className="space-y-4 mt-3">
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
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Total input needed</span>
        <div className="space-y-4 mt-3">
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
      </div>
    </Fragment>
  );
}
