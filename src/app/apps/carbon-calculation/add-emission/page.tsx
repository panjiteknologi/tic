"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/layout/dashboard-layout";
import { CarbonCalculationMenu } from "@/constant/menu-sidebar";
import { AppSidebarTypes } from "@/types/sidebar-types";
import AddEmissionViews from "@/views/apps/carbon-calculation/add-emission-views";

export default function ProductRawInputForm() {
  const router = useRouter();

  const [form, setForm] = useState({
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
    co2eqEmissionsHerbicidesPesticidesHaYr: "", //76
    co2eqEmissionsHerbicidesPesticidesTFFB: "", //77

    //Energy - a
    electricityConsumptionSoilPrep: "", //82
    emissionFactorElectricity: "", //84
    co2eEmissionsElectricityYr: "", //86
    co2eEmissionsElectricityTFFB: "", //87

    //Energy - b
    dieselConsumed: "", //91
    emissionFactorDiesel: "", //93
    co2eEmissionsDieselYr: "", //95
    co2eEmissionsDieselTFFB: "", //96

    //Cultivation
    ghgEmissionsRawMaterialInput: "", //100
    ghgEmissionsFertilizers: "", //101
    ghgEmissionsHerbicidesPesticides: "", //102
    ghgEmissionsEnergy: "", //103
    totalEmissionsCorn: "", //105

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

    soilOrganicCarbonActual: "", //142
    soilOrganicCarbonReference: "", //143
    accumulatedSoilCarbon: "", //144

    lucCarbonEmissionsPerKgCorn: "", //146

    totalLUCCO2EmissionsHaYr: "", //148
    totalLUCCO2EmissionsTDryCorn: "", //149
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted form:", form);
  };

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    const parse = (val: string | number | null | undefined): number => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const cleaned = val.toString().replace(",", ".").trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    //Products
    const cornWet = parse(form.cornWet);
    const moistureContent = parse(form.moistureContent);
    const cornDry = cornWet - (cornWet * moistureContent) / 100;

    //Raws
    const cornSeedsAmount = parse(form.cornSeedsAmount);
    const emissionFactorCornSeeds = parse(form.emissionFactorCornSeeds);
    const co2eqEmissionsRawMaterialInputHaYr =
      cornSeedsAmount * emissionFactorCornSeeds;
    const co2eqEmissionsRawMaterialInputTFFB =
      co2eqEmissionsRawMaterialInputHaYr / cornWet;

    //Fertilizer - Nitrogen
    const ammoniumNitrate = parse(form.ammoniumNitrate);
    const urea = parse(form.urea);
    const appliedManure = parse(form.appliedManure);
    const nContentCropResidue = parse(form.nContentCropResidue);
    const totalNSyntheticFertilizer =
      ammoniumNitrate + urea + appliedManure + nContentCropResidue;

    const emissionFactorDirectN2O = parse(form.emissionFactorDirectN2O);
    const directN2OEmissions =
      ((totalNSyntheticFertilizer + appliedManure) *
        emissionFactorDirectN2O *
        44) /
      28;

    const fractionNVolatilizedSynthetic = parse(
      form.fractionNVolatilizedSynthetic
    );
    const fractionNVolatilizedOrganic = parse(form.fractionNVolatilizedOrganic);
    const emissionFactorAtmosphericDeposition = parse(
      form.emissionFactorAtmosphericDeposition
    );
    const indirectN2OEmissionsNH3NOx =
      totalNSyntheticFertilizer * fractionNVolatilizedSynthetic +
      ((appliedManure + nContentCropResidue * fractionNVolatilizedOrganic) *
        emissionFactorAtmosphericDeposition *
        44) /
        28;

    const fractionNLostRunoff = parse(form.fractionNLostRunoff);
    const emissionFactorLeachingRunoff = parse(
      form.emissionFactorLeachingRunoff
    );
    const indirectN2OEmissionsNLeachingRunoff =
      ((totalNSyntheticFertilizer + appliedManure + nContentCropResidue) *
        fractionNLostRunoff *
        emissionFactorLeachingRunoff *
        44) /
      28;

    const emissionFactorAmmoniumNitrate = parse(
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

    //Herbicides
    const acetochlor = parse(form.acetochlor);
    const emissionFactorPesticides = parse(form.emissionFactorPesticides);
    const co2eqEmissionsHerbicidesPesticidesHaYr =
      acetochlor * emissionFactorPesticides;
    const co2eqEmissionsHerbicidesPesticidesTFFB =
      co2eqEmissionsHerbicidesPesticidesHaYr / cornWet;

    //Energy - a
    const electricityConsumptionSoilPrep = parse(
      form.electricityConsumptionSoilPrep
    );
    const emissionFactorElectricity = parse(form.emissionFactorElectricity);
    const co2eEmissionsElectricityYr =
      electricityConsumptionSoilPrep * emissionFactorElectricity;
    const co2eEmissionsElectricityTFFB = co2eEmissionsElectricityYr / cornWet;

    console.log(electricityConsumptionSoilPrep);
    console.log(electricityConsumptionSoilPrep * emissionFactorElectricity);
    //Energy - b
    const dieselConsumed = parse(form.dieselConsumed);
    const emissionFactorDiesel = parse(form.emissionFactorDiesel);
    const co2eEmissionsDieselYr = dieselConsumed * emissionFactorDiesel;
    const co2eEmissionsDieselTFFB = co2eEmissionsDieselYr / cornWet;

    //Cultivation
    const ghgEmissionsRawMaterialInput = parse(
      form.ghgEmissionsRawMaterialInput
    );
    const ghgEmissionsFertilizers = parse(form.ghgEmissionsFertilizers);
    const ghgEmissionsHerbicidesPesticides = parse(
      form.ghgEmissionsHerbicidesPesticides
    );
    const ghgEmissionsEnergy =
      co2eEmissionsElectricityTFFB + co2eEmissionsDieselTFFB;
    const totalEmissionsCorn =
      ghgEmissionsRawMaterialInput +
      ghgEmissionsFertilizers +
      ghgEmissionsHerbicidesPesticides +
      ghgEmissionsEnergy;

    setForm((prev) => ({
      ...prev,
      cornDry: cornDry.toFixed(1),
      co2eqEmissionsRawMaterialInputHaYr: Math.round(
        co2eqEmissionsRawMaterialInputHaYr
      ).toFixed(1),
      co2eqEmissionsRawMaterialInputTFFB:
        co2eqEmissionsRawMaterialInputTFFB.toFixed(2),
      totalNSyntheticFertilizer: totalNSyntheticFertilizer.toFixed(1),
      directN2OEmissions: directN2OEmissions.toFixed(1),
      indirectN2OEmissionsNH3NOx: indirectN2OEmissionsNH3NOx.toFixed(1),
      indirectN2OEmissionsNLeachingRunoff:
        indirectN2OEmissionsNLeachingRunoff.toFixed(1),
      co2eqEmissionsNitrogenFertilizersHaYr:
        co2eqEmissionsNitrogenFertilizersHaYr.toFixed(1),
      co2eqEmissionsNitrogenFertilizersFieldN20HaYr:
        co2eqEmissionsNitrogenFertilizersFieldN20HaYr.toFixed(1),
      co2eqEmissionsNitrogenFertilizersFieldN20TFFB:
        co2eqEmissionsNitrogenFertilizersFieldN20TFFB.toFixed(1),
      co2eqEmissionsHerbicidesPesticidesHaYr:
        co2eqEmissionsHerbicidesPesticidesHaYr.toFixed(1),
      co2eqEmissionsHerbicidesPesticidesTFFB:
        co2eqEmissionsHerbicidesPesticidesTFFB.toFixed(1),
      co2eEmissionsElectricityYr: co2eEmissionsElectricityYr.toFixed(1),
      co2eEmissionsElectricityTFFB: co2eEmissionsElectricityTFFB.toFixed(1),
      co2eEmissionsDieselYr: co2eEmissionsDieselYr.toFixed(1),
      co2eEmissionsDieselTFFB: co2eEmissionsDieselTFFB.toFixed(1),
      ghgEmissionsEnergy: ghgEmissionsEnergy.toFixed(1),
      totalEmissionsCorn: totalEmissionsCorn.toFixed(1),
    }));
  }, [
    form.cornWet,
    form.moistureContent,
    form.cornSeedsAmount,
    form.emissionFactorCornSeeds,
    form.ammoniumNitrate,
    form.urea,
    form.appliedManure,
    form.nContentCropResidue,
    form.emissionFactorDirectN2O,
    form.fractionNVolatilizedSynthetic,
    form.fractionNVolatilizedOrganic,
    form.emissionFactorAtmosphericDeposition,
    form.fractionNLostRunoff,
    form.emissionFactorLeachingRunoff,
    form.emissionFactorAmmoniumNitrate,
    form.acetochlor,
    form.emissionFactorPesticides,
    form.electricityConsumptionSoilPrep,
    form.emissionFactorElectricity,
    form.dieselConsumed,
    form.emissionFactorDiesel,
    form.ghgEmissionsRawMaterialInput,
    form.ghgEmissionsFertilizers,
    form.ghgEmissionsHerbicidesPesticides,
  ]);

  return (
    <DashboardLayout
      href="/apps/carbon-calculation/add-emission"
      titleHeader="Add Emission"
      subTitleHeader="Form Calculation"
      menuSidebar={CarbonCalculationMenu as AppSidebarTypes}
    >
      <AddEmissionViews
        goBack={goBack}
        handleSubmit={handleSubmit}
        form={form}
        handleChange={handleChange}
      />
    </DashboardLayout>
  );
}
