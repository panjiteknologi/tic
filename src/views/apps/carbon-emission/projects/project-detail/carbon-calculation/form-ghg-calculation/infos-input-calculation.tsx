"use client";

import infos from "@/constant/step-2/infos";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function InfosInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
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
  );
}
