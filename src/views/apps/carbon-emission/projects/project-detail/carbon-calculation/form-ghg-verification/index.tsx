import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
import ProductInputCalculation from "./product-input-calculation";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import FertilizerInputCalculation from "./fertilizer-input-calculation";
import HerbicidesInputCalculation from "./herbicides-input-calculation";
import EnergyInputCalculation from "./energy-input-calculation";
import CultivationEmissionInputCalculation from "./cultivation-emission-input-calculation";
import LandUseChangeInputCalculation from "./land-use-change-input-calculation";

export default function FormGHGVerification({
  handleSubmit,
  form,
  handleChange,
  renderInput,
  isSubmitting,
}: FormCalculationTypes) {
  const sections = [
    { title: "Products", Component: ProductInputCalculation },
    { title: "Raw Materials Input", Component: RawMaterialsnputCalculation },
    { title: "Fertilizer", Component: FertilizerInputCalculation },
    { title: "Herbicides", Component: HerbicidesInputCalculation },
    { title: "Energy", Component: EnergyInputCalculation },
    {
      title: "Total Cultivation Emissions",
      Component: CultivationEmissionInputCalculation,
    },
    { title: "Land Use Change", Component: LandUseChangeInputCalculation },
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
