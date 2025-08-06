"use client";

import { FormCalculationTypes } from "@/types/carbon-types";

export default function ProcessSpecificInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <h4 className="text-md font-semibold">
        Emissions of electricity consumption
      </h4>
      {renderInput(
        "Electricity for ethanol production",
        "electricityForEthanolProduction",
        "kWh/yr"
      )}
      {renderInput(
        "Electricity for CO2 liquefication",
        "co2LiqueficationElectricity",
        "kWh/yr"
      )}
      {renderInput(
        "Emission factor electricity",
        "emissionFactorElectricity",
        "kg CO2e/kWh"
      )}
      {renderInput(
        "CO2e emissions electricity",
        "co2eElectricity",
        "kg CO2e/yr"
      )}

      <h4 className="text-md font-semibold">Emissions of heat production</h4>
      {renderInput("Heat from natural gas", "heatFromNaturalGas", "MJ/yr")}
      {renderInput(
        "Emission factor natural gas",
        "emissionFactorNaturalGas",
        "kg CO2e/MJ"
      )}
      {renderInput(
        "CO2e emissions heat production",
        "co2eEmissionHeatProduction",
        "kg CO2e/yr"
      )}

      <h4 className="text-md font-semibold">Sum of process emissions</h4>
      {renderInput("CO2e emissions", "co2eEmissions", "kg CO2e/yr")}
      {renderInput("", "co2eEmissionsEtEthanol", "kg CO2e/t ethanol")}
      {renderInput("", "co2eEmissionsMJEthanol", "g CO2eq/MJ ethanol")}
      {renderInput(
        "Allocated processing emissions",
        "allocatedProcessingEmissions",
        "g CO2eq/MJ ethanol"
      )}
    </div>
  );
}
