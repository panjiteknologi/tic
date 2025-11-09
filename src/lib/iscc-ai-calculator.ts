import { GoogleGenAI } from '@google/genai';
import { env } from '@/env';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

interface ISCCProjectData {
  name: string;
  productType: string;
  feedstockType: string;
  productionVolume?: string | null; // ton/year
  lhv?: string | null; // MJ/kg
  lhvUnit?: string | null; // MJ/kg or MJ/liter
}

interface ISCCCultivationData {
  landArea?: string | null; // hectare
  yield?: string | null; // ton/ha
  nitrogenFertilizer?: string | null; // kg/ha
  phosphateFertilizer?: string | null; // kg/ha
  potassiumFertilizer?: string | null; // kg/ha
  organicFertilizer?: string | null; // kg/ha
  dieselConsumption?: string | null; // liter/ha
  electricityUse?: string | null; // kWh/ha
  pesticides?: string | null; // kg/ha
  additionalData?: any;
}

interface ISCCProcessingData {
  electricityUse?: string | null; // kWh
  steamUse?: string | null; // ton
  naturalGasUse?: string | null; // m3
  dieselUse?: string | null; // liter
  methanol?: string | null; // kg
  catalyst?: string | null; // kg
  acid?: string | null; // kg
  waterConsumption?: string | null; // m3
  additionalData?: any;
}

interface ISCCTransportData {
  feedstockDistance?: string | null; // km
  feedstockMode?: string | null;
  feedstockWeight?: string | null; // ton
  productDistance?: string | null; // km
  productMode?: string | null;
  productWeight?: string | null; // ton
  additionalTransport?: any;
}

interface ISCCCalculationRequest {
  project: ISCCProjectData;
  cultivation: ISCCCultivationData;
  processing: ISCCProcessingData;
  transport: ISCCTransportData;
}

interface ISCCAIResponse {
  // Intermediate results (kg CO2)
  eecKg: number;
  epKg: number;
  etdKg: number;
  elKg?: number; // optional
  eccrKg?: number; // optional
  totalKg: number;

  // Final results (g CO2eq/MJ)
  eec: number; // g CO2eq/MJ
  ep: number;
  etd: number;
  el?: number; // optional
  eccr?: number; // optional
  totalEmissions: number; // g CO2eq/MJ

  // GHG Savings
  fossilFuelBaseline: number; // g CO2eq/MJ (default: 83.8 for diesel/gasoline)
  ghgSavings: number; // percentage

  // Detailed breakdown
  breakdown: {
    eec: {
      description: string;
      components: Array<{
        name: string;
        value: number;
        unit: string;
        emission: number; // kg CO2
      }>;
      totalKg: number;
      totalGPerMJ: number;
    };
    ep: {
      description: string;
      components: Array<{
        name: string;
        value: number;
        unit: string;
        emission: number; // kg CO2
      }>;
      totalKg: number;
      totalGPerMJ: number;
    };
    etd: {
      description: string;
      components: Array<{
        name: string;
        value: number;
        unit: string;
        emission: number; // kg CO2
      }>;
      totalKg: number;
      totalGPerMJ: number;
    };
    el?: {
      description: string;
      value: number;
      totalKg: number;
      totalGPerMJ: number;
    };
    eccr?: {
      description: string;
      value: number;
      totalKg: number;
      totalGPerMJ: number;
    };
  };

  // Calculation details
  explanation: string;
  methodology: string;
  assumptions: string[];
}

export interface ISCCCalculationResult {
  // Intermediate results (kg CO2)
  eecKg: number;
  epKg: number;
  etdKg: number;
  elKg?: number;
  eccrKg?: number;
  totalKg: number;

  // Final results (g CO2eq/MJ)
  eec: number;
  ep: number;
  etd: number;
  el?: number;
  eccr?: number;
  totalEmissions: number;

  // GHG Savings
  fossilFuelBaseline: number;
  ghgSavings: number;

  // Detailed breakdown
  breakdown: any;

  // Metadata
  explanation: string;
  methodology: string;
  assumptions: string[];
}

/**
 * AI-based ISCC GHG Calculator
 * Uses Google Gemini to calculate GHG emissions according to ISCC PLUS GHG 205 standard
 */
