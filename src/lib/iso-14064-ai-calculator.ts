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

interface Iso14064AICalculationRequest {
  quantity: number;
  unit: string;
  scope: 'Scope1' | 'Scope2' | 'Scope3';
  category: string; // e.g., "Stationary Combustion", "Mobile Combustion", "Purchased Electricity"
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

interface Iso14064AIResponse {
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

export interface Iso14064CalculationResult {
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
 * AI-based ISO 14064-1:2018 Emission Calculator
 * Uses Google Gemini to intelligently select emission factors and calculate emissions
 * according to ISO 14064-1:2018 standard for organizational GHG inventories
 */
export class Iso14064AICalculator {
  /**
   * Build comprehensive prompt for Gemini AI with ISO 14064-1:2018 context
   */
  private static buildPrompt(request: Iso14064AICalculationRequest): string {
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

    const prompt = `You are an expert ISO 14064-1:2018 emission calculation specialist. Your task is to calculate greenhouse gas emissions according to ISO 14064-1:2018 standard for organizational GHG inventories.

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

## ISO 14064-1:2018 SCOPE DEFINITIONS

**Scope 1 (Direct Emissions):**
- Direct emissions from sources owned or controlled by the organization
- Examples: Stationary combustion (boilers, furnaces), Mobile combustion (company vehicles), Process emissions, Fugitive emissions

**Scope 2 (Indirect Emissions from Energy):**
- Indirect emissions from purchased electricity, heat, steam, or cooling
- Examples: Purchased electricity, Purchased heat/steam, Purchased cooling

**Scope 3 (Other Indirect Emissions):**
- All other indirect emissions from activities of the organization
- Examples: Business travel, Employee commuting, Waste disposal, Purchased goods and services, Transportation and distribution, Use of sold products

## GWP VALUES (AR5 - IPCC Fifth Assessment Report)
- CO2: ${GWP_VALUES.CO2}
- CH4: ${GWP_VALUES.CH4}
- N2O: ${GWP_VALUES.N2O}
- HFCs: ${GWP_VALUES.HFCs} (average, varies by compound)
- PFCs: ${GWP_VALUES.PFCs} (average, varies by compound)
- SF6: ${GWP_VALUES.SF6}
- NF3: ${GWP_VALUES.NF3}

## COMMON EMISSION FACTORS (Reference Values)

**Stationary Combustion (Scope 1):**
- Natural Gas: ~2.0 kg CO2/m3 or ~0.2 kg CO2/kWh
- Diesel: ~2.68 kg CO2/liter
- Coal: ~2.4-2.8 kg CO2/kg (varies by type)
- LPG: ~1.5 kg CO2/kg

**Mobile Combustion (Scope 1):**
- Petrol: ~2.31 kg CO2/liter
- Diesel: ~2.68 kg CO2/liter
- Natural Gas (CNG): ~2.0 kg CO2/m3

**Purchased Electricity (Scope 2):**
- Grid average (varies by country): ~0.3-0.8 kg CO2/kWh
- Renewable electricity: ~0 kg CO2/kWh (if certified)

**Business Travel (Scope 3):**
- Air travel (short-haul): ~0.25 kg CO2/km per passenger
- Air travel (long-haul): ~0.15 kg CO2/km per passenger
- Car (petrol): ~0.2 kg CO2/km
- Car (diesel): ~0.17 kg CO2/km
- Train: ~0.04 kg CO2/km per passenger

**Waste Disposal (Scope 3):**
- Landfill: ~0.5-1.0 kg CO2e/kg waste (CH4 emissions)
- Incineration: ~0.3-0.5 kg CO2e/kg waste
- Recycling: ~0.1-0.2 kg CO2e/kg waste

## INSTRUCTIONS

1. **Determine Gas Type:**
   - If gas type is provided, use it
   - Otherwise, determine based on category:
     * Stationary/Mobile Combustion: Typically CO2 (with some CH4 and N2O)
     * Purchased Electricity: CO2 (from grid mix)
     * Waste Landfill: CH4
     * Refrigeration/AC: HFCs
     * Industrial Processes: Varies (CO2, CH4, N2O, HFCs, etc.)

2. **Select or Use Emission Factor:**
   - If emission factor is provided, use it directly
   - Otherwise, select appropriate emission factor based on:
     * Category and activity type
     * Unit matching
     * Scope classification
     * Common industry values from IPCC, DEFRA, or EPA databases

3. **Perform Calculation:**
   - Emission Value (kg gas) = Activity Quantity × Emission Factor
   - Ensure unit consistency (convert if needed)
   - CO2-equivalent = Emission Value × GWP
   - Ensure final emission is in kg and CO2-eq is in kg CO2-equivalent

4. **Determine Calculation Method:**
   - Tier 1: Default emission factors (lowest accuracy)
   - Tier 2: Country/region-specific factors (medium accuracy)
   - Tier 3: Site-specific measurements (highest accuracy)
   - Custom: Organization-specific factors

5. **Provide detailed explanation:**
   - Explain why you chose this gas type and factor
   - Show the calculation steps
   - Note any unit conversions
   - Reference the source of emission factor

## OUTPUT FORMAT (JSON only, no markdown)
Return ONLY a valid JSON object with this exact structure:

{
  "gasType": "CO2" | "CH4" | "N2O" | "HFCs" | "PFCs" | "SF6" | "NF3",
  "emissionFactor": {
    "value": <number>,
    "unit": "string (e.g., kg CO2/kWh, kg CO2/liter)",
    "source": "string (e.g., IPCC 2006, DEFRA 2024, EPA, Custom)",
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
- If emission factor is provided, use it but validate appropriateness`;

    return prompt;
  }

  /**
   * Parse AI response and extract calculation results
   */
  private static parseAIResponse(aiResponse: string): Iso14064AIResponse {
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

      const parsed = JSON.parse(jsonText) as Iso14064AIResponse;

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
    request: Iso14064AICalculationRequest
  ): Promise<Iso14064CalculationResult> {
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

      console.log('🤖 Calling Gemini AI for ISO 14064 calculation...');
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
      const calculationResult: Iso14064CalculationResult = {
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

      console.log('✅ ISO 14064 AI calculation completed:', {
        gasType: calculationResult.gasType,
        emissionValue: calculationResult.emissionValue,
        co2Equivalent: calculationResult.co2Equivalent,
        emissionFactor: calculationResult.emissionFactor.source
      });

      return calculationResult;
    } catch (error) {
      console.error('❌ ISO 14064 AI calculation error:', error);
      throw new Error(
        `ISO 14064 AI calculation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
