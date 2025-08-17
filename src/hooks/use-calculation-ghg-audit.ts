import { formatNumber, parseNumber } from "@/utils/number";
import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationGHGAudit() {
  const [form, setForm] = useState<CarbonFormType>({
    //Products
    mainProduct1: "", //22
    mainProduct2: "", //23
    coProduct1: "", //24
    coProduct2: "", //25
    lhvProduct: "", //27

    //Batch 1 of corn
    origin: "", //29
    amountBatch1: "", //30
    moistureContentBatch1: "", //31
    ghgEmissionEECBatch1: "", //32

    //Batch 2 of corn
    originBatch2: "", //36
    amountBatch2: "", //37
    moistureContentBatch2: "", //38

    //Batch 3 of corn
    originBatch3: "", //42
    amountBatch3: "", //43
    moistureContentBatch3: "", //44
    ghgEmissionBatch3: "", //45

    //Feedstock Factor
    cornDry: "", //51 ->=(H30-(H30*H31/100))+(H37-(H37*H38/100))+H43
    energyContentCorn: "", //52 ->=(H30+H37+H43)*1000*H27
    ethanolDry: "", //53 ->=H22
    energyContentEthanol: "", //54 ->=H53*1000*H23
    feedstockFactor: "", //56 ->=H54/H52

    //Allocation Factor
    ethanolEnergyContent: "", //59 ->=H54
    ddgs: "", //61 ->=H24
    energyContentDDGS: "", //62 ->=H61*1000*H25
    allocationFactor: "", //64 ->=H59/(H59+H62)

    //Cultivation - Batch 1
    ghgMoist: "", //69 ->H32
    ghgDry: "", //70 ->=H69/(1-H31/100)
    allocatedCultivationEmission: "", //71 ->=H69/H27*H56*H64

    //Cultivation - Batch 2
    allocatedCultivation2Emission: "", //74

    //Cultivation - Batch 3
    ghgMoist3: "", //77 ->H45
    ghgDry3: "", //78 ->H77
    allocatedCultivation3Emission: "", //79 ->=H78/H27*H56*H64

    //Emissions of electricity consumption
    ethanolProduction: "", //84
    co2liquefication: "", //85
    factorElectricity: "", //87
    co2eEmissionsElectricity: "", //89 ->=H84+H85*H87

    //Emissions of heat production
    heatNaturalGas: "", //92
    emissionFactorNaturalGas: "", //94
    co2eHeatProduction: "", //96 ->=H92*H94

    //Energy - b
    co2eEmissions1: "", //100 ->=H89+H96
    co2eEmissions2: "", //101 ->=H100/H22
    co2eEmissions3: "", //102 ->=H101/H23
    allocatedProcessingEmissions: "", //104 ->=H102*H64

    //Carbon capture and replacement
    co2Capture: "", //108
    co2eEmissionsEthanol1: "", //109 ->=H108/H22
    co2eEmissionsEthanol2: "", //110 ->=H109/H25

    //Total indovidual emissions and sum of emissions - Batch 1
    cultivationEEC1: "", //118 ->=H71
    epProcessingEmissions1: "", //119 ->=H104
    etd1: "", //120
    eCCR1: "", //121 ->=-H111
    totalEmission1: "", //122

    //Total indovidual emissions and sum of emissions - Batch 2
    cultivationEEC2: "", //118 ->=H74
    epProcessingEmissions2: "", //119 ->=H104
    etd2: "", //120
    eCCR2: "", //121 ->=-H111
    totalEmission2: "", //122 =SUM(H125:H128)

    //Total indovidual emissions and sum of emissions - Batch 3
    cultivationEEC3: "", //118 >=H79
    epProcessingEmissions3: "", //119 >=104
    etd3: "", //120
    eCCR3: "", //121 ->=-H111
    totalEmission3: "", //122 ->=SUM(H132:H135)

    //GHG Emissions reduction potential
    fuelReference: "", //140
    reductionBatch1: "", //142 ->=(H140-H122)/H140*100
    reductionBatch2: "", //143 ->=(H140-H129)/H140*100
    reductionBatch3: "", //133 ->=(H140-H136)/H140*100
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Parsing all necessary fields
    const mainProduct1 = parseNumber(form.mainProduct1); // H22
    const mainProduct2 = parseNumber(form.mainProduct2); // H23
    const coProduct1 = parseNumber(form.coProduct1); // H24
    const coProduct2 = parseNumber(form.coProduct2); // H25
    const lhvProduct = parseNumber(form.lhvProduct); // H27

    const ddgs = parseNumber(form.coProduct1);

    const amountBatch1 = parseNumber(form.amountBatch1); // H30
    const moistureContentBatch1 = parseNumber(form.moistureContentBatch1); // H31
    const ghgEmissionEECBatch1 = parseNumber(form.ghgEmissionEECBatch1); // H32

    const amountBatch2 = parseNumber(form.amountBatch2); // H37
    const moistureContentBatch2 = parseNumber(form.moistureContentBatch2); // H38

    const amountBatch3 = parseNumber(form.amountBatch3); // H43
    const ghgEmissionEECBatch3 = parseNumber(form.ghgEmissionEECBatch3); // H45

    const ethanolProduction = parseNumber(form.ethanolProduction); // H84
    const co2liquefication = parseNumber(form.co2liquefication); // H85
    const factorElectricity = parseNumber(form.factorElectricity); // H87

    const heatNaturalGas = parseNumber(form.heatNaturalGas); // H92
    const emissionFactorNaturalGas = parseNumber(form.emissionFactorNaturalGas); // H94

    const co2Capture = parseNumber(form.co2Capture); // H108
    const fuelReference = parseNumber(form.fuelReference); // H140

    // 1. Feedstock Factor
    const cornDry =
      amountBatch1 -
      (amountBatch1 * moistureContentBatch1) / 100 +
      (amountBatch2 - (amountBatch2 * moistureContentBatch2) / 100) +
      amountBatch3;

    const energyContentCorn =
      (amountBatch1 + amountBatch2 + amountBatch3) * 1000 * lhvProduct;
    const ethanolDry = mainProduct1;
    const energyContentEthanol = ethanolDry * 1000 * mainProduct2;
    const feedstockFactor =
      energyContentCorn > 0 ? energyContentEthanol / energyContentCorn : 0;

    // 2. Allocation Factor
    const ethanolEnergyContent = energyContentEthanol;
    const energyContentDDGS = coProduct1 * 1000 * coProduct2;
    const allocationFactor =
      ethanolEnergyContent + energyContentDDGS > 0
        ? ethanolEnergyContent / (ethanolEnergyContent + energyContentDDGS)
        : 0;

    // 3. Cultivation - Batch 1
    const ghgMoist = ghgEmissionEECBatch1;
    const ghgDry = ghgMoist / (1 - moistureContentBatch1 / 100);
    const allocatedCultivationEmission =
      (ghgMoist / lhvProduct) * (feedstockFactor * allocationFactor);

    // 4. Cultivation - Batch 3
    const ghgMoist3 = ghgEmissionEECBatch3;
    const ghgDry3 = ghgMoist3;
    const allocatedCultivation3Emission =
      (ghgDry3 / lhvProduct) * feedstockFactor * allocationFactor;

    // 5. Electricity
    const co2eEmissionsElectricity =
      ethanolProduction + co2liquefication * factorElectricity;

    // 6. Heat
    const co2eHeatProduction = heatNaturalGas * emissionFactorNaturalGas;

    // 7. Process emissions
    const co2eEmissions1 = co2eEmissionsElectricity + co2eHeatProduction;
    const co2eEmissions2 = mainProduct1 > 0 ? co2eEmissions1 / mainProduct1 : 0;
    const co2eEmissions3 = mainProduct2 > 0 ? co2eEmissions2 / mainProduct2 : 0;
    const allocatedProcessingEmissions = co2eEmissions3 * allocationFactor;

    // 8. Carbon Capture
    const co2eEmissionsEthanol1 =
      mainProduct1 > 0 ? co2Capture / mainProduct1 : 0;
    const co2eEmissionsEthanol2 =
      coProduct2 > 0 ? co2eEmissionsEthanol1 / coProduct2 : 0;

    // 9. Total Emission - Batch 1
    const cultivationEEC1 = allocatedCultivationEmission;
    const epProcessingEmissions1 = allocatedProcessingEmissions;
    const eCCR1 = -co2eEmissionsEthanol2;
    const etd1 = parseNumber(form.etd1); // assumed to be filled separately
    const totalEmission1 =
      cultivationEEC1 + epProcessingEmissions1 + etd1 + eCCR1;

    // 10. Total Emission - Batch 2
    const cultivationEEC2 = parseNumber(form.allocatedCultivation2Emission);
    const epProcessingEmissions2 = allocatedProcessingEmissions;
    const etd2 = parseNumber(form.etd2);
    const eCCR2 = -co2eEmissionsEthanol2;
    const totalEmission2 =
      cultivationEEC2 + epProcessingEmissions2 + etd2 + eCCR2;

    // 11. Total Emission - Batch 3
    const cultivationEEC3 = allocatedCultivation3Emission;
    const epProcessingEmissions3 = allocatedProcessingEmissions;
    const etd3 = parseNumber(form.etd3);
    const eCCR3 = -co2eEmissionsEthanol2;
    const totalEmission3 =
      cultivationEEC3 + epProcessingEmissions3 + etd3 + eCCR3;

    // 12. Reductions
    const reductionBatch1 =
      fuelReference > 0
        ? ((fuelReference - totalEmission1) / fuelReference) * 100
        : 0;

    const reductionBatch2 =
      fuelReference > 0
        ? ((fuelReference - totalEmission2) / fuelReference) * 100
        : 0;

    const reductionBatch3 =
      fuelReference > 0
        ? ((fuelReference - totalEmission3) / fuelReference) * 100
        : 0;

    // Update form state
    setForm((prev) => ({
      ...prev,
      cornDry: formatNumber(cornDry, 0, "floor"),
      energyContentCorn: formatNumber(energyContentCorn, 0, "none"),
      ethanolDry: formatNumber(ethanolDry, 0, "none"),
      energyContentEthanol: formatNumber(energyContentEthanol, 0, "none"),
      feedstockFactor: formatNumber(feedstockFactor, 0, "none"),

      ethanolEnergyContent: formatNumber(ethanolEnergyContent, 0, "none"),
      ddgs: formatNumber(ddgs, 0, "none"),
      energyContentDDGS: formatNumber(energyContentDDGS, 0, "none"),
      allocationFactor: formatNumber(allocationFactor, 0, "none"),

      ghgMoist: formatNumber(ghgMoist, 1, "none"),
      ghgDry: formatNumber(ghgDry, 1, "none"),
      allocatedCultivationEmission: formatNumber(
        allocatedCultivationEmission,
        1,
        "none"
      ),

      ghgMoist3: formatNumber(ghgMoist3, 1, "none"),
      ghgDry3: formatNumber(ghgDry3, 1, "none"),
      allocatedCultivation3Emission: formatNumber(
        allocatedCultivation3Emission,
        1,
        "none"
      ),

      co2eEmissionsElectricity: formatNumber(
        co2eEmissionsElectricity,
        0,
        "none"
      ),
      co2eHeatProduction: formatNumber(co2eHeatProduction, 0, "none"),
      co2eEmissions1: formatNumber(co2eEmissions1, 0, "none"),
      co2eEmissions2: formatNumber(co2eEmissions2, 1, "none"),
      co2eEmissions3: formatNumber(co2eEmissions3, 1, "none"),
      allocatedProcessingEmissions: formatNumber(
        allocatedProcessingEmissions,
        1,
        "none"
      ),

      co2eEmissionsEthanol1: formatNumber(co2eEmissionsEthanol1, 1, "none"),
      co2eEmissionsEthanol2: formatNumber(co2eEmissionsEthanol2, 1, "none"),

      cultivationEEC1: formatNumber(cultivationEEC1, 1, "none"),
      epProcessingEmissions1: formatNumber(epProcessingEmissions1, 1, "none"),
      eCCR1: formatNumber(eCCR1, 1, "none"),
      totalEmission1: formatNumber(totalEmission1, 1, "none"),

      cultivationEEC2: formatNumber(cultivationEEC2, 1, "none"),
      epProcessingEmissions2: formatNumber(epProcessingEmissions2, 1, "none"),
      eCCR2: formatNumber(eCCR2, 1, "none"),
      totalEmission2: formatNumber(totalEmission2, 1, "none"),

      cultivationEEC3: formatNumber(cultivationEEC3, 1, "none"),
      epProcessingEmissions3: formatNumber(epProcessingEmissions3, 1, "none"),
      eCCR3: formatNumber(eCCR3, 1, "none"),
      totalEmission3: formatNumber(totalEmission3, 1, "none"),

      reductionBatch1: formatNumber(reductionBatch1, 1, "none"),
      reductionBatch2: formatNumber(reductionBatch2, 1, "none"),
      reductionBatch3: formatNumber(reductionBatch3, 1, "none"),
    }));
  }, [
    form.allocatedCultivation2Emission,
    form.amountBatch1,
    form.amountBatch2,
    form.amountBatch3,
    form.co2Capture,
    form.co2liquefication,
    form.coProduct1,
    form.coProduct2,
    form.emissionFactorNaturalGas,
    form.etd1,
    form.etd2,
    form.etd3,
    form.ethanolProduction,
    form.factorElectricity,
    form.fuelReference,
    form.ghgEmissionEECBatch1,
    form.ghgEmissionEECBatch3,
    form.heatNaturalGas,
    form.lhvProduct,
    form.mainProduct1,
    form.mainProduct2,
    form.moistureContentBatch1,
    form.moistureContentBatch2,
  ]);

  return {
    form,
    handleChange,
    setForm,
  };
}
