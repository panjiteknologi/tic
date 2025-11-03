/**
 * IPCC Emission Calculation Helper
 * Implements tier-specific calculation methodologies according to IPCC 2006 Guidelines
 * Updated to match test scenarios and provide advanced calculation logic
 */

export interface EmissionFactor {
  id: string;
  name: string;
  gasType: "CO2" | "CH4" | "N2O" | "HFCs" | "PFCs" | "SF6" | "NF3";
  tier: "TIER_1" | "TIER_2" | "TIER_3";
  value: string;
  unit: string;
  heatingValue?: string | null;
  heatingValueUnit?: string | null;
  applicableCategories?: string | null;
  fuelType?: string | null;
  activityType?: string | null;
  source?: string | null;
}

export interface ActivityData {
  id: string;
  value: string;
  unit: string;
  categoryId: string;
}

export interface EmissionCategory {
  id: string;
  code: string;
  name: string;
  sector: "ENERGY" | "IPPU" | "AFOLU" | "WASTE" | "OTHER";
}

export interface CalculationResult {
  emissionValue: number;
  co2Equivalent: number;
  calculationDetails: {
    method: string;
    formula: string;
    activityValue: number;
    factorValue: number;
    gwpValue: number;
    heatingValue?: number;
    heatingValueUnit?: string;
    energyContent?: number;
    unitConversion?: string;
    tier: "TIER_1" | "TIER_2" | "TIER_3";
    categoryCode: string;
    sector: string;
    gasType: string;
  };
}

export interface QualityIndicator {
  type: "warning" | "error" | "info";
  message: string;
  parameter?: string;
}

export interface HeatingValueData {
  coal: { min: 15; max: 35; default: 25.8; unit: "GJ/ton" };
  oil: { min: 38; max: 45; default: 42.3; unit: "GJ/ton" };
  naturalGas: { min: 48; max: 54; default: 52.2; unit: "GJ/ton" };
  diesel: { min: 42; max: 45; default: 43.0; unit: "GJ/ton" };
  gasoline: { min: 42; max: 46; default: 44.3; unit: "GJ/ton" };
}

/**
 * IPCC Default Heating Values (IPCC 2006 Guidelines)
 */
export const IPCC_HEATING_VALUES: HeatingValueData = {
  coal: { min: 15, max: 35, default: 25.8, unit: "GJ/ton" },
  oil: { min: 38, max: 45, default: 42.3, unit: "GJ/ton" },
  naturalGas: { min: 48, max: 54, default: 52.2, unit: "GJ/ton" },
  diesel: { min: 42, max: 45, default: 43.0, unit: "GJ/ton" },
  gasoline: { min: 42, max: 46, default: 44.3, unit: "GJ/ton" },
};

/**
 * IPCC Default Emission Factors (kg CO2/GJ)
 */
export const IPCC_EMISSION_FACTORS = {
  coal: 94.6, // kg CO2/GJ
  oil: 73.3,
  naturalGas: 56.1,
  diesel: 74.1,
  gasoline: 69.3,
};

/**
 * Legacy validation function for backward compatibility
 * @deprecated Use the new validateCalculationInputs with updated interface
 */
export function validateCalculationInputsLegacy(
  activityValue: number,
  emissionFactor: number,
  heatingValue?: number,
  activityUnit?: string,
  factorUnit?: string
): QualityIndicator[] {
  const indicators: QualityIndicator[] = [];

  // Activity data validation
  if (activityValue <= 0) {
    indicators.push({
      type: "error",
      message: "Activity value must be positive",
      parameter: "activityValue",
    });
  }

  if (activityValue > 1000000) {
    indicators.push({
      type: "warning",
      message: "Very high activity value detected, please verify",
      parameter: "activityValue",
    });
  }

  // Emission factor validation
  if (emissionFactor <= 0) {
    indicators.push({
      type: "error",
      message: "Emission factor must be positive",
      parameter: "emissionFactor",
    });
  }

  // Heating value validation for energy sector
  if (heatingValue !== undefined) {
    if (heatingValue <= 0) {
      indicators.push({
        type: "error",
        message: "Heating value must be positive",
        parameter: "heatingValue",
      });
    }

    // Check against IPCC ranges
    const fuelType = detectFuelType(factorUnit);
    if (fuelType && IPCC_HEATING_VALUES[fuelType as keyof HeatingValueData]) {
      const range = IPCC_HEATING_VALUES[fuelType as keyof HeatingValueData];
      if (heatingValue < range.min || heatingValue > range.max) {
        indicators.push({
          type: "warning",
          message: `Heating value ${heatingValue} outside IPCC range ${range.min}-${range.max} ${range.unit} for ${fuelType}`,
          parameter: "heatingValue",
        });
      }
    }
  }

  // Unit compatibility validation
  if (activityUnit && factorUnit) {
    const compatible = checkUnitCompatibility(activityUnit, factorUnit);
    if (!compatible) {
      indicators.push({
        type: "warning",
        message: `Potential unit mismatch: activity in ${activityUnit}, factor in ${factorUnit}`,
        parameter: "units",
      });
    }
  }

  return indicators;
}

