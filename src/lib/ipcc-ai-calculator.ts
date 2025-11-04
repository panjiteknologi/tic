import { GoogleGenAI } from '@google/genai';
import { env } from '@/env';
import { IPCC_EMISSION_FACTORS } from '@/constant/ipcc/ipcc_emisson_factors';
import { IPCC_GWP_VALUES } from '@/constant/ipcc/ipcc_gwp_values';
import { IPCC_EMISSION_CATEGORY } from '@/constant/ipcc/ipcc_emission_category';
import type {
  EmissionFactor,
  GWPValue,
  EmissionCategory,
  CalculationResult
} from '@/constant/ipcc/ipcc-constants-calculator';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

interface AICalculationRequest {
  activityValue: number;
  unit: string;
  categoryCode: string;
  tier: string;
  activityName?: string;
  categoryName?: string;
  sector?: string;
}

interface AIResponse {
  emissionFactorName: string;
  gasType: 'CO2' | 'CH4' | 'N2O' | 'HFCs' | 'PFCs' | 'SF6' | 'NF3';
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  emissionValue: number;
  emissionUnit: string;
  co2Equivalent: number;
  calculationFormula: string;
  explanation: string;
  reasoning: string;
}

/**
 * AI-based IPCC Emission Calculator
 * Uses Google Gemini to intelligently select emission factors and calculate emissions
 * according to IPCC 2006 Guidelines for all 43 emission categories
 */
