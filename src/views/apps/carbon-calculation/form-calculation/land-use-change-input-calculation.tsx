import { Fragment } from "react";
import { FormCalculationTypes } from "@/types/form-types";

export default function LandUseChangeInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <label className="text-lg font-semibold block">6. Land Use Change</label>

      <div className="mb-2 mx-3">
        <label className="text-md font-medium text-blue-500 block">
          a) Parameters for determination of actual carbon stock in soil
        </label>
      </div>

      <div className="mb-8 space-y-4 mx-8">
        {renderInput("Actual land use", "actualLandUse", "t/ha/yr")}
        {renderInput("Climate region", "climateRegionActual", "t/ha/yr")}
        {renderInput("Soil type", "soilTypeActual", "t/ha/yr")}
        {renderInput(
          "Current soil management",
          "currentSoilManagementActual",
          "t/ha/yr"
        )}
        {renderInput(
          "Current input to soil",
          "currentInputToSoilActual",
          "t/ha/yr"
        )}
        {renderInput(
          "Actual carbon stock in soil",
          "actualCarbonStockSoil",
          "t/ha/yr"
        )}
        {renderInput("SOCST", "socstActual", "ton C /ha")}
        {renderInput("FLU", "fluActual", "ton C /ha")}
        {renderInput("FMG", "fmgActual", "ton C /ha")}
        {renderInput("FI", "fiActual", "ton C /ha")}
        {renderInput("Cveg", "cvegActual", "ton C /ha")}
      </div>

      <div className="mb-2 mx-3">
        <label className="text-md font-medium text-blue-500 block">
          b) Parameters for determination of reference carbon stock in soil
        </label>
      </div>

      <div className="mb-2 space-y-4 mx-8">
        {renderInput("Reference land use", "referenceLandUse", "t/ha/yr")}
        {renderInput("Climate region", "climateRegionReference", "t/ha/yr")}
        {renderInput("Soil type", "soilTypeReference", "t/ha/yr")}
        {renderInput(
          "Current soil management",
          "currentSoilManagementReference",
          "t/ha/yr"
        )}
        {renderInput(
          "Current input to soil",
          "currentInputToSoilReference",
          "t/ha/yr"
        )}
        {renderInput(
          "Actual carbon stock in soil",
          "actualCarbonStockSoilReference",
          "t/ha/yr"
        )}
        {renderInput("SOCST", "socstReference", "ton C /ha")}
        {renderInput("FLU", "fluReference", "ton C /ha")}
        {renderInput("FMG", "fmgReference", "ton C /ha")}
        {renderInput("FI", "fiReference", "ton C /ha")}
        {renderInput("Cveg", "cvegReference", "ton C /ha")}
        {renderInput(
          "Soil organic carbon actual agricultural practices",
          "soilOrganicCarbonActual",
          "ton C /ha"
        )}
        {renderInput(
          "Soil organic carbon reference agricultural practices",
          "soilOrganicCarbonReference",
          "ton C /ha"
        )}
        {renderInput(
          "Accumulated soil carbon",
          "accumulatedSoilCarbon",
          "ton CO2eq/ha/yr"
        )}
        {renderInput(
          "LUC Carbon emissions per kg corn released in the atmosphere",
          "lucCarbonEmissionsPerKgCorn",
          "kg CO2eq/kg corn"
        )}
        {renderInput(
          "Total LUC carbon emissions released to the atmosphere",
          "totalLUCCO2EmissionsHaYr",
          "kg CO2eq/ha/yr"
        )}
        {renderInput(
          "Total LUC CO2 emissions per ton dry corn",
          "totalLUCCO2EmissionsTDryCorn",
          "kg CO2eq/t dry corn"
        )}
      </div>
    </Fragment>
  );
}
