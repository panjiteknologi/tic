import { IPCC_EMISSION_FACTORS } from "./ipcc_emisson_factors";
import { IPCC_GWP_VALUES } from "./ipcc_gwp_values";
import { IPCC_EMISSION_CATEGORY } from "./ipcc_emission_category";

export interface EmissionFactor {
  name: string;
  gas_type: string;
  tier: string;
  value: string;
  unit: string;
  source: string;
  applicable_categories: string | null;
  fuel_type: string | null;
  activity_type: string | null;
  heating_value: string | null;
  heating_value_unit: string | null;
}

export interface GWPValue {
  gas_type: string;
  value: string;
  assessment_report: string;
}

export interface EmissionCategory {
  code: string;
  name: string;
  sector: string;
}

export interface CalculationResult {
  emission: number;
  emissionUnit: string;
  co2Equivalent: number;
  factor: EmissionFactor;
  gwp: GWPValue;
  gasType: string;
  tier: string;
  notes: string;
}

export class IPCCConstantsCalculator {
  
  /**
   * Find the best emission factor for a given category and preferences
   */
  static findEmissionFactor(
    categoryCode: string, 
    tier: string = "TIER_1",
    gasType: string = "CO2",
    activityName?: string
  ): EmissionFactor | null {
    
    // 1. Try exact category match with specific criteria
    let candidates = IPCC_EMISSION_FACTORS.filter(factor => 
      factor.gas_type === gasType &&
      factor.tier === tier
    );
    
    // 2. Filter by category-specific rules
    if (categoryCode.startsWith("1.A.1")) {
      // Energy Industries - Power Generation
      candidates = candidates.filter(factor =>
        factor.name.includes("Coal Combustion - Power Generation") ||
        factor.name.includes("Natural Gas Combustion") ||
        factor.name.includes("Oil Combustion")
      );
      
      // Prioritize coal for power generation
      if (activityName?.toLowerCase().includes("coal")) {
        const coalFactors = candidates.filter(f => 
          f.name.includes("Coal Combustion - Power Generation")
        );
        if (coalFactors.length > 0) return coalFactors[0];
      }
      
    } else if (categoryCode.startsWith("1.A.2")) {
      // Manufacturing Industries
      candidates = candidates.filter(factor =>
        factor.name.includes("Manufacturing") ||
        factor.name.includes("Industrial")
      );
      
    } else if (categoryCode.startsWith("1.A.3")) {
      // Transport
      if (categoryCode === "1.A.3.a") {
        // Aviation
        candidates = candidates.filter(factor =>
          factor.name.includes("Aviation") ||
          factor.name.includes("Jet Fuel")
        );
      } else if (categoryCode === "1.A.3.b") {
        // Road Transport
        candidates = candidates.filter(factor =>
          factor.name.includes("Road Transport") ||
          factor.name.includes("Gasoline") ||
          factor.name.includes("Diesel")
        );
      }
      
    } else if (categoryCode.startsWith("2.A")) {
      // Mineral Industry
      candidates = candidates.filter(factor =>
        factor.name.includes("Cement") ||
        factor.name.includes("Lime") ||
        factor.name.includes("Glass")
      );
      
    } else if (categoryCode.startsWith("3.A")) {
      // Livestock
      candidates = candidates.filter(factor =>
        factor.name.includes("Enteric") ||
        factor.name.includes("Manure") ||
        factor.name.includes("Livestock")
      );
      
    } else if (categoryCode.startsWith("3.C")) {
      // Managed Soils (AFOLU)
      if (gasType === "N2O") {
        candidates = candidates.filter(factor =>
          factor.name.includes("Fertilizer") ||
          factor.name.includes("N2O") ||
          factor.name.includes("Managed Soils")
        );
      }
      
    } else if (categoryCode.startsWith("4.A")) {
      // Solid Waste
      candidates = candidates.filter(factor =>
        factor.name.includes("Waste") ||
        factor.name.includes("Landfill") ||
        factor.name.includes("Municipal")
      );
    }
    
    // 3. Return best match or fallback
    if (candidates.length > 0) {
      return candidates[0];
    }
    
    // 4. Fallback to any factor matching gas type and tier
    const fallbackFactors = IPCC_EMISSION_FACTORS.filter(factor =>
      factor.gas_type === gasType &&
      factor.tier === tier
    );
    
    return fallbackFactors.length > 0 ? fallbackFactors[0] : null;
  }
  
  /**
   * Get GWP value for a specific gas type
   */
  static getGWPValue(gasType: string): GWPValue | null {
    return IPCC_GWP_VALUES.find(gwp => gwp.gas_type === gasType) || null;
  }
  
  /**
   * Get category information by code
   */
  static getCategory(categoryCode: string): EmissionCategory | null {
    return IPCC_EMISSION_CATEGORY.find(cat => cat.code === categoryCode) || null;
  }
  
  /**
   * Determine the best gas type for a category
   */
  static getBestGasType(categoryCode: string): string {
    if (categoryCode.startsWith("1.A") || categoryCode.startsWith("1.B")) {
      // Energy sector - primarily CO2
      return "CO2";
    } else if (categoryCode.startsWith("3.A")) {
      // Livestock - primarily CH4
      return "CH4";
    } else if (categoryCode.startsWith("3.C.4") || categoryCode.startsWith("3.C.5")) {
      // Managed soils - N2O
      return "N2O";
    } else if (categoryCode.startsWith("4.A") || categoryCode.startsWith("4.B")) {
      // Waste - primarily CH4
      return "CH4";
    } else if (categoryCode.startsWith("4.D")) {
      // Wastewater - N2O
      return "N2O";
    }
    
    // Default to CO2
    return "CO2";
  }
  