export class IPCCAICalculator {
  /**
   * Build comprehensive prompt for Gemini AI with all context
   */
  private static buildPrompt(request: AICalculationRequest): string {
    const {
      activityValue,
      unit,
      categoryCode,
      tier,
      activityName,
      categoryName,
      sector
    } = request;

    // Find category details
    const category = IPCC_EMISSION_CATEGORY.find(
      (cat) => cat.code === categoryCode
    );
    const categoryDisplayName = categoryName || category?.name || categoryCode;
    const categorySector = sector || category?.sector || 'UNKNOWN';

    // Filter relevant emission factors (limit to reasonable subset for prompt)
    const relevantFactors = IPCC_EMISSION_FACTORS.filter((factor) => {
      // Check if category matches via applicable_categories (JSON array string)
      let matchesApplicableCategory = false;
      const applicableCategoriesStr = factor.applicable_categories;
      if (applicableCategoriesStr) {
        // Parse as JSON array if possible, otherwise check as substring
        try {
          const parsed = JSON.parse(applicableCategoriesStr);
          if (Array.isArray(parsed)) {
            matchesApplicableCategory = parsed.includes(categoryCode);
          }
        } catch {
          // If not valid JSON, check if string contains the category code
          // Type assertion needed because TypeScript loses narrowing in catch blocks
          matchesApplicableCategory = (
            applicableCategoriesStr as string
          ).includes(categoryCode);
        }
      }

      // Include factors that match the category or are general purpose
      const matchesCategory =
        matchesApplicableCategory ||
        factor.name.toLowerCase().includes(categoryDisplayName.toLowerCase()) ||
        (categoryCode.startsWith('1.A') &&
          (factor.name.includes('Coal') ||
            factor.name.includes('Gas') ||
            factor.name.includes('Energy'))) ||
        (categoryCode.startsWith('1.A.3') &&
          (factor.name.includes('Transport') ||
            factor.name.includes('Road') ||
            factor.name.includes('Aviation'))) ||
        (categoryCode.startsWith('2.A') &&
          (factor.name.includes('Cement') ||
            factor.name.includes('Lime') ||
            factor.name.includes('Mineral'))) ||
        (categoryCode.startsWith('3.A') &&
          (factor.name.includes('Livestock') ||
            factor.name.includes('Enteric') ||
            factor.name.includes('Manure'))) ||
        (categoryCode.startsWith('3.C') &&
          (factor.name.includes('Fertilizer') ||
            factor.name.includes('N2O') ||
            factor.name.includes('Soil'))) ||
        (categoryCode.startsWith('4.A') &&
          (factor.name.includes('Waste') ||
            factor.name.includes('Landfill'))) ||
        (categoryCode.startsWith('4.D') &&
          (factor.name.includes('Wastewater') || factor.name.includes('N2O')));

      // Prioritize the requested tier
      const matchesTier = factor.tier === tier || factor.tier === 'TIER_1';

      return matchesCategory || matchesTier;
    }).slice(0, 50); // Limit to 50 most relevant factors to avoid token limit

    // Build prompt
    const prompt = `You are an expert IPCC (Intergovernmental Panel on Climate Change) emission calculation specialist. Your task is to calculate greenhouse gas emissions according to IPCC 2006 Guidelines and 2019 Refinement.

## TASK
Calculate emissions for the following activity data:

**Emission Category:**
- Code: ${categoryCode}
- Name: ${categoryDisplayName}
- Sector: ${categorySector}

**Activity Data:**
- Name: ${activityName || 'Not specified'}
- Value: ${activityValue}
- Unit: ${unit}
- Preferred Tier: ${tier}

## AVAILABLE EMISSION FACTORS
${relevantFactors
  .map(
    (f, idx) => `
${idx + 1}. Name: ${f.name}
   - Gas Type: ${f.gas_type}
   - Tier: ${f.tier}
   - Value: ${f.value} ${f.unit}
   - Source: ${f.source || 'IPCC 2006 Guidelines'}
   ${f.fuel_type ? `- Fuel Type: ${f.fuel_type}` : ''}
   ${f.activity_type ? `- Activity Type: ${f.activity_type}` : ''}
   ${
     f.heating_value
       ? `- Heating Value: ${f.heating_value} ${f.heating_value_unit || ''}`
       : ''
   }
`
  )
  .join('')}

## GWP VALUES (AR5 - IPCC Fifth Assessment Report)
${IPCC_GWP_VALUES.map((gwp) => `- ${gwp.gas_type}: ${gwp.value}`).join('\n')}

## INSTRUCTIONS

1. **Select the most appropriate emission factor:**
   - Match the category code, activity name, and unit
   - Prioritize the requested tier (${tier}), but consider TIER_1 as fallback
   - For energy sectors (1.A.x), consider heating values if available
   - For waste sectors (4.x), CH4 is typical
   - For agriculture (3.A.x), CH4 is typical for livestock
   - For managed soils (3.C.4, 3.C.5), N2O is typical
   - Choose the factor that best matches the activity description

2. **Determine gas type:**
   - Energy sectors (1.A, 1.B): Typically CO2, but CH4 for fugitive emissions
   - Livestock (3.A): CH4
   - Managed soils (3.C.4, 3.C.5): N2O
   - Waste landfills (4.A): CH4
   - Wastewater (4.D): N2O or CH4
   - Industrial processes (2.x): Varies (CO2, CH4, N2O, HFCs, etc.)

3. **Perform calculation:**
   - Convert units if necessary (ton ↔ kg, liter ↔ m3, etc.)
   - Apply formula: Emission = Activity Value × Emission Factor
   - For energy with heating value: Emission = Activity Value × Heating Value × Emission Factor
   - Convert to CO2-equivalent: CO2-eq = Emission × GWP
   - Ensure final emission is in kg and CO2-eq is in kg CO2-equivalent

4. **Provide detailed explanation:**
   - Explain why you chose this factor
   - Show the calculation steps
   - Note any unit conversions

## OUTPUT FORMAT (JSON only, no markdown)
Return ONLY a valid JSON object with this exact structure:

{
  "emissionFactorName": "exact name from the list above",
  "gasType": "CO2" | "CH4" | "N2O" | "HFCs" | "PFCs" | "SF6" | "NF3",
  "tier": "TIER_1" | "TIER_2" | "TIER_3",
  "emissionValue": <number in kg>,
  "emissionUnit": "kg",
  "co2Equivalent": <number in kg CO2-eq>,
  "calculationFormula": "Activity × Factor × GWP = ...",
  "explanation": "Brief explanation of calculation steps",
  "reasoning": "Why this factor was selected"
}

**IMPORTANT:** 
- Return ONLY the JSON object, no additional text before or after
- Ensure all numeric values are actual numbers, not strings
- Emission value must be in kg
- CO2-equivalent must use the correct GWP value from the list above
- Be precise with unit conversions (1 ton = 1000 kg, 1 m3 ≈ 1000 liter for water-based conversions)`;

    return prompt;
  }

