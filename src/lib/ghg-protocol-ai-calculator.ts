import { GoogleGenAI } from '@google/genai';
import { env } from '@/env';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// GWP Values (AR5 - IPCC Fifth Assessment Report)
const GWP_VALUES = {
  CO2: 1,
  CH4: 28,
  N2O: 265,
  HFCs: 1240, // Average for HFCs (varies by compound)
  PFCs: 7390, // Average for PFCs (varies by compound)
  SF6: 22800,
  NF3: 16100
};

interface GhgProtocolAICalculationRequest {
  quantity: number;
  unit: string;
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  category: string; // e.g., "Stationary Combustion", "Purchased Electricity", "Business Travel"
  activityName?: string;
  activityDescription?: string;
  gasType?: 'CO2' | 'CH4' | 'N2O' | 'HFCs' | 'PFCs' | 'SF6' | 'NF3';
  emissionFactor?: {
    value: number;
    unit: string;
    source?: string;
    gasType?: string;
  };
  calculationMethod?: string; // "tier1", "tier2", "tier3", "custom"
}

interface GhgProtocolAIResponse {
  gasType: 'CO2' | 'CH4' | 'N2O' | 'HFCs' | 'PFCs' | 'SF6' | 'NF3';
  emissionFactor: {
    value: number;
    unit: string;
    source: string;
    gasType: string;
  };
  emissionValue: number; // kg gas
  co2Equivalent: number; // kg CO2-eq
  gwpValue: number; // GWP value used
  calculationMethod: string;
  calculationFormula: string;
  explanation: string;
  reasoning: string;
}

export interface GhgProtocolCalculationResult {
  gasType: 'CO2' | 'CH4' | 'N2O' | 'HFCs' | 'PFCs' | 'SF6' | 'NF3';
  emissionFactor: {
    value: number;
    unit: string;
    source: string;
    gasType: string;
  };
  emissionValue: number; // kg gas
  co2Equivalent: number; // kg CO2-eq
  gwpValue: number;
  calculationMethod: string;
  explanation: string;
  reasoning: string;
  formula: string;
}

/**
 * AI-based GHG Protocol Corporate Standard Emission Calculator
 * Uses Google Gemini to intelligently select emission factors and calculate emissions
 * according to GHG Protocol Corporate Accounting and Reporting Standard
 */
