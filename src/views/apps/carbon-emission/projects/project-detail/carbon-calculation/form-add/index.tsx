import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
import FactorInputCalculation from "./factor-input-calculation";
import OutputsCalculation from "./outputs-calculation";
import InputsCalculation from "./inputs-calculation";
import ProcessSpecificInputCalculation from "./process-specific-input-calculation";
import EmissionFactors from "./emission-factors";

export default function FormAddViews({
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
              <CardTitle>Input factor</CardTitle>
            </CardHeader>
            <CardContent>
              <FactorInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outputs:</CardTitle>
            </CardHeader>
            <CardContent>
              <OutputsCalculation {...{ form, handleChange, renderInput }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inputs:</CardTitle>
            </CardHeader>
            <CardContent>
              <InputsCalculation {...{ form, handleChange, renderInput }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process specific inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessSpecificInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emission factors</CardTitle>
            </CardHeader>
            <CardContent>
              <EmissionFactors />
            </CardContent>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}
