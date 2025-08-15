import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
import ProductInputCalculation from "./product-input-calculation";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import HerbicidesInputCalculation from "./ghg-emission-fp-input-calculation";
import AllocationInputCalculation from "./allocation-input-calculation";
import SustainabilityInputCalculation from "./sustainability-input-calculation";

export default function FormGHGCalculationProcess({
  handleSubmit,
  form,
  handleChange,
  renderInput,
  isSubmitting,
}: FormCalculationTypes) {
  const sections = [
    {
      title: "Infos",
      Component: ProductInputCalculation,
    },
    {
      title: "Raw Material",
      Component: RawMaterialsnputCalculation,
    },
    {
      title: "GHG emissions from processing (ep)",
      Component: HerbicidesInputCalculation,
    },
    {
      title: "Calculation allocation factor",
      Component: AllocationInputCalculation,
    },
    {
      title:
        "GHG emissions of CPO to be stated on Sustainability Declaration of oil mill",
      Component: SustainabilityInputCalculation,
    },
  ];

  return (
    <Fragment>
      <div className="flex justify-end sticky top-0 z-20 py-3">
        <Button
          form="carbon-form"
          type="submit"
          className="text-white font-semiboldtransition"
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
              className="p-0 shadow-md border border-gray-200 hover:shadow-lg transition duration-300"
            >
              <CardHeader className="rounded-tr-2xl rounded-tl-2xl bg-gradient-to-r from-sky-500 to-sky-700 text-white p-3">
                <CardTitle className="px-2 text-md racking-wide font-bold">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Component
                  form={form}
                  handleChange={handleChange}
                  renderInput={renderInput}
                />
              </CardContent>
            </Card>
          ))}
        </form>
      </div>
    </Fragment>
  );
}
