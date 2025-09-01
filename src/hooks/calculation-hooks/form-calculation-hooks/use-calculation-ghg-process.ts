import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationGHGProcess() {
  const [form, setForm] = useState<CarbonFormType>({
    // Product
    ethanolOutputDry: "",
    moistureContent: "",
    totalProductionEthanol: "",

    // Raw Materials Bunches FFB
    ffbWetReceipt: "",
    ffbMoistureContent: "",
    ffbDryReceipt: "",

    // Raw Materials
    consumedCornWetYearly: "",
    consumedCornDryYearly: "",
    cornMoistureContent: "",

    // Allocation
    energyContentEthanol: "",
    densityEthanol: "",
    energyContentDdgs: "",
    totalEnergyProducts: "",
    energyAllocationEthanol: "",

    // GHG Emission FP Name
    rawMaterialsEmissions: "",
    transportEmissions: "",
    allocationEmissions: "",
    processingEmissions: "",
    ccsEmissions: "",
    totalGhgEmissions: "",

    // GHG FP
    ghgEmissionEthanol: "",

    // Sustainability
    sustainabilityValue: "",

    // Total Processing
    totalProcessingEmissions: "",

    // Source fields
    ethanolOutputDrySource: "",
    moistureContentSource: "",
    totalProductionEthanolSource: "",
    ffbWetReceiptSource: "",
    ffbMoistureContentSource: "",
    ffbDryReceiptSource: "",
    consumedCornWetYearlySource: "",
    consumedCornDryYearlySource: "",
    cornMoistureContentSource: "",
    energyContentEthanolSource: "",
    densityEthanolSource: "",
    energyContentDdgsSource: "",
    totalEnergyProductsSource: "",
    energyAllocationEthanolSource: "",
    rawMaterialsEmissionsSource: "",
    transportEmissionsSource: "",
    allocationEmissionsSource: "",
    processingEmissionsSource: "",
    ccsEmissionsSource: "",
    totalGhgEmissionsSource: "",
    ghgEmissionEthanolSource: "",
    sustainabilityValueSource: "",
    totalProcessingEmissionsSource: "",
  });

  const handleChange = (key: keyof CarbonFormType, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  return { form, handleChange };
}