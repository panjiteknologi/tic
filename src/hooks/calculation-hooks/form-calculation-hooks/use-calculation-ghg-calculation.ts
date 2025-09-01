import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationGHGCalculation() {
  const [form, setForm] = useState<CarbonFormType>({
    // Infos
    name: "",
    yearOfDetermination: "",
    yieldMainPC: "",
    ddv: "",
    llc: "",

    // Reference Land Use
    referenceLandUse: "",
    climateRegionReferenceLandUse: "",
    soilTypeReferenceLandUse: "",
    soilManagementReferenceLandUse: "",
    soilInputReferenceLandUse: "",

    // Actual Land Use
    actualLandUse: "",
    climateRegionActualLandUse: "",
    soilTypeActualLandUse: "",
    soilManagementActualLandUse: "",
    soilInputActualLandUse: "",

    // Emissions LUC
    socActualLandUse: "",
    socReferenceLandUse: "",
    timeAccumulation: "",
    relativeOrganicMatter: "",
    lucEmissions: "",

    // GHG Emission LUC
    elucEmissions: "",

    // Source fields for all above
    nameSource: "",
    yearOfDeterminationSource: "",
    yieldMainPCSource: "",
    ddvSource: "",
    llcSource: "",
    referenceLandUseSource: "",
    climateRegionReferenceLandUseSource: "",
    soilTypeReferenceLandUseSource: "",
    soilManagementReferenceLandUseSource: "",
    soilInputReferenceLandUseSource: "",
    actualLandUseSource: "",
    climateRegionActualLandUseSource: "",
    soilTypeActualLandUseSource: "",
    soilManagementActualLandUseSource: "",
    soilInputActualLandUseSource: "",
    socActualLandUseSource: "",
    socReferenceLandUseSource: "",
    timeAccumulationSource: "",
    relativeOrganicMatterSource: "",
    lucEmissionsSource: "",
    elucEmissionsSource: "",
  });

  const handleChange = (key: keyof CarbonFormType, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  return { form, handleChange };
}