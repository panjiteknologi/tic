import { Label } from "@/components/ui/label";
import { FormCalculationTypes } from "@/types/form-types";
import { Fragment } from "react";

export default function FertilizerInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <Label className="text-lg font-semibold block">3. Fertilizer</Label>

      <div className="mb-2 mx-3">
        <Label className="text-md font-medium text-blue-500 block">
          a) Nitrogen Fertilizer
        </Label>
      </div>

      <div className="mb-2 space-y-4 mx-8">
        {renderInput("Ammonium Nitrate", "ammoniumNitrate", "kg N/ha/yr")}
        {renderInput("Urea", "urea", "kg N/ha/yr")}
        {renderInput(
          "Applied quantity of liquid and solid manure",
          "appliedManure",
          "kg N/ha/yr"
        )}
        {renderInput(
          "N-Content crop residue",
          "nContentCropResidue",
          "kg N/ha/yr"
        )}
        {renderInput(
          "Total N amount from synthetic fertilizer",
          "totalNSyntheticFertilizer",
          "kg N/ha/yr",
          true
        )}
        {renderInput(
          "Emission factor Ammonium nitrate",
          "emissionFactorAmmoniumNitrate",
          "kgCO2eq/kg N"
        )}
        {renderInput(
          "Emission factor Urea",
          "emissionFactorUrea",
          "kgCO2eq/kg N"
        )}
        {renderInput(
          "Emission factor direct N2O emissions",
          "emissionFactorDirectN2O",
          "kgN2O-N/kg N"
        )}
        {renderInput(
          "Fraction of Nsynt that volatiles as NH3, NOx",
          "fractionNVolatilizedSynthetic",
          "kgN/kg N"
        )}
        {renderInput(
          "Fraction of Norg that volatiles as NH3,NOx",
          "fractionNVolatilizedOrganic",
          "kgN/kg N"
        )}
        {renderInput(
          "Emission factor atmospheric deposition",
          "emissionFactorAtmosphericDeposition",
          "kgN20-N/kg N"
        )}
        {renderInput(
          "Fraction of mineralized N, lost via runoff/leaching",
          "fractionNLostRunoff",
          "kgN/kg N"
        )}
        {renderInput(
          "Emission factor leaching/runoff",
          "emissionFactorLeachingRunoff",
          "kgN20-N/kg N"
        )}

        <div className="mb-2">
          <Label className="text-md font-semibold block">
            Fertilizer field N2O-Emissions
          </Label>
        </div>

        {renderInput(
          "Direct N2O-Emissions",
          "directN2OEmissions",
          "kgN2O/ha/yr",
          true
        )}
        {renderInput(
          "Indirect N2O-Emissions from NH3, NOx",
          "indirectN2OEmissionsNH3NOx",
          "kgN2O/ha/yr",
          true
        )}
        {renderInput(
          "Indirect N2O-Emissions from N leaching/ runoff",
          "indirectN2OEmissionsNLeachingRunoff",
          "kgN2O/ha/yr",
          true
        )}
        {renderInput(
          "CO₂eq emissions nitrogen fertilizers",
          "co2eqEmissionsNitrogenFertilizersHaYr",
          "kgCO2eq/ha/yr",
          true
        )}
        {renderInput(
          "CO2eq emissions fertilizer field N2O-Emissions",
          "co2eqEmissionsNitrogenFertilizersTHaYr",
          "kgCO2eq/ha/yr",
          true
        )}
        {renderInput(
          "",
          "co2eqEmissionsNitrogenFertilizersFieldN20TFFB",
          "kgCO2eq/t FFB",
          true
        )}
      </div>
    </Fragment>
  );
}