export class ISCCAICalculator {
  /**
   * Build comprehensive prompt for Gemini AI with ISCC GHG 205 context
   */
  private static buildPrompt(request: ISCCCalculationRequest): string {
    const { project, cultivation, processing, transport } = request;

    // Validate LHV is present
    if (!project.lhv) {
      throw new Error('LHV (Lower Heating Value) is required for ISCC calculation');
    }

    const lhv = parseFloat(project.lhv);
    const lhvUnit = project.lhvUnit || 'MJ/kg';
    const productionVolume = project.productionVolume
      ? parseFloat(project.productionVolume)
      : null;

    // Build prompt
    const prompt = `You are an expert ISCC (International Sustainability and Carbon Certification) GHG calculation specialist. Your task is to calculate greenhouse gas emissions according to ISCC PLUS GHG 205 standard (Greenhouse Gas Emissions).

## TASK
Calculate ISCC GHG emissions for a biofuel/biomass project with the following data:

**Project Information:**
- Name: ${project.name}
- Product Type: ${project.productType}
- Feedstock Type: ${project.feedstockType}
- Production Volume: ${productionVolume ? `${productionVolume} ton/year` : 'Not specified'}
- Lower Heating Value (LHV): ${lhv} ${lhvUnit}

**Cultivation Data (EEC - Emissions from extraction/cultivation):**
- Land Area: ${cultivation.landArea || 'Not specified'} hectare
- Yield: ${cultivation.yield || 'Not specified'} ton/ha
- Nitrogen Fertilizer: ${cultivation.nitrogenFertilizer || 'Not specified'} kg/ha
- Phosphate Fertilizer: ${cultivation.phosphateFertilizer || 'Not specified'} kg/ha
- Potassium Fertilizer: ${cultivation.potassiumFertilizer || 'Not specified'} kg/ha
- Organic Fertilizer: ${cultivation.organicFertilizer || 'Not specified'} kg/ha
- Diesel Consumption: ${cultivation.dieselConsumption || 'Not specified'} liter/ha
- Electricity Use: ${cultivation.electricityUse || 'Not specified'} kWh/ha
- Pesticides: ${cultivation.pesticides || 'Not specified'} kg/ha

**Processing Data (EP - Emissions from processing):**
- Electricity Use: ${processing.electricityUse || 'Not specified'} kWh
- Steam Use: ${processing.steamUse || 'Not specified'} ton
- Natural Gas Use: ${processing.naturalGasUse || 'Not specified'} m3
- Diesel Use: ${processing.dieselUse || 'Not specified'} liter
- Methanol: ${processing.methanol || 'Not specified'} kg
- Catalyst: ${processing.catalyst || 'Not specified'} kg
- Acid: ${processing.acid || 'Not specified'} kg
- Water Consumption: ${processing.waterConsumption || 'Not specified'} m3

**Transport Data (ETD - Emissions from transport and distribution):**
- Feedstock Distance: ${transport.feedstockDistance || 'Not specified'} km
- Feedstock Mode: ${transport.feedstockMode || 'Not specified'}
- Feedstock Weight: ${transport.feedstockWeight || 'Not specified'} ton
- Product Distance: ${transport.productDistance || 'Not specified'} km
- Product Mode: ${transport.productMode || 'Not specified'}
- Product Weight: ${transport.productWeight || 'Not specified'} ton

## ISCC GHG 205 CALCULATION METHODOLOGY

Calculate emissions according to ISCC EU 205 standard:

1. **EEC (Emissions from extraction/cultivation of raw materials):**
   - Include emissions from fertilizers (N2O from nitrogen fertilizers)
   - Include emissions from energy use (diesel, electricity)
   - Include emissions from pesticides if applicable
   - Convert all to kg CO2 equivalent
   - Convert to g CO2eq/MJ using: (Total kg CO2eq) / (Production volume in kg × LHV in MJ/kg) × 1000

2. **EP (Emissions from processing):**
   - Include emissions from energy consumption (electricity, steam, natural gas, diesel)
   - Include emissions from chemicals (methanol, catalyst, acid)
   - Include emissions from water treatment if applicable
   - Convert all to kg CO2 equivalent
   - Convert to g CO2eq/MJ using LHV

3. **ETD (Emissions from transport and distribution):**
   - Calculate emissions from feedstock transport (distance × mode × weight)
   - Calculate emissions from product distribution (distance × mode × weight)
   - Use standard emission factors for transport modes:
     * Truck: ~0.1 kg CO2/ton-km
     * Ship: ~0.01 kg CO2/ton-km
     * Rail: ~0.02 kg CO2/ton-km
   - Convert to g CO2eq/MJ using LHV

4. **EL (Emissions from land use change) - Optional:**
   - Only include if land use change occurred
   - Use IPCC default values if applicable

5. **ECCR (Emissions from carbon capture and replacement) - Optional:**
   - Only include if carbon capture technology is used
   - Negative value indicates savings

6. **Total Emissions:**
   - Total = EEC + EP + ETD + EL - ECCR (all in g CO2eq/MJ)

7. **GHG Savings:**
   - Baseline fossil fuel: 83.8 g CO2eq/MJ (default for diesel/gasoline)
   - GHG Savings % = ((Baseline - Total) / Baseline) × 100

## EMISSION FACTORS (Use ISCC/RED II defaults)

- Nitrogen Fertilizer: ~6.38 kg CO2eq/kg N (including N2O)
- Diesel: ~2.68 kg CO2eq/liter
- Electricity (grid average): ~0.5 kg CO2eq/kWh (adjust based on country)
- Natural Gas: ~2.0 kg CO2eq/m3
- Methanol: ~1.38 kg CO2eq/kg
- Steam: ~0.2 kg CO2eq/kg (depends on fuel source)

## INSTRUCTIONS

1. Calculate each component (EEC, EP, ETD) separately
2. Convert all intermediate results to kg CO2 equivalent
3. Convert final results to g CO2eq/MJ using the formula:
   - g CO2eq/MJ = (kg CO2eq / (Production volume in kg × LHV in MJ/kg)) × 1000
4. If production volume is not specified, use yield × land area or estimate from available data
5. Provide detailed breakdown for each component
6. Include assumptions and methodology used

## OUTPUT FORMAT (JSON only, no markdown)
Return ONLY a valid JSON object with this exact structure:

{
  "eecKg": <number in kg CO2eq>,
  "epKg": <number in kg CO2eq>,
  "etdKg": <number in kg CO2eq>,
  "elKg": <number in kg CO2eq or null if not applicable>,
  "eccrKg": <number in kg CO2eq or null if not applicable>,
  "totalKg": <number in kg CO2eq>,
  "eec": <number in g CO2eq/MJ>,
  "ep": <number in g CO2eq/MJ>,
  "etd": <number in g CO2eq/MJ>,
  "el": <number in g CO2eq/MJ or null if not applicable>,
  "eccr": <number in g CO2eq/MJ or null if not applicable>,
  "totalEmissions": <number in g CO2eq/MJ>,
  "fossilFuelBaseline": <number in g CO2eq/MJ, default 83.8>,
  "ghgSavings": <number as percentage>,
  "breakdown": {
    "eec": {
      "description": "string",
      "components": [{"name": "string", "value": <number>, "unit": "string", "emission": <number>}],
      "totalKg": <number>,
      "totalGPerMJ": <number>
    },
    "ep": {...},
    "etd": {...},
    "el": {...} // optional
  },
  "explanation": "string",
  "methodology": "string",
  "assumptions": ["string"]
}

**IMPORTANT:** 
- Return ONLY the JSON object, no additional text before or after
- Ensure all numeric values are actual numbers, not strings
- Use null for optional fields (EL, ECCR) if not applicable
- Be precise with unit conversions
- Production volume should be converted to kg (1 ton = 1000 kg)`;

    return prompt;
  }

