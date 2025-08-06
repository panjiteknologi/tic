import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import CultivationEmissionInputCalculation from "./cultivation-emission-input-calculation";
import UpstreamTransportInputCalculation from "./upstream-transport-input-calculation";
import ProcessSpecificInputCalculation from "./process-speciific-input-calculation";
import ConversionAllocationInputCalculation from "./conversion-allocation-input-calculation";
import GHGSavingsInputCalculation from "./ghg-savings-input-calculation";
import InfosInputCalculation from "./infos-input-calculation";

export default function FormOtherCaseCalculation({
  handleSubmit,
  form,
  handleChange,
  renderInput,
  isSubmitting,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="flex justify-end sticky top-0 z-10 bg-white">
        <Button
          form="carbon-form"
          type="submit"
          className="text-white font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Calculation"}
        </Button>
      </div>
      <div className="w-full space-y-6 mt-6 mb-6">
        <form
          id="carbon-form"
          onSubmit={handleSubmit}
          className="space-y-6 w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
            <CardContent>
              <InfosInputCalculation {...{ form, handleChange, renderInput }} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Raw materials and products</CardTitle>
            </CardHeader>
            <CardContent>
              <RawMaterialsnputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cultivation emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <CultivationEmissionInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upstream transport emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <UpstreamTransportInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process-specific emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessSpecificInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion and allocation </CardTitle>
            </CardHeader>
            <CardContent>
              <ConversionAllocationInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calculation of GHG-savings</CardTitle>
            </CardHeader>
            <CardContent>
              <GHGSavingsInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}
