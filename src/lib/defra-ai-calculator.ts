import { GoogleGenAI } from '@google/genai';
import { env } from '@/env';
import { db } from '@/db';
import { defraEmissionFactors } from '@/db/schema/defra-schema';
import { eq, and, or, like } from 'drizzle-orm';
import type { DefraEmissionFactor } from '@/db/schema/defra-schema';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// GWP Values (AR5 - IPCC Fifth Assessment Report)
const GWP_VALUES = {
  CO2: 1,
  CH4: 28,
  N2O: 265
};

interface DefraAICalculationRequest {
  quantity: number;
  unit: string;
  emissionFactorId?: string;
  defraYear: string;
  category?: string;
  activityName?: string;
  level1Category?: string;
  level2Category?: string;
}

interface DefraAIResponse {
  emissionFactorId: string;
  emissionFactorName: string;
  co2Emissions: number; // kg CO2
  ch4Emissions: number; // kg CH4
  n2oEmissions: number; // kg N2O
  totalCo2e: number; // kg CO2e
  calculationFormula: string;
  explanation: string;
  reasoning: string;
}

export interface DefraCalculationResult {
  emissionFactor: DefraEmissionFactor;
  co2Emissions: number; // kg CO2
  ch4Emissions: number; // kg CH4
  n2oEmissions: number; // kg N2O
  totalCo2e: number; // kg CO2e
  explanation: string;
  reasoning: string;
  formula: string;
}

/**
 * AI-based DEFRA Emission Calculator
 * Uses Google Gemini to intelligently select emission factors and calculate emissions
 * according to DEFRA Conversion Factors Database standards
 */
export class DefraAICalculator {
  /**
   * Get emission factors from database for a given year
   */
  private static async getEmissionFactors(
    defraYear: string,
    category?: string,
    unit?: string
  ): Promise<DefraEmissionFactor[]> {
    const conditions = [eq(defraEmissionFactors.year, defraYear)];

    if (category) {
      conditions.push(
        or(
          like(defraEmissionFactors.level1Category, `%${category}%`),
          like(defraEmissionFactors.level2Category, `%${category}%`),
          like(defraEmissionFactors.activityName, `%${category}%`)
        )!
      );
    }

    if (unit) {
      conditions.push(eq(defraEmissionFactors.unit, unit));
    }

    const factors = await db
      .select()
      .from(defraEmissionFactors)
      .where(and(...conditions))
      .limit(50);

    return factors;
  }

