import { formatNumber, parseNumber } from "@/utils/number";
import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationGHGVerification() {
  const [form, setForm] = useState<CarbonFormType>({
    //Products
    cornWet: "", //26
    moistureContent: "", //27
    cornDry: "", //28 -> =I26-(I26*I27/100)
    cultivationArea: "", //29

    //Raws
    cornSeedsAmount: "", //33
    emissionFactorCornSeeds: "", //35
    co2eqEmissionsRawMaterialInputHaYr: "", //37 -> =I33*I35
    co2eqEmissionsRawMaterialInputTFFB: "", //38 -> =I37/I26

    //Fertilizer - Nitrogen
    ammoniumNitrate: "", //44
    urea: "", //45
    appliedManure: "", //46
    nContentCropResidue: "", //47
    totalNSyntheticFertilizer: "", //48 -> =SUM(I44:I47)

    emissionFactorAmmoniumNitrate: "", //51
    emissionFactorUrea: "", //52

    emissionFactorDirectN2O: "", //54
    fractionNVolatilizedSynthetic: "", //55
    fractionNVolatilizedOrganic: "", //56
    emissionFactorAtmosphericDeposition: "", //57
    fractionNLostRunoff: "", //58
    emissionFactorLeachingRunoff: "", //59

    directN2OEmissions: "", //62 -> =(I48+I46)*I54*44/28
    indirectN2OEmissionsNH3NOx: "", //63 -> =(I48*I55)+((I46+I47*I56)*I57*44/28)
    indirectN2OEmissionsNLeachingRunoff: "", //64 -> =(I48+I46+I47)*I58*I59*44/28

    co2eqEmissionsNitrogenFertilizersHaYr: "", //66 -> =I44*I51+I45
    co2eqEmissionsNitrogenFertilizersFieldN20HaYr: "", //67 -> =(I62+I63+I64)
    co2eqEmissionsNitrogenFertilizersFieldN20TFFB: "", //68 -> =SUM(I66:I67)/I26

    //Herbicides
    acetochlor: "", //72
    emissionFactorPesticides: "", //74
    co2eqEmissionsHerbicidesPesticidesHaYr: "", //76 -> =I72*I74
    co2eqEmissionsHerbicidesPesticidesTFFB: "", //77 -> =I76/I26

    //Energy - a
    electricityConsumptionSoilPrep: "", //82
    emissionFactorElectricity: "", //84
    co2eEmissionsElectricityYr: "", //86 -> =I82*I84
    co2eEmissionsElectricityTFFB: "", //87 -> =I86/I26

    //Energy - b
    dieselConsumed: "", //91
    emissionFactorDiesel: "", //93
    co2eEmissionsDieselYr: "", //95 -> =I91*I93
    co2eEmissionsDieselTFFB: "", //96 -> =I95/I26

    //Cultivation
    ghgEmissionsRawMaterialInput: "", //100
    ghgEmissionsFertilizers: "", //101
    ghgEmissionsHerbicidesPesticides: "", //102
    ghgEmissionsEnergy: "", //103 -> =I87+I96
    totalEmissionsCorn: "", //105 -> =SUM(I100:I103)

    //Land Use Change - a
    actualLandUse: "", //111
    climateRegionActual: "", //113
    soilTypeActual: "", //114
    currentSoilManagementActual: "", //115
    currentInputToSoilActual: "", //116

    socstActual: "", //119
    fluActual: "", //120
    fmgActual: "", //121
    fiActual: "", //122
    cvegActual: "", //123

    //Land Use Change - b
    referenceLandUse: "", //128
    climateRegionReference: "", //130
    soilTypeReference: "", //131
    currentSoilManagementReference: "", //132
    currentInputToSoilReference: "", //133

    socstReference: "", //136
    fluReference: "", //137
    fmgReference: "", //138
    fiReference: "", //139
    cvegReference: "", //140

    soilOrganicCarbonActual: "", //142 -> =((I119*I120*I121*I122)+I123)*1
    soilOrganicCarbonReference: "", //143 -> =((I136*I137*I138*I139))*1
    accumulatedSoilCarbon: "", //144 -> =((I142-I143)/(I26*20))*3,664

    lucCarbonEmissionsPerKgCorn: "", //146 -> =I144*1000/(I26*1000)

    totalLUCCO2EmissionsHaYr: "", //148 -> =I146*I26*1000
    totalLUCCO2EmissionsTDryCorn: "", //149 -> =(I148/I26)/(1-(I27/100))
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    //Products
    const cornWet = parseNumber(form.cornWet);
    const moistureContent = parseNumber(form.moistureContent);
    const cornDry = cornWet - (cornWet * moistureContent) / 100;

    //Raws material input
    const cornSeedsAmount = parseNumber(form.cornSeedsAmount);
    const emissionFactorCornSeeds = parseNumber(form.emissionFactorCornSeeds);
    const co2eqEmissionsRawMaterialInputHaYr =
      cornSeedsAmount * emissionFactorCornSeeds;
    const co2eqEmissionsRawMaterialInputTFFB =
      co2eqEmissionsRawMaterialInputHaYr / cornWet;

    //Fertilizer
    const ammoniumNitrate = parseNumber(form.ammoniumNitrate);
    const urea = parseNumber(form.urea);
    const appliedManure = parseNumber(form.appliedManure);
    const nContentCropResidue = parseNumber(form.nContentCropResidue);
    const totalNSyntheticFertilizer =
      ammoniumNitrate + urea + appliedManure + nContentCropResidue;

    const emissionFactorDirectN2O = parseNumber(form.emissionFactorDirectN2O);
    const directN2OEmissions =
      ((totalNSyntheticFertilizer + appliedManure) *
        emissionFactorDirectN2O *
        44) /
      28;

    const fractionNVolatilizedSynthetic = parseNumber(
      form.fractionNVolatilizedSynthetic
    );
    const fractionNVolatilizedOrganic = parseNumber(
      form.fractionNVolatilizedOrganic
    );
    const emissionFactorAtmosphericDeposition = parseNumber(
      form.emissionFactorAtmosphericDeposition
    );
    const indirectN2OEmissionsNH3NOx =
      totalNSyntheticFertilizer * fractionNVolatilizedSynthetic +
      ((appliedManure + nContentCropResidue * fractionNVolatilizedOrganic) *
        emissionFactorAtmosphericDeposition *
        44) /
        28;

    const fractionNLostRunoff = parseNumber(form.fractionNLostRunoff);
    const emissionFactorLeachingRunoff = parseNumber(
      form.emissionFactorLeachingRunoff
    );
    const indirectN2OEmissionsNLeachingRunoff =
      ((totalNSyntheticFertilizer + appliedManure + nContentCropResidue) *
        fractionNLostRunoff *
        emissionFactorLeachingRunoff *
        44) /
      28;

    const emissionFactorAmmoniumNitrate = parseNumber(
      form.emissionFactorAmmoniumNitrate
    );
    const co2eqEmissionsNitrogenFertilizersHaYr =
      ammoniumNitrate * emissionFactorAmmoniumNitrate + urea;
    const co2eqEmissionsNitrogenFertilizersFieldN20HaYr =
      directN2OEmissions +
      indirectN2OEmissionsNH3NOx +
      indirectN2OEmissionsNLeachingRunoff;

    const co2eqEmissionsNitrogenFertilizersFieldN20TFFB =
      cornWet > 0
        ? (co2eqEmissionsNitrogenFertilizersHaYr +
            co2eqEmissionsNitrogenFertilizersFieldN20HaYr) /
          cornWet
        : 0;

    //Hebicide
    const acetochlor = parseNumber(form.acetochlor);
    const emissionFactorPesticides = parseNumber(form.emissionFactorPesticides);
    const co2eqEmissionsHerbicidesPesticidesHaYr =
      acetochlor * emissionFactorPesticides;
    const co2eqEmissionsHerbicidesPesticidesTFFB =
      co2eqEmissionsHerbicidesPesticidesHaYr / cornWet;

    //Energy - a
    const electricityConsumptionSoilPrep = parseNumber(
      form.electricityConsumptionSoilPrep
    );
    const emissionFactorElectricity = parseNumber(
      form.emissionFactorElectricity
    );
    const co2eEmissionsElectricityYr =
      electricityConsumptionSoilPrep * emissionFactorElectricity;
    const co2eEmissionsElectricityTFFB = co2eEmissionsElectricityYr / cornWet;

    //Energy - b
    const dieselConsumed = parseNumber(form.dieselConsumed);
    const emissionFactorDiesel = parseNumber(form.emissionFactorDiesel);
    const co2eEmissionsDieselYr = dieselConsumed * emissionFactorDiesel;
    const co2eEmissionsDieselTFFB = co2eEmissionsDieselYr / cornWet;

    //Cultivation
    const ghgEmissionsRawMaterialInput = parseNumber(
      form.ghgEmissionsRawMaterialInput
    );
    const ghgEmissionsFertilizers = parseNumber(form.ghgEmissionsFertilizers);
    const ghgEmissionsHerbicidesPesticides = parseNumber(
      form.ghgEmissionsHerbicidesPesticides
    );
    const ghgEmissionsEnergy =
      co2eEmissionsElectricityTFFB + co2eEmissionsDieselTFFB;
    const totalEmissionsCorn =
      ghgEmissionsRawMaterialInput +
      ghgEmissionsFertilizers +
      ghgEmissionsHerbicidesPesticides +
      ghgEmissionsEnergy;

    //Land Use Change
    const socstActual = parseNumber(form.socstActual);
    const fluActual = parseNumber(form.fluActual);
    const fmgActual = parseNumber(form.fmgActual);
    const fiActual = parseNumber(form.fiActual);
    const cvegActual = parseNumber(form.cvegActual);
    const soilOrganicCarbonActual =
      (socstActual * fluActual * fmgActual * fiActual + cvegActual) * 1;

    const socstReference = parseNumber(form.socstReference);
    const fluReference = parseNumber(form.fluReference);
    const fmgReference = parseNumber(form.fmgReference);
    const fiReference = parseNumber(form.fiReference);
    const soilOrganicCarbonReference =
      socstReference * fluReference * fmgReference * fiReference * 1;

    const accumulatedSoilCarbon =
      ((soilOrganicCarbonActual - soilOrganicCarbonReference) /
        (cornWet * 20)) *
      3.664;

    const lucCarbonEmissionsPerKgCorn =
      (accumulatedSoilCarbon * 1000) / (cornWet * 1000);
    const totalLUCCO2EmissionsHaYr =
      lucCarbonEmissionsPerKgCorn * cornWet * 1000;
    const totalLUCCO2EmissionsTDryCorn =
      totalLUCCO2EmissionsHaYr / cornWet / 1 - moistureContent / 100;

    setForm((prev) => ({
      ...prev,
      cornDry: formatNumber(cornDry),
      co2eqEmissionsRawMaterialInputHaYr: formatNumber(
        co2eqEmissionsRawMaterialInputHaYr,
        0,
        "round"
      ),
      co2eqEmissionsRawMaterialInputTFFB: formatNumber(
        co2eqEmissionsRawMaterialInputTFFB,
        2,
        "none"
      ),
      totalNSyntheticFertilizer: formatNumber(
        totalNSyntheticFertilizer,
        1,
        "none"
      ),
      directN2OEmissions: formatNumber(directN2OEmissions, 1, "none"),
      indirectN2OEmissionsNH3NOx: formatNumber(
        indirectN2OEmissionsNH3NOx,
        1,
        "none"
      ),
      indirectN2OEmissionsNLeachingRunoff: formatNumber(
        indirectN2OEmissionsNLeachingRunoff,
        1,
        "none"
      ),
      co2eqEmissionsNitrogenFertilizersHaYr: formatNumber(
        co2eqEmissionsNitrogenFertilizersHaYr,
        1,
        "none"
      ),
      co2eqEmissionsNitrogenFertilizersFieldN20HaYr: formatNumber(
        co2eqEmissionsNitrogenFertilizersFieldN20HaYr,
        1,
        "none"
      ),
      co2eqEmissionsNitrogenFertilizersFieldN20TFFB: formatNumber(
        co2eqEmissionsNitrogenFertilizersFieldN20TFFB,
        1,
        "none"
      ),
      co2eqEmissionsHerbicidesPesticidesHaYr: formatNumber(
        co2eqEmissionsHerbicidesPesticidesHaYr,
        1,
        "none"
      ),
      co2eqEmissionsHerbicidesPesticidesTFFB: formatNumber(
        co2eqEmissionsHerbicidesPesticidesTFFB,
        1,
        "none"
      ),
      co2eEmissionsElectricityYr: formatNumber(
        co2eEmissionsElectricityYr,
        2,
        "none"
      ),
      co2eEmissionsElectricityTFFB: formatNumber(
        co2eEmissionsElectricityTFFB,
        2,
        "none"
      ),
      co2eEmissionsDieselYr: formatNumber(co2eEmissionsDieselYr, 2, "none"),
      co2eEmissionsDieselTFFB: formatNumber(co2eEmissionsDieselTFFB, 2, "none"),
      ghgEmissionsEnergy: formatNumber(ghgEmissionsEnergy, 2, "none"),
      totalEmissionsCorn: formatNumber(totalEmissionsCorn, 1, "none"),
      soilOrganicCarbonActual: formatNumber(soilOrganicCarbonActual, 1, "none"),
      soilOrganicCarbonReference: formatNumber(
        soilOrganicCarbonReference,
        1,
        "none"
      ),
      accumulatedSoilCarbon: formatNumber(accumulatedSoilCarbon, 2, "none"),
      lucCarbonEmissionsPerKgCorn: formatNumber(
        lucCarbonEmissionsPerKgCorn,
        3,
        "none"
      ),
      totalLUCCO2EmissionsHaYr: formatNumber(
        totalLUCCO2EmissionsHaYr,
        2,
        "none"
      ),
      totalLUCCO2EmissionsTDryCorn: formatNumber(
        totalLUCCO2EmissionsTDryCorn,
        2,
        "none"
      ),
    }));
  }, [
    form.acetochlor,
    form.ammoniumNitrate,
    form.appliedManure,
    form.cornSeedsAmount,
    form.cornWet,
    form.cvegActual,
    form.dieselConsumed,
    form.electricityConsumptionSoilPrep,
    form.emissionFactorAmmoniumNitrate,
    form.emissionFactorAtmosphericDeposition,
    form.emissionFactorCornSeeds,
    form.emissionFactorDiesel,
    form.emissionFactorDirectN2O,
    form.emissionFactorElectricity,
    form.emissionFactorLeachingRunoff,
    form.emissionFactorPesticides,
    form.fiActual,
    form.fiReference,
    form.fluActual,
    form.fluReference,
    form.fmgActual,
    form.fmgReference,
    form.fractionNLostRunoff,
    form.fractionNVolatilizedOrganic,
    form.fractionNVolatilizedSynthetic,
    form.ghgEmissionsFertilizers,
    form.ghgEmissionsHerbicidesPesticides,
    form.ghgEmissionsRawMaterialInput,
    form.moistureContent,
    form.nContentCropResidue,
    form.socstActual,
    form.socstReference,
    form.urea,
  ]);

  return {
    form,
    handleChange,
    setForm,
  };
}
