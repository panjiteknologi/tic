import { FormCalculationTypes } from "@/types/carbon-types";

export default function FeedstockAllocationInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <h4 className="text-md font-semibold">Feedstock factor</h4>
      {renderInput("Corn dry", "cornDry", "ton dry per year")}
      {renderInput("Energy content corn", "energyContentCorn", "MJ")}
      {renderInput("Ethanol -dry", "ethanolDry", "ton dry per year")}
      {renderInput("Energy content ethanol", "energyContentEthanol", "MJ")}

      {renderInput("Feedstock factor", "feedstockFactor", "")}

      <h4 className="text-md font-semibold">Allocation factor</h4>
      {renderInput("Ethanol energy content", "ethanolEnergyContent", "MJ")}
      {renderInput("DDGS", "ddgs", "ton per year")}
      {renderInput("Energy content DDGS", "energyContentDDGS", "MJ")}
      {renderInput("Allocation factor", "allocationFactor", "")}
    </div>
  );
}