  /**
   * Build comprehensive prompt for Gemini AI with DEFRA context
   */
  private static buildPrompt(
    request: DefraAICalculationRequest,
    availableFactors: DefraEmissionFactor[]
  ): string {
    const {
      quantity,
      unit,
      category,
      activityName,
      level1Category,
      level2Category,
      defraYear
    } = request;

    const prompt = `You are an expert DEFRA (Department for Environment, Food and Rural Affairs) emission calculation specialist. Your task is to calculate greenhouse gas emissions according to DEFRA Conversion Factors Database standards.

## TASK
Calculate emissions for the following activity data:

**Activity Information:**
- Activity Name: ${activityName || 'Not specified'}
- Quantity: ${quantity}
- Unit: ${unit}
- Category: ${category || level1Category || 'Not specified'}
- Level 1 Category: ${level1Category || 'Not specified'}
- Level 2 Category: ${level2Category || 'Not specified'}
- DEFRA Year: ${defraYear}

## AVAILABLE EMISSION FACTORS (DEFRA ${defraYear})
${availableFactors
  .map(
    (f, idx) => `
${idx + 1}. ID: ${f.id}
   - Activity Name: ${f.activityName}
   - Level 1: ${f.level1Category}
   - Level 2: ${f.level2Category}
   ${f.level3Category ? `- Level 3: ${f.level3Category}` : ''}
   ${f.level4Category ? `- Level 4: ${f.level4Category}` : ''}
   - Unit: ${f.unit}
   - Unit Type: ${f.unitType}
   - CO2 Factor: ${f.co2Factor} kg CO2/${f.unit}
   - CH4 Factor: ${f.ch4Factor} kg CH4/${f.unit}
   - N2O Factor: ${f.n2oFactor} kg N2O/${f.unit}
   - CO2e Factor: ${f.co2eFactor} kg CO2e/${f.unit}
   ${f.scope ? `- Scope: ${f.scope}` : ''}
`
  )
  .join('')}

## GWP VALUES (AR5 - IPCC Fifth Assessment Report)
- CO2: ${GWP_VALUES.CO2}
- CH4: ${GWP_VALUES.CH4}
- N2O: ${GWP_VALUES.N2O}

## INSTRUCTIONS

1. **Select the most appropriate emission factor:**
   - Match the activity name, category, and unit
   - Prioritize factors with matching unit
   - Consider level1Category and level2Category matches
   - Choose the factor that best matches the activity description
   - If multiple factors match, choose the most specific one

2. **Perform calculation:**
   - CO2 Emissions = Quantity × CO2 Factor
   - CH4 Emissions = Quantity × CH4 Factor
   - N2O Emissions = Quantity × N2O Factor
   - Total CO2e = (CO2 × 1) + (CH4 × ${GWP_VALUES.CH4}) + (N2O × ${
      GWP_VALUES.N2O
    })
   - Alternatively, you can use: Total CO2e = Quantity × CO2e Factor
   - Ensure all emissions are in kg

3. **Provide detailed explanation:**
   - Explain why you chose this factor
   - Show the calculation steps
   - Note any unit conversions if needed

## OUTPUT FORMAT (JSON only, no markdown)
Return ONLY a valid JSON object with this exact structure:

{
  "emissionFactorId": "exact ID from the list above",
  "emissionFactorName": "exact activity name from the list above",
  "co2Emissions": <number in kg CO2>,
  "ch4Emissions": <number in kg CH4>,
  "n2oEmissions": <number in kg N2O>,
  "totalCo2e": <number in kg CO2e>,
  "calculationFormula": "Quantity × Factor = ...",
  "explanation": "Brief explanation of calculation steps",
  "reasoning": "Why this factor was selected"
}

**IMPORTANT:** 
- Return ONLY the JSON object, no additional text before or after
- Ensure all numeric values are actual numbers, not strings
- All emissions must be in kg
- Use the exact emissionFactorId from the list above
- Total CO2e should match: (CO2 × 1) + (CH4 × ${GWP_VALUES.CH4}) + (N2O × ${
      GWP_VALUES.N2O
    })`;

    return prompt;
  }

