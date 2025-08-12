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
    const parse = (val: string | number | null | undefined): number => {
      if (typeof val === "number") return val;
      if (!val) return 0;

      const cleaned = val
        .toString()
        .replace(/\./g, "")
        .replace(",", ".")
        .trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Parsing all necessary fields
    const mainProduct1 = parse(form.mainProduct1); // H22
    const mainProduct2 = parse(form.mainProduct2); // H23
    const coProduct1 = parse(form.coProduct1); // H24
    const coProduct2 = parse(form.coProduct2); // H25
    const lhvProduct = parse(form.lhvProduct); // H27

    const ddgs = parse(form.coProduct1);

    const amountBatch1 = parse(form.amountBatch1); // H30
    const moistureContentBatch1 = parse(form.moistureContentBatch1); // H31
    const ghgEmissionEECBatch1 = parse(form.ghgEmissionEECBatch1); // H32

    const amountBatch2 = parse(form.amountBatch2); // H37
    const moistureContentBatch2 = parse(form.moistureContentBatch2); // H38

    const amountBatch3 = parse(form.amountBatch3); // H43
    const ghgEmissionBatch3 = parse(form.ghgEmissionBatch3); // H45

    const ethanolProduction = parse(form.ethanolProduction); // H84
    const co2liquefication = parse(form.co2liquefication); // H85
    const factorElectricity = parse(form.factorElectricity); // H87

    const heatNaturalGas = parse(form.heatNaturalGas); // H92
    const emissionFactorNaturalGas = parse(form.emissionFactorNaturalGas); // H94

    const co2Capture = parse(form.co2Capture); // H108
    const fuelReference = parse(form.fuelReference); // H140

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
      lhvProduct > 0
        ? (ghgMoist / lhvProduct) * feedstockFactor * allocationFactor
        : 0;

    // 4. Cultivation - Batch 3
    const ghgMoist3 = ghgEmissionBatch3;
    const ghgDry3 = ghgMoist3;
    const allocatedCultivation3Emission =
      lhvProduct > 0
        ? (ghgDry3 / lhvProduct) * feedstockFactor * allocationFactor
        : 0;

    // 5. Electricity
    const co2eEmissionsElectricity =
      ethanolProduction + co2liquefication * factorElectricity;

    // 6. Heat
    const co2eHeatProduction = heatNaturalGas * emissionFactorNaturalGas;

    // 7. Energy b
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
    const etd1 = parse(form.etd1); // assumed to be filled separately
    const totalEmission1 =
      cultivationEEC1 + epProcessingEmissions1 + etd1 + eCCR1;

    // 10. Total Emission - Batch 2
    const cultivationEEC2 = parse(form.allocatedCultivation2Emission);
    const epProcessingEmissions2 = allocatedProcessingEmissions;
    const etd2 = parse(form.etd2);
    const eCCR2 = -co2eEmissionsEthanol2;
    const totalEmission2 =
      cultivationEEC2 + epProcessingEmissions2 + etd2 + eCCR2;

    // 11. Total Emission - Batch 3
    const cultivationEEC3 = allocatedCultivation3Emission;
    const epProcessingEmissions3 = allocatedProcessingEmissions;
    const etd3 = parse(form.etd3);
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
      cornDry: cornDry.toFixed(3),
      energyContentCorn: energyContentCorn.toFixed(3),
      ethanolDry: ethanolDry.toFixed(3),
      energyContentEthanol: energyContentEthanol.toFixed(3),
      feedstockFactor: feedstockFactor.toFixed(4),

      ethanolEnergyContent: ethanolEnergyContent.toFixed(3),
      ddgs: ddgs.toFixed(3),
      energyContentDDGS: energyContentDDGS.toFixed(3),
      allocationFactor: allocationFactor.toFixed(3),

      ghgMoist: ghgMoist.toFixed(1),
      ghgDry: ghgDry.toFixed(1),
      allocatedCultivationEmission: allocatedCultivationEmission.toFixed(1),

      ghgMoist3: ghgMoist3.toFixed(1),
      ghgDry3: ghgDry3.toFixed(1),
      allocatedCultivation3Emission: allocatedCultivation3Emission.toFixed(1),

      co2eEmissionsElectricity: co2eEmissionsElectricity.toFixed(2),
      co2eHeatProduction: co2eHeatProduction.toFixed(2),
      co2eEmissions1: co2eEmissions1.toFixed(2),
      co2eEmissions2: co2eEmissions2.toFixed(1),
      co2eEmissions3: co2eEmissions3.toFixed(1),
      allocatedProcessingEmissions: allocatedProcessingEmissions.toFixed(1),

      co2eEmissionsEthanol1: co2eEmissionsEthanol1.toFixed(1),
      co2eEmissionsEthanol2: co2eEmissionsEthanol2.toFixed(1),

      cultivationEEC1: cultivationEEC1.toFixed(1),
      epProcessingEmissions1: epProcessingEmissions1.toFixed(1),
      eCCR1: eCCR1.toFixed(1),
      totalEmission1: totalEmission1.toFixed(1),

      cultivationEEC2: cultivationEEC2.toFixed(1),
      epProcessingEmissions2: epProcessingEmissions2.toFixed(1),
      eCCR2: eCCR2.toFixed(1),
      totalEmission2: totalEmission2.toFixed(1),

      cultivationEEC3: cultivationEEC3.toFixed(1),
      epProcessingEmissions3: epProcessingEmissions3.toFixed(1),
      eCCR3: eCCR3.toFixed(1),
      totalEmission3: totalEmission3.toFixed(1),

      reductionBatch1: reductionBatch1.toFixed(1),
      reductionBatch2: reductionBatch2.toFixed(1),
      reductionBatch3: reductionBatch3.toFixed(1),
    }));
  }, [form]);

  return {
    form,
    handleChange,
    setForm,
  };
}