  /**
   * Parse AI response and extract calculation results
   */
  private static parseAIResponse(aiResponse: string): ISCCAIResponse {
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

      const parsed = JSON.parse(jsonText) as ISCCAIResponse;

      // Validate required fields
      if (
        typeof parsed.eecKg !== 'number' ||
        typeof parsed.epKg !== 'number' ||
        typeof parsed.etdKg !== 'number' ||
        typeof parsed.totalKg !== 'number' ||
        typeof parsed.eec !== 'number' ||
        typeof parsed.ep !== 'number' ||
        typeof parsed.etd !== 'number' ||
        typeof parsed.totalEmissions !== 'number'
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
    request: ISCCCalculationRequest
  ): Promise<ISCCCalculationResult> {
    try {
      // Validate LHV is present
      if (!request.project.lhv) {
        throw new Error('LHV (Lower Heating Value) is required for ISCC calculation');
      }

      // Build prompt
      const prompt = this.buildPrompt(request);

      console.log('🤖 Calling Gemini AI for ISCC calculation...');
      console.log('📋 Request:', {
        projectName: request.project.name,
        productType: request.project.productType,
        feedstockType: request.project.feedstockType,
        lhv: request.project.lhv
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
      const calculationResult: ISCCCalculationResult = {
        eecKg: aiResult.eecKg,
        epKg: aiResult.epKg,
        etdKg: aiResult.etdKg,
        elKg: aiResult.elKg ?? undefined,
        eccrKg: aiResult.eccrKg ?? undefined,
        totalKg: aiResult.totalKg,
        eec: aiResult.eec,
        ep: aiResult.ep,
        etd: aiResult.etd,
        el: aiResult.el ?? undefined,
        eccr: aiResult.eccr ?? undefined,
        totalEmissions: aiResult.totalEmissions,
        fossilFuelBaseline: aiResult.fossilFuelBaseline || 83.8,
        ghgSavings: aiResult.ghgSavings,
        breakdown: aiResult.breakdown,
        explanation: aiResult.explanation,
        methodology: aiResult.methodology,
        assumptions: aiResult.assumptions || []
      };

      console.log('✅ ISCC AI calculation completed:', {
        totalEmissions: calculationResult.totalEmissions,
        ghgSavings: calculationResult.ghgSavings,
        eec: calculationResult.eec,
        ep: calculationResult.ep,
        etd: calculationResult.etd
      });

      return calculationResult;
    } catch (error) {
      console.error('❌ ISCC AI calculation error:', error);
      throw new Error(
        `ISCC AI calculation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

