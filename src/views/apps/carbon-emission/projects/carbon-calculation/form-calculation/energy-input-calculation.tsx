import { Label } from "@/components/ui/label";
import { FormCalculationTypes } from "@/types/form-types";
import { Fragment } from "react";

export default function EnergyInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <Label className="text-lg font-semibold block mr-1 mt-4">4. Energy</Label>

      {/* a) Emissions from electricity consumption */}
      <Fragment>
        <div className="mt-2 mx-5">
          <Label className="text-md font-medium text-blue-500 block">
            a) Emissions from electricity consumption
          </Label>
        </div>
        <div className="space-y-4 mt-4 mx-5">
          {renderInput(
            "Electricity consumption for soil prep",
            "electricityConsumptionSoilPrep",
            "kWh/ha/yr"
          )}
          {renderInput(
            "Emission factor",
            "emissionFactorElectricity",
            "kgCO2eq/kWh"
          )}
          {renderInput(
            "CO2e emissions electricity",
            "co2eEmissionsElectricityYr",
            "kgCO2eq/yr",
            true
          )}
          {renderInput(
            "",
            "co2eEmissionsElectricityTFFB",
            "kgCO2eq/t FFB",
            true
          )}
        </div>
      </Fragment>

      {/* b) Emissions from diesel consumption */}
      <Fragment>
        <div className="mt-6 mx-5">
          <Label className="text-md font-medium text-blue-500 block">
            b) Emissions from diesel consumption
          </Label>
        </div>
        <div className="space-y-4 mt-4 mx-5">
          {renderInput("Diesel consumed", "dieselConsumed", "L/ha/yr")}
          {renderInput(
            "Emission factor diesel",
            "emissionFactorDiesel",
            "kgCO2eq/L"
          )}
          {renderInput(
            "CO2e emissions diesel",
            "co2eEmissionsDieselYr",
            "kgCO2eq/yr",
            true
          )}
          {renderInput("", "co2eEmissionsDieselTFFB", "kgCO2eq/t FFB", true)}
        </div>
      </Fragment>
    </Fragment>
  );
}
