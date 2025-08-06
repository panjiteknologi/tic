import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";
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
              <CardTitle>📦 Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌽 Raw Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <RawMaterialsnputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 Fertilizer (Nitrogen)</CardTitle>
            </CardHeader>
            <CardContent>
              <FertilizerInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧴 Herbicides</CardTitle>
            </CardHeader>
            <CardContent>
              <HerbicidesInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Energy</CardTitle>
            </CardHeader>
            <CardContent>
              <EnergyInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌾 Cultivation Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <CultivationEmissionInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌍 Land Use Change</CardTitle>
            </CardHeader>
            <CardContent>
              <LandUseChangeInputCalculation
                {...{ form, handleChange, renderInput }}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </Fragment>
  );
}
