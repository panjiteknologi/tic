import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
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
  const sections = [
    {
      title: "General Infos",
      Component: InfosInputCalculation,
    },
    {
      title: "Raw materials and products",
      Component: RawMaterialsnputCalculation,
    },
    {
      title: "Cultivation emissions",
      Component: CultivationEmissionInputCalculation,
    },
    {
      title: "Upstream transport emissions",
      Component: UpstreamTransportInputCalculation,
    },
    {
      title: "Process-specific emissions",
      Component: ProcessSpecificInputCalculation,
    },
    {
      title: "Conversion and allocation",
      Component: ConversionAllocationInputCalculation,
    },
    {
      title: "Calculation of GHG-savings",
      Component: GHGSavingsInputCalculation,
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