  /**
   * Main calculation function
   */
  static calculate(
    activityValue: number,
    unit: string,
    categoryCode: string,
    tier: string = "TIER_1",
    activityName?: string
  ): CalculationResult | null {
    
    // 1. Determine best gas type for this category
    const gasType = this.getBestGasType(categoryCode);
    
    // 2. Find emission factor
    const factor = this.findEmissionFactor(categoryCode, tier, gasType, activityName);
    if (!factor) {
      throw new Error(`No emission factor found for category ${categoryCode}, tier ${tier}, gas ${gasType}`);
    }
    
    // 3. Get GWP value
    const gwp = this.getGWPValue(gasType);
    if (!gwp) {
      throw new Error(`No GWP value found for gas type ${gasType}`);
    }
    
    // 4. Perform calculation
    const factorValue = parseFloat(factor.value);
    const gwpValue = parseFloat(gwp.value);
    
    // Basic emission calculation: Activity × Emission Factor
    let emission = activityValue * factorValue;
    
    // Handle unit conversions if needed
    if (unit === "ton" && factor.unit.includes("kg")) {
      // Convert tons to kg for calculation
      emission = (activityValue * 1000) * factorValue;
    } else if (unit === "kg" && factor.unit.includes("ton")) {
      // Convert kg to tons for calculation  
      emission = (activityValue / 1000) * factorValue;
    }
    
    // Convert to CO2 equivalent
    const co2Equivalent = emission * gwpValue;
    
    // Create detailed notes
    const notes = `Auto-calculated using ${tier}: Activity (${activityValue} ${unit}) × Emission Factor (${factorValue} ${factor.unit}) × GWP (${gwpValue}) = ${co2Equivalent.toFixed(2)} kg CO2-eq`;
    
    return {
      emission: emission,
      emissionUnit: "kg",
      co2Equivalent: co2Equivalent,
      factor: factor,
      gwp: gwp,
      gasType: gasType,
      tier: tier,
      notes: notes
    };
  }
  
  /**
   * Calculate with specific gas type (override automatic detection)
   */
  static calculateWithGasType(
    activityValue: number,
    unit: string,
    categoryCode: string,
    gasType: string,
    tier: string = "TIER_1",
    activityName?: string
  ): CalculationResult | null {
    
    const factor = this.findEmissionFactor(categoryCode, tier, gasType, activityName);
    if (!factor) {
      throw new Error(`No emission factor found for category ${categoryCode}, tier ${tier}, gas ${gasType}`);
    }
    
    const gwp = this.getGWPValue(gasType);
    if (!gwp) {
      throw new Error(`No GWP value found for gas type ${gasType}`);
    }
    
    const factorValue = parseFloat(factor.value);
    const gwpValue = parseFloat(gwp.value);
    
    let emission = activityValue * factorValue;
    
    // Handle unit conversions
    if (unit === "ton" && factor.unit.includes("kg")) {
      emission = (activityValue * 1000) * factorValue;
    } else if (unit === "kg" && factor.unit.includes("ton")) {
      emission = (activityValue / 1000) * factorValue;
    }
    
    const co2Equivalent = emission * gwpValue;
    
    const notes = `Auto-calculated using ${tier}: Activity (${activityValue} ${unit}) × Emission Factor (${factorValue} ${factor.unit}) × GWP (${gwpValue}) = ${co2Equivalent.toFixed(2)} kg CO2-eq`;
    
    return {
      emission: emission,
      emissionUnit: "kg",
      co2Equivalent: co2Equivalent,
      factor: factor,
      gwp: gwp,
      gasType: gasType,
      tier: tier,
      notes: notes
    };
  }
  
  /**
   * Get available emission factors for a category
   */
  static getAvailableFactors(categoryCode: string): EmissionFactor[] {
    const gasType = this.getBestGasType(categoryCode);
    
    return IPCC_EMISSION_FACTORS.filter(factor => {
      if (categoryCode.startsWith("1.A.1")) {
        return factor.name.includes("Coal") || factor.name.includes("Power Generation");
      } else if (categoryCode.startsWith("1.A.3.b")) {
        return factor.name.includes("Road Transport") || factor.name.includes("Diesel") || factor.name.includes("Gasoline");
      } else if (categoryCode.startsWith("4.A")) {
        return factor.name.includes("Waste") || factor.name.includes("Landfill");
      } else if (categoryCode.startsWith("3.A")) {
        return factor.name.includes("Livestock") || factor.name.includes("Enteric") || factor.name.includes("Manure");
      }
      
      return factor.gas_type === gasType;
    });
  }
  
  /**
   * Validate if a calculation makes sense
   */
  static validateCalculation(result: CalculationResult, categoryCode: string): boolean {
    const category = this.getCategory(categoryCode);
    if (!category) return false;
    
    // Check if gas type makes sense for sector
    if (category.sector === "ENERGY" && !["CO2", "CH4", "N2O"].includes(result.gasType)) {
      return false;
    }
    
    if (category.sector === "AFOLU" && categoryCode.includes("3.A") && result.gasType !== "CH4") {
      return false; // Livestock should be CH4
    }
    
    // Check if emission value is reasonable (not negative, not extremely high)
    if (result.emission < 0 || result.co2Equivalent < 0) {
      return false;
    }
    
    return true;
  }
}