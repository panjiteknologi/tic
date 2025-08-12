import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import CultivationEmissionInputCalculation from "./cultivation-emission-input-calculation";
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
  const sections = [
    {
      title: "Raw materials and products of the ethanol plant",
      Component: RawMaterialsnputCalculation,
    },
    {
      title: "Feedstock- and Allocation factor",
      Component: FeedstockAllocationInputCalculation,
    },
    {
      title: "Cultivation emissions (eec)",
      Component: CultivationEmissionInputCalculation,
    },
    {
      title: "Process specific emissions",
      Component: ProcessSpecificInputCalculation,
    },
    {
      title: "Carbon capture and replacement",
      Component: CarbonCaptureInputCalculation,
    },
    {
      title: "Total individual emissions and sum of emissions",
      Component: TotalIndividuInputCalculation,
    },
    {
      title: "GHG emission reduction potential",
      Component: GHGEmissionReductionInputCalculation,
    },
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
              className="p-0 shadow-md border border-gray-200 hover:shadow-lg transition duration-300"
            >
              <CardHeader className="rounded-tr-2xl rounded-tl-2xl bg-gradient-to-r from-sky-500 to-sky-700 text-white p-3">
                <CardTitle className="px-2 text-md tracking-wide font-bold">
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