  /**
   * Parse AI response and extract calculation results
   */
  private static parseAIResponse(aiResponse: string): DefraAIResponse {
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

      const parsed = JSON.parse(jsonText) as DefraAIResponse;

      // Validate required fields
      if (
        !parsed.emissionFactorId ||
        typeof parsed.co2Emissions !== 'number' ||
        typeof parsed.ch4Emissions !== 'number' ||
        typeof parsed.n2oEmissions !== 'number' ||
        typeof parsed.totalCo2e !== 'number'
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
    request: DefraAICalculationRequest
  ): Promise<DefraCalculationResult> {
    try {
      let emissionFactor: DefraEmissionFactor | null = null;

      // If emissionFactorId is provided, use it directly
      if (request.emissionFactorId) {
        const factors = await db
          .select()
          .from(defraEmissionFactors)
          .where(eq(defraEmissionFactors.id, request.emissionFactorId))
          .limit(1);

        if (factors.length === 0) {
          throw new Error(
            `Emission factor with ID ${request.emissionFactorId} not found`
          );
        }

        emissionFactor = factors[0];

        // Validate unit matches
        if (emissionFactor.unit !== request.unit) {
          console.warn(
            `⚠️ Unit mismatch: factor unit is ${emissionFactor.unit}, but request unit is ${request.unit}`
          );
        }

        // Calculate directly without AI
        const quantity = request.quantity;
        const co2Emissions =
          quantity * parseFloat(emissionFactor.co2Factor || '0');
        const ch4Emissions =
          quantity * parseFloat(emissionFactor.ch4Factor || '0');
        const n2oEmissions =
          quantity * parseFloat(emissionFactor.n2oFactor || '0');
        const totalCo2e =
          co2Emissions * GWP_VALUES.CO2 +
          ch4Emissions * GWP_VALUES.CH4 +
          n2oEmissions * GWP_VALUES.N2O;

        return {
          emissionFactor,
          co2Emissions,
          ch4Emissions,
          n2oEmissions,
          totalCo2e,
          explanation: `Calculated using emission factor: ${
            emissionFactor.activityName
          }. CO2: ${co2Emissions.toFixed(4)} kg, CH4: ${ch4Emissions.toFixed(
            4
          )} kg, N2O: ${n2oEmissions.toFixed(4)} kg.`,
          reasoning: `Using provided emission factor ID: ${request.emissionFactorId}`,
          formula: `CO2e = (${quantity} × ${
            emissionFactor.co2Factor
          }) × 1 + (${quantity} × ${emissionFactor.ch4Factor}) × ${
            GWP_VALUES.CH4
          } + (${quantity} × ${emissionFactor.n2oFactor}) × ${
            GWP_VALUES.N2O
          } = ${totalCo2e.toFixed(4)} kg CO2e`
        };
      }

      // Otherwise, get available factors and let AI choose
      const availableFactors = await this.getEmissionFactors(
        request.defraYear,
        request.category || request.level1Category,
        request.unit
      );

      if (availableFactors.length === 0) {
        throw new Error(
          `No emission factors found for year ${request.defraYear}${
            request.category ? ` and category ${request.category}` : ''
          }${request.unit ? ` with unit ${request.unit}` : ''}`
        );
      }

      // Build prompt
      const prompt = this.buildPrompt(request, availableFactors);

      console.log('🤖 Calling Gemini AI for DEFRA calculation...');
      console.log('📋 Request:', {
        quantity: request.quantity,
        unit: request.unit,
        defraYear: request.defraYear,
        category: request.category,
        activityName: request.activityName,
        availableFactorsCount: availableFactors.length
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

      // Find the actual emission factor from database
      emissionFactor =
        availableFactors.find((f) => f.id === aiResult.emissionFactorId) ??
        null;

      if (!emissionFactor) {
        // Try to find by name as fallback
        emissionFactor =
          availableFactors.find(
            (f) => f.activityName === aiResult.emissionFactorName
          ) || null;

        if (!emissionFactor) {
          throw new Error(
            `Emission factor with ID ${aiResult.emissionFactorId} not found in available factors`
          );
        }
      }

      // Verify calculations match (use AI values but validate)
      const quantity = request.quantity;
      const expectedCo2 =
        quantity * parseFloat(emissionFactor.co2Factor || '0');
      const expectedCh4 =
        quantity * parseFloat(emissionFactor.ch4Factor || '0');
      const expectedN2O =
        quantity * parseFloat(emissionFactor.n2oFactor || '0');
      const expectedTotalCo2e =
        expectedCo2 * GWP_VALUES.CO2 +
        expectedCh4 * GWP_VALUES.CH4 +
        expectedN2O * GWP_VALUES.N2O;

      // Use AI values but log if there's a significant difference
      const co2Diff = Math.abs(aiResult.co2Emissions - expectedCo2);
      const ch4Diff = Math.abs(aiResult.ch4Emissions - expectedCh4);
      const n2oDiff = Math.abs(aiResult.n2oEmissions - expectedN2O);
      const totalDiff = Math.abs(aiResult.totalCo2e - expectedTotalCo2e);

      if (
        co2Diff > 0.01 ||
        ch4Diff > 0.01 ||
        n2oDiff > 0.01 ||
        totalDiff > 0.01
      ) {
        console.warn(
          '⚠️ AI calculation differs from expected calculation. Using expected values.'
        );
        console.warn('AI values:', aiResult);
        console.warn('Expected values:', {
          co2Emissions: expectedCo2,
          ch4Emissions: expectedCh4,
          n2oEmissions: expectedN2O,
          totalCo2e: expectedTotalCo2e
        });
      }

      // Build calculation result
      const calculationResult: DefraCalculationResult = {
        emissionFactor,
        co2Emissions: expectedCo2,
        ch4Emissions: expectedCh4,
        n2oEmissions: expectedN2O,
        totalCo2e: expectedTotalCo2e,
        explanation: aiResult.explanation,
        reasoning: aiResult.reasoning,
        formula: aiResult.calculationFormula
      };

      console.log('✅ DEFRA AI calculation completed:', {
        co2Emissions: calculationResult.co2Emissions,
        ch4Emissions: calculationResult.ch4Emissions,
        n2oEmissions: calculationResult.n2oEmissions,
        totalCo2e: calculationResult.totalCo2e,
        emissionFactor: emissionFactor.activityName
      });

      return calculationResult;
    } catch (error) {
      console.error('❌ DEFRA AI calculation error:', error);
      throw new Error(
        `DEFRA AI calculation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