export class GhgProtocolAICalculator {
  /**
   * Build comprehensive prompt for Gemini AI with GHG Protocol context
   */
  private static buildPrompt(request: GhgProtocolAICalculationRequest): string {
    const {
      quantity,
      unit,
      scope,
      category,
      activityName,
      activityDescription,
      gasType,
      emissionFactor,
      calculationMethod
    } = request;

    const prompt = `You are an expert GHG Protocol Corporate Standard emission calculation specialist. Your task is to calculate greenhouse gas emissions according to the GHG Protocol Corporate Accounting and Reporting Standard.

## TASK
Calculate emissions for the following activity data:

**Activity Information:**
- Activity Name: ${activityName || 'Not specified'}
- Activity Description: ${activityDescription || 'Not specified'}
- Quantity: ${quantity}
- Unit: ${unit}
- Scope: ${scope}
- Category: ${category}
- Gas Type: ${gasType || 'To be determined'}
- Calculation Method: ${calculationMethod || 'To be determined'}

${
  emissionFactor
    ? `**Provided Emission Factor:**
- Value: ${emissionFactor.value}
- Unit: ${emissionFactor.unit}
- Source: ${emissionFactor.source || 'Not specified'}
- Gas Type: ${emissionFactor.gasType || 'Not specified'}
`
    : ''
}

## GHG PROTOCOL SCOPE DEFINITIONS

**Scope 1 (Direct Emissions):**
- Direct emissions from sources owned or controlled by the organization
- Categories:
  * Stationary Combustion: Boilers, furnaces, generators (Natural gas, diesel, coal, etc.)
  * Mobile Combustion: Company vehicles, fleet (Petrol, diesel, CNG, LPG)
  * Fugitive Emissions: Refrigerant leaks, natural gas leaks, methane from landfills
  * Process Emissions: Industrial processes, chemical reactions, cement production

**Scope 2 (Indirect Emissions from Purchased Energy):**
- Indirect emissions from purchased electricity, heat, steam, or cooling
- Categories:
  * Purchased Electricity: Grid electricity, renewable electricity (if not certified)
  * Purchased Steam: Steam from external sources
  * Purchased Heating: District heating, hot water
  * Purchased Cooling: District cooling, chilled water

**Scope 3 (Other Indirect Emissions):**
- All other indirect emissions from activities of the organization, occurring in the value chain
- 15 Categories:
  1. Purchased Goods and Services: Upstream emissions from purchased products
  2. Capital Goods: Emissions from manufacturing of capital equipment
  3. Fuel and Energy Related Activities: Upstream emissions from fuel extraction/refining
  4. Upstream Transportation and Distribution: Transportation of purchased goods
  5. Waste Generated in Operations: Waste disposal, treatment, recycling
  6. Business Travel: Employee business travel (air, rail, car, hotel)
  7. Employee Commuting: Employee travel to/from work
  8. Upstream Leased Assets: Emissions from assets leased by the organization
  9. Downstream Transportation and Distribution: Transportation of sold products
  10. Processing of Sold Products: Processing of intermediate products sold
  11. Use of Sold Products: Emissions from use of products sold
  12. End of Life Treatment of Sold Products: Waste disposal of sold products
  13. Downstream Leased Assets: Emissions from assets leased to others
  14. Franchises: Emissions from franchise operations
  15. Investments: Emissions from investments (equity, debt)

## GWP VALUES (AR5 - IPCC Fifth Assessment Report)
- CO2: ${GWP_VALUES.CO2}
- CH4: ${GWP_VALUES.CH4}
- N2O: ${GWP_VALUES.N2O}
- HFCs: ${GWP_VALUES.HFCs} (average, varies by compound)
- PFCs: ${GWP_VALUES.PFCs} (average, varies by compound)
- SF6: ${GWP_VALUES.SF6}
- NF3: ${GWP_VALUES.NF3}

## COMMON EMISSION FACTORS (Reference Values)

**Scope 1 - Stationary Combustion:**
- Natural Gas: ~2.0 kg CO2/m3 or ~0.2 kg CO2/kWh
- Diesel: ~2.68 kg CO2/liter
- Coal: ~2.4-2.8 kg CO2/kg (varies by type)
- LPG: ~1.5 kg CO2/kg
- Fuel Oil: ~3.15 kg CO2/liter

**Scope 1 - Mobile Combustion:**
- Petrol: ~2.31 kg CO2/liter
- Diesel: ~2.68 kg CO2/liter
- Natural Gas (CNG): ~2.0 kg CO2/m3
- LPG: ~1.5 kg CO2/kg

**Scope 1 - Fugitive Emissions:**
- Refrigerants (HFCs): Varies by compound (R-134a: ~1430 kg CO2e/kg, R-410A: ~2088 kg CO2e/kg)
- Natural Gas Leaks: ~0.02-0.05 kg CH4/m3 (varies by system)
- Methane from Landfills: ~0.5-1.0 kg CH4/kg waste

**Scope 2 - Purchased Electricity:**
- Grid average (varies by country/region): ~0.3-0.8 kg CO2/kWh
  * USA average: ~0.4 kg CO2/kWh
  * EU average: ~0.3 kg CO2/kWh
  * China average: ~0.7 kg CO2/kWh
  * India average: ~0.8 kg CO2/kWh
- Renewable electricity (certified): ~0 kg CO2/kWh
- Grid emission factors should be location-specific when available

**Scope 3 - Business Travel:**
- Air travel (short-haul): ~0.25 kg CO2/km per passenger
- Air travel (long-haul): ~0.15 kg CO2/km per passenger
- Car (petrol): ~0.2 kg CO2/km
- Car (diesel): ~0.17 kg CO2/km
- Train: ~0.04 kg CO2/km per passenger
- Hotel (per night): ~15-30 kg CO2e

**Scope 3 - Waste Disposal:**
- Landfill: ~0.5-1.0 kg CO2e/kg waste (CH4 emissions)
- Incineration: ~0.3-0.5 kg CO2e/kg waste
- Recycling: ~0.1-0.2 kg CO2e/kg waste
- Composting: ~0.05-0.1 kg CO2e/kg waste

**Scope 3 - Purchased Goods:**
- Varies significantly by product type
- Use spend-based factors when activity-based data unavailable
- Typical range: 0.1-5.0 kg CO2e per unit (varies by product)

## INSTRUCTIONS

1. **Determine Gas Type:**
   - If gas type is provided, use it
   - Otherwise, determine based on category and scope:
     * Scope 1 Stationary/Mobile Combustion: Typically CO2 (with some CH4 and N2O)
     * Scope 1 Fugitive Emissions: CH4 (natural gas leaks), HFCs (refrigerants)
     * Scope 1 Process Emissions: Varies (CO2, CH4, N2O, HFCs, etc.)
     * Scope 2 Purchased Electricity: CO2 (from grid mix)
     * Scope 3 Waste Landfill: CH4
     * Scope 3 Waste Incineration: CO2
     * Scope 3 Refrigeration/AC: HFCs
     * Scope 3 Industrial Processes: Varies

2. **Select or Use Emission Factor:**
   - If emission factor is provided, use it directly (but validate appropriateness)
   - Otherwise, select appropriate emission factor based on:
     * Scope and category classification
     * Activity name and description
     * Unit matching (convert if necessary)
     * Location-specific factors when available (especially for Scope 2 electricity)
     * Common industry values from GHG Protocol, IPCC, DEFRA, EPA, or other recognized databases
   - For Scope 2 electricity, prioritize location-specific grid factors
   - For Scope 3, use activity-based factors when available, spend-based as fallback

3. **Perform Calculation:**
   - Emission Value (kg gas) = Activity Quantity × Emission Factor
   - Ensure unit consistency (convert if needed):
     * 1 ton = 1000 kg
     * 1 m3 ≈ 1000 liter (for water-based conversions)
     * 1 GJ = 277.78 kWh (for energy conversions)
   - CO2-equivalent = Emission Value × GWP
   - Ensure final emission is in kg and CO2-eq is in kg CO2-equivalent

4. **Determine Calculation Method:**
   - Tier 1: Default emission factors (lowest accuracy, broad averages)
   - Tier 2: Country/region-specific factors (medium accuracy, location-specific)
   - Tier 3: Site-specific measurements or supplier-specific data (highest accuracy)
   - Custom: Organization-specific factors or proprietary data

5. **Provide detailed explanation:**
   - Explain why you chose this gas type and factor
   - Show the calculation steps clearly
   - Note any unit conversions performed
   - Reference the source of emission factor (GHG Protocol, IPCC, DEFRA, EPA, etc.)
   - For Scope 2, mention if location-specific factor was used
   - For Scope 3, indicate if activity-based or spend-based approach was used

## OUTPUT FORMAT (JSON only, no markdown)
Return ONLY a valid JSON object with this exact structure:

{
  "gasType": "CO2" | "CH4" | "N2O" | "HFCs" | "PFCs" | "SF6" | "NF3",
  "emissionFactor": {
    "value": <number>,
    "unit": "string (e.g., kg CO2/kWh, kg CO2/liter, kg CO2e/kg)",
    "source": "string (e.g., GHG Protocol, IPCC 2006, DEFRA 2024, EPA, Custom)",
    "gasType": "string"
  },
  "emissionValue": <number in kg gas>,
  "co2Equivalent": <number in kg CO2-eq>,
  "gwpValue": <number (GWP value used)>,
  "calculationMethod": "tier1" | "tier2" | "tier3" | "custom",
  "calculationFormula": "Quantity × Factor × GWP = ...",
  "explanation": "Brief explanation of calculation steps",
  "reasoning": "Why this factor and gas type was selected"
}

**IMPORTANT:** 
- Return ONLY the JSON object, no additional text before or after
- Ensure all numeric values are actual numbers, not strings
- Emission value must be in kg
- CO2-equivalent must use the correct GWP value from the list above
- Be precise with unit conversions
- If emission factor is provided, use it but validate appropriateness
- For Scope 2 electricity, prefer location-specific grid factors when possible
- For Scope 3, indicate the calculation approach (activity-based vs spend-based)`;

    return prompt;
  }

