import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductInputCalculation from "./infos-input-calculation";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
import EmissionLUCInputCalculation from "./emission-luc-input-calculation";

export default function FormGHGCalculation({
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
              <CardTitle>Emission From Land Use Change LUC (e1)</CardTitle>
            </CardHeader>
            <CardContent>
              <EmissionLUCInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}
