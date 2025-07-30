/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Dispatch, SetStateAction } from "react";

export interface FormCalculationTypes {
  form: {
    //Products
    cornWet: string; //26
    moistureContent: string; //27
    cornDry: string; //28 -> =I26-(I26*I27/100)
    cultivationArea: string; //29

    //Raws
    cornSeedsAmount: string; //33
    emissionFactorCornSeeds: string; //35
    co2eqEmissionsRawMaterialInputHaYr: string; //37 -> =I33*I35
    co2eqEmissionsRawMaterialInputTFFB: string; //38 -> =I37/I26

    //Fertilizer - Nitrogen
    ammoniumNitrate: string; //44
    urea: string; //45
    appliedManure: string; //46
    nContentCropResidue: string; //47
    totalNSyntheticFertilizer: string; //48 -> =SUM(I44:I47)

    emissionFactorAmmoniumNitrate: string; //51
    emissionFactorUrea: string; //52

    emissionFactorDirectN2O: string; //54
    fractionNVolatilizedSynthetic: string; //55
    fractionNVolatilizedOrganic: string; //56
    emissionFactorAtmosphericDeposition: string; //57
    fractionNLostRunoff: string; //58
    emissionFactorLeachingRunoff: string; //59

    directN2OEmissions: string; //62 -> =(I48+I46)*I54*44/28
    indirectN2OEmissionsNH3NOx: string; //63 -> =(I48*I55)+((I46+I47*I56)*I57*44/28)
    indirectN2OEmissionsNLeachingRunoff: string; //64 -> =(I48+I46+I47)*I58*I59*44/28

    co2eqEmissionsNitrogenFertilizersHaYr: string; //66 -> =I44*I51+I45
    co2eqEmissionsNitrogenFertilizersFieldN20HaYr: string; //67 -> =(I62+I63+I64)
    co2eqEmissionsNitrogenFertilizersFieldN20TFFB: string; //68 -> =SUM(I66:I67)/I26

    //Herbicides
    acetochlor: string; //72
    emissionFactorPesticides: string; //74
    co2eqEmissionsHerbicidesPesticidesHaYr: string; //76 -> =I72*I74
    co2eqEmissionsHerbicidesPesticidesTFFB: string; //77 -> =I76/I26

    //Energy - a
    electricityConsumptionSoilPrep: string; //82
    emissionFactorElectricity: string; //84
    co2eEmissionsElectricityYr: string; //86 -> =I82*I84
    co2eEmissionsElectricityTFFB: string; //87 -> =I86/I26

    //Energy - b
    dieselConsumed: string; //91
    emissionFactorDiesel: string; //93
    co2eEmissionsDieselYr: string; //95 -> =I91*I93
    co2eEmissionsDieselTFFB: string; //96 -> =I95/I26

    //Cultivation
    ghgEmissionsRawMaterialInput: string; //100
    ghgEmissionsFertilizers: string; //101
    ghgEmissionsHerbicidesPesticides: string; //102
    ghgEmissionsEnergy: string; //103 -> =I87+I96
    totalEmissionsCorn: string; //105 -> =SUM(I100:I103)

    //Land Use Change - a
    actualLandUse: string; //111

    climateRegionActual: string; //113
    soilTypeActual: string; //114
    currentSoilManagementActual: string; //115
    currentInputToSoilActual: string; //116

    socstActual: string; //119
    fluActual: string; //120
    fmgActual: string; //121
    fiActual: string; //122
    cvegActual: string; //123

    //Land Use Change - b
    referenceLandUse: string; //128

    climateRegionReference: string; //130
    soilTypeReference: string; //131
    currentSoilManagementReference: string; //132
    currentInputToSoilReference: string; //133

    socstReference: string; //136
    fluReference: string; //137
    fmgReference: string; //138
    fiReference: string; //139
    cvegReference: string; //140

    soilOrganicCarbonActual: string; //142 -> =((I119*I120*I121*I122)+I123)*1
    soilOrganicCarbonReference: string; //143 -> =((I136*I137*I138*I139))*1
    accumulatedSoilCarbon: string; //144 -> =((I142-I143)/(I26*20))*3,664

    lucCarbonEmissionsPerKgCorn: string; //146 -> =I144*1000/(I26*1000)

    totalLUCCO2EmissionsHaYr: string; //148 -> =I146*I26*1000
    totalLUCCO2EmissionsTDryCorn: string; //149 -> =(I148/I26)/(1-(I27/100))
  };
  handleChange: Dispatch<SetStateAction<string>> | any;
  handleSubmit?: (e: React.FormEvent) => void;
  goBack?: () => void | any;
  renderInput?: any;
}