  /**
   * Parse AI response and extract calculation results
   */
  private static parseAIResponse(aiResponse: string): AIResponse {
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

      const parsed = JSON.parse(jsonText) as AIResponse;

      // Validate required fields
      if (!parsed.emissionFactorName || !parsed.gasType || !parsed.tier) {
        throw new Error('Missing required fields in AI response');
      }

      // Validate numeric values
      if (
        typeof parsed.emissionValue !== 'number' ||
        typeof parsed.co2Equivalent !== 'number'
      ) {
        throw new Error('Emission values must be numbers');
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
   * Find emission factor from constants by name
   */
  private static findEmissionFactorByName(
    factorName: string,
    gasType: string,
    tier: string
  ): EmissionFactor | null {
    // Try exact match first
    let factor = IPCC_EMISSION_FACTORS.find(
      (f) => f.name === factorName && f.gas_type === gasType && f.tier === tier
    );

    // Try without tier requirement
    if (!factor) {
      factor = IPCC_EMISSION_FACTORS.find(
        (f) => f.name === factorName && f.gas_type === gasType
      );
    }

    // Try partial name match
    if (!factor) {
      factor = IPCC_EMISSION_FACTORS.find(
        (f) => f.name.includes(factorName) || factorName.includes(f.name)
      );
    }

    return factor || null;
  }

  /**
   * Main calculation function using AI
   */
  static async calculate(
    activityValue: number,
    unit: string,
    categoryCode: string,
    tier: string = 'TIER_1',
    activityName?: string
  ): Promise<CalculationResult> {
    try {
      // Find category details
      const category = IPCC_EMISSION_CATEGORY.find(
        (cat) => cat.code === categoryCode
      );
      if (!category) {
        throw new Error(
          `Category ${categoryCode} not found in IPCC categories`
        );
      }

      // Build request
      const request: AICalculationRequest = {
        activityValue,
        unit,
        categoryCode,
        tier,
        activityName,
        categoryName: category.name,
        sector: category.sector
      };

      // Build prompt
      const prompt = this.buildPrompt(request);

      console.log('🤖 Calling Gemini AI for IPCC calculation...');
      console.log('📋 Request:', {
        categoryCode,
        activityName,
        activityValue,
        unit,
        tier
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

      // Find the actual emission factor from constants
      const emissionFactor = this.findEmissionFactorByName(
        aiResult.emissionFactorName,
        aiResult.gasType,
        aiResult.tier
      );

      if (!emissionFactor) {
        console.warn(
          `⚠️ Could not find exact emission factor: ${aiResult.emissionFactorName}, using AI values`
        );

        // Create a synthetic factor based on AI response
        const syntheticFactor: EmissionFactor = {
          name: aiResult.emissionFactorName,
          gas_type: aiResult.gasType,
          tier: aiResult.tier,
          value: String(aiResult.emissionValue / activityValue), // Approximate factor value
          unit: `${aiResult.gasType}/${unit}`,
          source: 'AI-selected based on IPCC Guidelines',
          applicable_categories: categoryCode,
          fuel_type: null,
          activity_type: null,
          heating_value: null,
          heating_value_unit: null
        };

        // Get GWP value
        const gwp = IPCC_GWP_VALUES.find(
          (g) => g.gas_type === aiResult.gasType
        );
        if (!gwp) {
          throw new Error(
            `GWP value not found for gas type ${aiResult.gasType}`
          );
        }

        return {
          emission: aiResult.emissionValue,
          emissionUnit: aiResult.emissionUnit,
          co2Equivalent: aiResult.co2Equivalent,
          factor: syntheticFactor,
          gwp: gwp,
          gasType: aiResult.gasType,
          tier: aiResult.tier,
          notes: `${aiResult.explanation}\n\nAI Reasoning: ${aiResult.reasoning}\n\nFormula: ${aiResult.calculationFormula}`
        };
      }

      // Get GWP value
      const gwp = IPCC_GWP_VALUES.find((g) => g.gas_type === aiResult.gasType);
      if (!gwp) {
        throw new Error(`GWP value not found for gas type ${aiResult.gasType}`);
      }

      // Build calculation result
      const calculationResult: CalculationResult = {
        emission: aiResult.emissionValue,
        emissionUnit: aiResult.emissionUnit,
        co2Equivalent: aiResult.co2Equivalent,
        factor: emissionFactor,
        gwp: gwp,
        gasType: aiResult.gasType,
        tier: aiResult.tier,
        notes: `${aiResult.explanation}\n\nAI Reasoning: ${aiResult.reasoning}\n\nFormula: ${aiResult.calculationFormula}\n\nFactor: ${emissionFactor.name} (${emissionFactor.value} ${emissionFactor.unit})`
      };

      console.log('✅ AI calculation completed:', {
        emission: calculationResult.emission,
        co2Equivalent: calculationResult.co2Equivalent,
        gasType: calculationResult.gasType,
        tier: calculationResult.tier
      });

      return calculationResult;
    } catch (error) {
      console.error('❌ AI calculation error:', error);
      throw new Error(
        `AI calculation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
