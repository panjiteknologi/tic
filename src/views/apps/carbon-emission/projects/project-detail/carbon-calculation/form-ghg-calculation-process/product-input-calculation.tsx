"use client";

import { coProduct, product } from "@/constant/step-3";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function ProductInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <div>
        <p className="text-sm font-semibold">Main Product:</p>
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
      </div>
      <div>
        <div className="text-sm font-semibold flex flex-row">
          Co-products: <p className="text-red-500">*</p>
        </div>
      </div>
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
  );
}
