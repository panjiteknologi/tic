import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
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
  const sections = [
    { title: "Input Factor", Component: FactorInputCalculation },
    { title: "Outputs", Component: OutputsCalculation },
    { title: "Inputs", Component: InputsCalculation },
    {
      title: "Process Specific Inputs",
      Component: ProcessSpecificInputCalculation,
    },
    { title: "Emission Factors", Component: EmissionFactors },
  ];

  return (
    <Fragment>
      <div className="flex justify-end sticky top-0 z-20 py-3 bg-white">
        <Button
          form="carbon-form"
          type="submit"
          className="text-white font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Calculation"}
        </Button>
      </div>

      <div className="w-full py-6 mx-auto">
        <form id="carbon-form" onSubmit={handleSubmit} className="space-y-6">
          {sections.map(({ title, Component }, idx) => (
            <Card
              key={idx}
              className="p-0 shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <CardHeader className="rounded-t-2xl bg-gradient-to-r from-sky-500 to-sky-700 text-white p-3">
                <CardTitle className="text-md tracking-wide font-bold px-2">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Component {...{ form, handleChange, renderInput }} />
              </CardContent>
            </Card>
          ))}
        </form>
      </div>
    </Fragment>
  );
}
