import { Button } from "@/components/ui/button";
import ProductInputCalculation from "./product-input-calculation";
import RawMaterialsnputCalculation from "./raw-materials-input-calculation";
import { FormCalculationTypes } from "@/types/form-types";
import FertilizerInputCalculation from "./fertilizer-input-calculation";
import HerbicidesInputCalculation from "./herbicides-input-calculation";
import EnergyInputCalculation from "./energy-input-calculation";
import CultivationEmissionInputCalculation from "./cultivation-emission-input-calculation";
import LandUseChangeInputCalculation from "./land-use-change-input-calculation";

export default function FormCalculationView({
  handleSubmit,
  form,
  handleChange,
  renderInput,
}: FormCalculationTypes) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-2">
      <div className="grid gap-2">
        <ProductInputCalculation
          form={form}
          handleChange={handleChange}
          renderInput={renderInput}
        />
        <RawMaterialsnputCalculation
          form={form}
          handleChange={handleChange}
          renderInput={renderInput}
        />
        <FertilizerInputCalculation
          form={form}
          handleChange={handleChange}
          renderInput={renderInput}
        />
      </div>
      <HerbicidesInputCalculation
        form={form}
        handleChange={handleChange}
        renderInput={renderInput}
      />
      <EnergyInputCalculation
        form={form}
        handleChange={handleChange}
        renderInput={renderInput}
      />
      <CultivationEmissionInputCalculation
        form={form}
        handleChange={handleChange}
        renderInput={renderInput}
      />
      <LandUseChangeInputCalculation
        form={form}
        handleChange={handleChange}
        renderInput={renderInput}
      />
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4"
      >
        Submit
      </Button>
    </form>
  );
}
