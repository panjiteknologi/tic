"use client";

import { Fragment } from "react";
import { Label } from "@/components/ui/label";
import { FormCalculationTypes } from "@/types/form-types";

export default function ProductInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mb-6">
        <div className="flex flex-row items-center align-middle mb-2">
          <Label className="text-lg font-semibold block mr-1">
            1. Products -{" "}
          </Label>
          <Label className="text-lg font-medium text-blue-500 block">
            Main Product
          </Label>
        </div>
        <div className="space-y-4 mt-4 mx-5">
          {renderInput("Corn - wet", "cornWet", "t/ha/yr")}
          {renderInput("Moisture content", "moistureContent", "%")}
          {renderInput("Corn - dry", "cornDry", "t/ha/yr", true)}
          {renderInput("Cultivation area", "cultivationArea", "ha")}
        </div>
      </div>
    </Fragment>
  );
}
