import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductInputCalculation from "./product-input-calculation";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import HerbicidesInputCalculation from "./ghg-emission-fp-input-calculation";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
import AllofactorInputCalculation from "./allofactor-input-calculation";
import SustainabilityInputCalculation from "./sustainability-input-calculation";

export default function FormGHGCalculationProcess({
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
              <CardTitle>Infos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw Material</CardTitle>
            </CardHeader>
            <CardContent>
              <RawMaterialsnputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GHG emissions from processing (e2)</CardTitle>
            </CardHeader>
            <CardContent>
              <HerbicidesInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calculation allocation factor</CardTitle>
            </CardHeader>
            <CardContent>
              <AllofactorInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                GHG emissions of CPO to be stated on Sustainability Declaration
                of oil mill
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SustainabilityInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}
