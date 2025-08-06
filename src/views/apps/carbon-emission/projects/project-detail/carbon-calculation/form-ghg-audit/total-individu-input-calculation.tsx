"use client";

import { FormCalculationTypes } from "@/types/carbon-types";

export default function TotalIndividuInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
      <h4 className="text-md font-semibold">Batch 1</h4>
      {renderInput(
        "Cultivation emissions (eec)",
        "cultivationEEC1",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Processing emissions (ep)",
        "processingEmission1",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Emissions from transport & distribution (etd)",
        "emissionTransportDistributionETD1",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Carbon Capture and Replacement (eCCR)",
        "eCCR1",
        "g CO2e/MJ ethanol"
      )}
      {renderInput("Total emissions", "totalEmissions1", "g CO2e/MJ ethanol")}

      <h4 className="text-md font-semibold">Batch 2</h4>
      {renderInput(
        "Cultivation emissions (eec)",
        "cultivationEEC2",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Processing emissions (ep)",
        "processingEmission2",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Emissions from transport & distribution (etd)",
        "emissionTransportDistributionETD2",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Carbon Capture and Replacement (eCCR)",
        "eCCR2",
        "g CO2e/MJ ethanol"
      )}
      {renderInput("Total emissions", "totalEmissions2", "g CO2e/MJ ethanol")}

      <h4 className="text-md font-semibold">Batch 3</h4>
      {renderInput(
        "Cultivation emissions (eec)",
        "cultivationEEC3",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Processing emissions (ep)",
        "processingEmission3",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Emissions from transport & distribution (etd)",
        "emissionTransportDistributionETD3",
        "g CO2e/MJ ethanol"
      )}
      {renderInput(
        "Carbon Capture and Replacement (eCCR)",
        "eCCR3",
        "g CO2e/MJ ethanol"
      )}
      {renderInput("Total emissions", "totalEmissions3", "g CO2e/MJ ethanol")}
    </div>
  );
}