/**
 * Detects fuel type from factor unit or name
 */
function detectFuelType(factorUnit?: string): string | null {
  if (!factorUnit) return null;

  const unit = factorUnit.toLowerCase();
  if (unit.includes("coal")) return "coal";
  if (unit.includes("oil")) return "oil";
  if (unit.includes("gas")) return "naturalGas";
  if (unit.includes("diesel")) return "diesel";
  if (unit.includes("gasoline") || unit.includes("petrol")) return "gasoline";

  return null;
}

/**
 * Checks unit compatibility between activity data and emission factors
 */
function checkUnitCompatibility(
  activityUnit: string,
  factorUnit: string
): boolean {
  const activityBase = extractBaseUnit(activityUnit);
  const factorDenominator = extractDenominator(factorUnit);

  // Common compatible pairs
  const compatiblePairs = [
    ["ton", "kg"],
    ["kg", "ton"],
    ["liter", "l"],
    ["m3", "liter"],
    ["head", "head"],
    ["ha", "ha"],
  ];

  return compatiblePairs.some(
    ([a, b]) =>
      (activityBase.includes(a) && factorDenominator.includes(b)) ||
      (activityBase.includes(b) && factorDenominator.includes(a))
  );
}

/**
 * Extracts base unit from compound units
 */
function extractBaseUnit(unit: string): string {
  return unit.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Extracts denominator from factor units (e.g., "kg_CO2/liter" -> "liter")
 */
function extractDenominator(factorUnit: string): string {
  const parts = factorUnit.split("/");
  return parts.length > 1 ? parts[1].toLowerCase() : "";
}

/**
 * Calculate emissions using IPCC tier-specific methodologies
 * This matches the advanced logic used in test scenarios
 */
export function calculateEmissions(
  activityData: ActivityData,
  emissionFactor: EmissionFactor,
  category: EmissionCategory,
  gwpValue: number
): CalculationResult {
  const activityValue = parseFloat(activityData.value);
  const factorValue = parseFloat(emissionFactor.value);
  let emissionValue: number;
  let calculationDetails: any = {
    activityValue,
    factorValue,
    gwpValue,
    tier: emissionFactor.tier,
    categoryCode: category.code,
    sector: category.sector,
    gasType: emissionFactor.gasType,
  };

  // Tier-specific calculation methods
  if (category.sector === "ENERGY" && emissionFactor.heatingValue) {
    // Energy sector with heating value (TIER 2 & TIER 3)
    const heatingValue = parseFloat(emissionFactor.heatingValue);

    // Check if unit conversion is needed
    let energyContent: number;
    let unitConversion = "";

    if (
      activityData.unit === "ton" &&
      emissionFactor.heatingValueUnit?.includes("/ton")
    ) {
      // Convert fuel mass to energy content
      energyContent = activityValue * heatingValue; // GJ
      unitConversion = `${activityValue} ${activityData.unit} × ${heatingValue} ${emissionFactor.heatingValueUnit} = ${energyContent} GJ`;
    } else if (
      activityData.unit === "m3" &&
      emissionFactor.heatingValueUnit?.includes("/m3")
    ) {
      // Convert fuel volume to energy content
      energyContent = activityValue * heatingValue; // GJ
      unitConversion = `${activityValue} ${activityData.unit} × ${heatingValue} ${emissionFactor.heatingValueUnit} = ${energyContent} GJ`;
    } else if (
      activityData.unit === "liter" &&
      emissionFactor.heatingValueUnit?.includes("/liter")
    ) {
      // Convert fuel volume to energy content
      energyContent = activityValue * heatingValue; // GJ
      unitConversion = `${activityValue} ${activityData.unit} × ${heatingValue} ${emissionFactor.heatingValueUnit} = ${energyContent} GJ`;
    } else {
      // Activity already in energy units (GJ) or no heating value unit conversion needed
      energyContent = activityValue;
      unitConversion = `Activity already in energy units: ${energyContent} GJ`;
    }

    // Special handling for different emission factor units
    if (emissionFactor.unit.includes("/TJ")) {
      // Convert GJ to TJ for factors expressed per TJ
      const energyContentTJ = energyContent / 1000; // GJ to TJ
      emissionValue = energyContentTJ * factorValue;
      unitConversion += ` → ${energyContentTJ} TJ`;
    } else {
      // Standard calculation (factor per GJ)
      emissionValue = energyContent * factorValue;
    }

    // Set calculation details based on tier
    if (emissionFactor.tier === "TIER_3") {
      calculationDetails = {
        ...calculationDetails,
        method: "TIER_3_ENERGY_DETAILED",
        formula:
          "Activity × Heating Value × Emission Factor (facility-specific)",
        heatingValue,
        heatingValueUnit: emissionFactor.heatingValueUnit,
        energyContent,
        unitConversion,
      };
    } else if (emissionFactor.tier === "TIER_2") {
      calculationDetails = {
        ...calculationDetails,
        method: "TIER_2_ENERGY_IMPROVED",
        formula:
          "Activity × Heating Value × Emission Factor (country-specific)",
        heatingValue,
        heatingValueUnit: emissionFactor.heatingValueUnit,
        energyContent,
        unitConversion,
      };
    } else {
      calculationDetails = {
        ...calculationDetails,
        method: "TIER_1_ENERGY_WITH_HV",
        formula: "Activity × Heating Value × Emission Factor",
        heatingValue,
        heatingValueUnit: emissionFactor.heatingValueUnit,
        energyContent,
        unitConversion,
      };
    }
  } else {
    // Standard calculation for non-energy sectors or when heating value not available
    emissionValue = activityValue * factorValue;

    // Set calculation details based on tier
    if (emissionFactor.tier === "TIER_3") {
      calculationDetails = {
        ...calculationDetails,
        method: "TIER_3_DETAILED",
        formula: "Activity × Emission Factor (facility-specific measurements)",
      };
    } else if (emissionFactor.tier === "TIER_2") {
      calculationDetails = {
        ...calculationDetails,
        method: "TIER_2_INTERMEDIATE",
        formula: "Activity × Emission Factor (country/region-specific)",
      };
    } else {
      calculationDetails = {
        ...calculationDetails,
        method: "TIER_1_BASIC",
        formula: "Activity × Emission Factor (IPCC default)",
      };
    }
  }

  // Quality checks
  if (emissionValue < 0) {
    throw new Error("Calculated emission value cannot be negative");
  }

  if (emissionValue > 1000000000) {
    // 1 billion kg threshold
    console.warn(
      `High emission value detected: ${emissionValue} kg for activity ${activityValue} ${activityData.unit}`
    );
  }

  const co2Equivalent = emissionValue * gwpValue;

  return {
    emissionValue,
    co2Equivalent,
    calculationDetails,
  };
}

/**
 * Intelligent emission factor selection based on category and tier preference
 */
export function selectBestEmissionFactor(
  availableFactors: EmissionFactor[],
  categoryCode: string,
  tierPreference: "TIER_1" | "TIER_2" | "TIER_3" | "AUTO" = "AUTO"
): EmissionFactor | null {
  if (availableFactors.length === 0) {
    return null;
  }

  // Filter factors by category if applicable
  const categoryMatchingFactors = availableFactors.filter((factor) => {
    if (!factor.applicableCategories) return false;

    try {
      const applicableCategories = JSON.parse(factor.applicableCategories);
      return applicableCategories.includes(categoryCode);
    } catch {
      return false;
    }
  });

  // Use category-matching factors if available, otherwise use all factors
  const candidateFactors =
    categoryMatchingFactors.length > 0
      ? categoryMatchingFactors
      : availableFactors;

  // If specific tier preference, filter by tier
  if (tierPreference !== "AUTO") {
    const tierSpecificFactors = candidateFactors.filter(
      (factor) => factor.tier === tierPreference
    );
    if (tierSpecificFactors.length > 0) {
      return tierSpecificFactors[0]; // Return first match for the specified tier
    }
  }

  // Auto-select best tier: prefer TIER_3 > TIER_2 > TIER_1
  const tierOrder = ["TIER_3", "TIER_2", "TIER_1"] as const;

  for (const tier of tierOrder) {
    const tierFactors = candidateFactors.filter(
      (factor) => factor.tier === tier
    );
    if (tierFactors.length > 0) {
      return tierFactors[0]; // Return first match for the highest available tier
    }
  }

  // Fallback: return first available factor
  return candidateFactors[0];
}

/**
 * Get calculation uncertainty based on tier
 */
export function getCalculationUncertainty(
  tier: "TIER_1" | "TIER_2" | "TIER_3"
): {
  uncertainty: string;
  qualityLevel: string;
  description: string;
} {
  switch (tier) {
    case "TIER_3":
      return {
        uncertainty: "±15%",
        qualityLevel: "High",
        description:
          "Facility-specific measurements with continuous monitoring",
      };
    case "TIER_2":
      return {
        uncertainty: "±50%",
        qualityLevel: "Medium",
        description: "Country/region-specific factors with improved data",
      };
    case "TIER_1":
    default:
      return {
        uncertainty: "±150%",
        qualityLevel: "Low",
        description: "IPCC default factors for basic estimation",
      };
  }
}

/**
 * Validate calculation inputs - updated to match new interface
 */
export function validateCalculationInputs(
  activityData: ActivityData,
  emissionFactor: EmissionFactor,
  gwpValue: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate activity data
  const activityValue = parseFloat(activityData.value);
  if (isNaN(activityValue) || activityValue < 0) {
    errors.push("Activity value must be a non-negative number");
  }

  if (!activityData.unit || activityData.unit.trim().length === 0) {
    errors.push("Activity unit is required");
  }

  // Validate emission factor
  const factorValue = parseFloat(emissionFactor.value);
  if (isNaN(factorValue)) {
    errors.push("Emission factor value must be a valid number");
  }

  if (!emissionFactor.unit || emissionFactor.unit.trim().length === 0) {
    errors.push("Emission factor unit is required");
  }

  // Validate GWP
  if (isNaN(gwpValue) || gwpValue <= 0) {
    errors.push("GWP value must be a positive number");
  }

  // Validate heating value if present
  if (emissionFactor.heatingValue) {
    const heatingValue = parseFloat(emissionFactor.heatingValue);
    if (isNaN(heatingValue) || heatingValue <= 0) {
      errors.push("Heating value must be a positive number if specified");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets IPCC default heating value for fuel type
 */
export function getIPCCHeatingValue(fuelType: string): number | null {
  const fuel = fuelType.toLowerCase();

  if (fuel.includes("coal")) return IPCC_HEATING_VALUES.coal.default;
  if (fuel.includes("oil")) return IPCC_HEATING_VALUES.oil.default;
  if (fuel.includes("gas")) return IPCC_HEATING_VALUES.naturalGas.default;
  if (fuel.includes("diesel")) return IPCC_HEATING_VALUES.diesel.default;
  if (fuel.includes("gasoline")) return IPCC_HEATING_VALUES.gasoline.default;

  return null;
}

/**
 * Gets IPCC default emission factor for fuel type (kg CO2/GJ)
 */
export function getIPCCEmissionFactor(fuelType: string): number | null {
  const fuel = fuelType.toLowerCase();

  if (fuel.includes("coal")) return IPCC_EMISSION_FACTORS.coal;
  if (fuel.includes("oil")) return IPCC_EMISSION_FACTORS.oil;
  if (fuel.includes("gas")) return IPCC_EMISSION_FACTORS.naturalGas;
  if (fuel.includes("diesel")) return IPCC_EMISSION_FACTORS.diesel;
  if (fuel.includes("gasoline")) return IPCC_EMISSION_FACTORS.gasoline;

  return null;
}

/**
 * Suggests appropriate tier based on data availability and category
 */
export function suggestTier(
  hasCountrySpecificFactors: boolean,
  hasPlantSpecificData: boolean,
  isKeyCategory: boolean,
  categoryCode: string
): "TIER_1" | "TIER_2" | "TIER_3" {
  // Energy sector recommendations
  if (categoryCode.startsWith("1.A")) {
    if (hasPlantSpecificData && isKeyCategory) return "TIER_3";
    if (hasCountrySpecificFactors) return "TIER_2";
    return "TIER_1";
  }

  // General recommendations
  if (isKeyCategory && hasCountrySpecificFactors) return "TIER_2";
  if (hasPlantSpecificData) return "TIER_3";

  return "TIER_1";
}