  /**
   * Parse AI response and extract calculation results
   */
  private static parseAIResponse(aiResponse: string): GhgProtocolAIResponse {
    try {
      // Try to extract JSON from response (handle markdown code blocks)
      let jsonText = aiResponse.trim();

      // Remove markdown code blocks if present
      jsonText = jsonText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');

      // Find JSON object in text if there's extra text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText) as GhgProtocolAIResponse;

      // Validate required fields
      if (
        !parsed.gasType ||
        !parsed.emissionFactor ||
        typeof parsed.emissionValue !== 'number' ||
        typeof parsed.co2Equivalent !== 'number' ||
        typeof parsed.gwpValue !== 'number'
      ) {
        throw new Error('Missing or invalid required fields in AI response');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('AI Response text:', aiResponse);
      throw new Error(
        `Failed to parse AI response: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Main calculation function using AI
   */
  static async calculate(
    request: GhgProtocolAICalculationRequest
  ): Promise<GhgProtocolCalculationResult> {
    try {
      // If emission factor is provided, validate and use it
      if (request.emissionFactor) {
        const quantity = request.quantity;
        const factorValue = request.emissionFactor.value;
        const gasType = (request.gasType ||
          request.emissionFactor.gasType ||
          'CO2') as keyof typeof GWP_VALUES;
        const gwpValue = GWP_VALUES[gasType] || 1;

        // Calculate emissions
        const emissionValue = quantity * factorValue; // kg gas
        const co2Equivalent = emissionValue * gwpValue; // kg CO2-eq

        return {
          gasType: gasType as any,
          emissionFactor: {
            value: factorValue,
            unit: request.emissionFactor.unit,
            source: request.emissionFactor.source || 'Provided',
            gasType: gasType
          },
          emissionValue,
          co2Equivalent,
          gwpValue,
          calculationMethod: request.calculationMethod || 'custom',
          explanation: `Calculated using provided emission factor: ${factorValue} ${
            request.emissionFactor.unit
          }. Emission: ${emissionValue.toFixed(
            4
          )} kg ${gasType}, CO2-eq: ${co2Equivalent.toFixed(4)} kg CO2-eq.`,
          reasoning: `Using provided emission factor from ${
            request.emissionFactor.source || 'source'
          }`,
          formula: `CO2-eq = ${quantity} × ${factorValue} × ${gwpValue} = ${co2Equivalent.toFixed(
            4
          )} kg CO2-eq`
        };
      }

      // Otherwise, use AI to determine emission factor
      const prompt = this.buildPrompt(request);

      console.log('🤖 Calling Gemini AI for GHG Protocol calculation...');
      console.log('📋 Request:', {
        quantity: request.quantity,
        unit: request.unit,
        scope: request.scope,
        category: request.category,
        activityName: request.activityName
      });

      // Call Gemini AI
      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const aiText = result.text || '';

      if (!aiText || aiText.trim().length === 0) {
        throw new Error('AI returned empty response');
      }

      console.log('🤖 AI Response received:', aiText.substring(0, 500));

      // Parse AI response
      const aiResult = this.parseAIResponse(aiText);

      // Build calculation result
      const calculationResult: GhgProtocolCalculationResult = {
        gasType: aiResult.gasType,
        emissionFactor: aiResult.emissionFactor,
        emissionValue: aiResult.emissionValue,
        co2Equivalent: aiResult.co2Equivalent,
        gwpValue: aiResult.gwpValue,
        calculationMethod: aiResult.calculationMethod,
        explanation: aiResult.explanation,
        reasoning: aiResult.reasoning,
        formula: aiResult.calculationFormula
      };

      console.log('✅ GHG Protocol AI calculation completed:', {
        gasType: calculationResult.gasType,
        emissionValue: calculationResult.emissionValue,
        co2Equivalent: calculationResult.co2Equivalent,
        emissionFactor: calculationResult.emissionFactor.source,
        scope: request.scope,
        category: request.category
      });

      return calculationResult;
    } catch (error) {
      console.error('❌ GHG Protocol AI calculation error:', error);
      throw new Error(
        `GHG Protocol AI calculation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
