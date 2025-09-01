import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationAdd() {
  const [form, setForm] = useState<CarbonFormType>({
    // Emission Factors
    emissionFactorNatGas: "",
    emissionFactorCoal: "",
    emissionFactorElectricity: "",
    emissionFactorSteam: "",

    // Inputs
    naturalGasConsumption: "",
    coalConsumption: "",
    electricityConsumption: "",
    steamConsumption: "",

    // Outputs
    ethanolProduction: "",
    ddgsProduction: "",
    cornOilProduction: "",

    // Process Specific
    processSpecificEmissions: "",
    co2Captured: "",
    co2Stored: "",

    // Source fields
    emissionFactorNatGasSource: "",
    emissionFactorCoalSource: "",
    emissionFactorElectricitySource: "",
    emissionFactorSteamSource: "",
    naturalGasConsumptionSource: "",
    coalConsumptionSource: "",
    electricityConsumptionSource: "",
    steamConsumptionSource: "",
    ethanolProductionSource: "",
    ddgsProductionSource: "",
    cornOilProductionSource: "",
    processSpecificEmissionsSource: "",
    co2CapturedSource: "",
    co2StoredSource: "",
  });

  const handleChange = (key: keyof CarbonFormType, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  return { form, handleChange };
}