import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import CultivationEmissionInputCalculation from "./cultivation-emission-input-calculation";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
import GHGEmissionReductionInputCalculation from "./ghg-emission-reduction-input-calculation";
import TotalIndividuInputCalculation from "./total-individu-input-calculation";
import CarbonCaptureInputCalculation from "./carbon-capture-input-calculation";
import ProcessSpecificInputCalculation from "./process-specific-input-calculation";
import FeedstockAllocationInputCalculation from "./feedstock-allocation-input-calculation";

export default function FormGHGAuditCalculation({
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
              <CardTitle>
                Raw materials and products of the ethanol plant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RawMaterialsnputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedstock- and Allocation factor</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedstockAllocationInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cultivation emissions eec</CardTitle>
            </CardHeader>
            <CardContent>
              <CultivationEmissionInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process specific emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessSpecificInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carbon capture and replacement</CardTitle>
            </CardHeader>
            <CardContent>
              <CarbonCaptureInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Total individual emissions and sum of emissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TotalIndividuInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GHG emission reduction potential</CardTitle>
            </CardHeader>
            <CardContent>
              <GHGEmissionReductionInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}
