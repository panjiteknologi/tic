import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationOtherCase() {
  const [form, setForm] = useState<CarbonFormType>({
    //Input Needed
    totalInputWet: "", //47
    totalMoistureContent: "", //49
    totalInputDry: "", //48

    //Cultivation emissions
    cultivationEmissionsTotal: "", //55
    cultivationEmissionsPerTon: "",

    //Upstream transport
    maxLoadTransport: "", //63
    totalCornTransported: "", //64
    distanceLoaded: "", //65
    distanceEmpty: "", //66
    fuelConsumptionLoaded: "", //69
    fuelConsumptionEmpty: "", //70
    emissionFactorFuel: "", //71
    upstreamTransportTotal: "", //74
    upstreamTransportMTCorn: "", //75

    //Electricity
    electricityConsumption: "", //81

    //Steam
    steamConsumptionNaturalGas: "", //85

    //Inputs
    yeastFermentation: "", //88
    freshWater: "", //89
    alphaAmylase: "", //90
    glucoAmylase: "", //91
    sulfuricAcid: "", //92
    sodiumHydroxide: "", //93
    urea: "", //94

    //Emission factors
    emissionFactorElectricity: "", //97
    emissionFactorSteamNaturalGas: "", //98
    emissionFactorYeast: "", //99
    emissionFactorFreshWater: "", //100
    emissionFactorAlphaAmylase: "", //101
    emissionFactorGlucoAmylase: "", //102
    emissionFactorSulfuricAcid: "", //103
    emissionFactorSodiumHydroxide: "", //104
    emissionFactorUrea: "", //105

    //Calculated emissions
    allofactorElectricity: "", //108
    allofactorSteamNaturalGas: "", //109
    allofactorYeast: "", //110
    allofactorFreshWater: "", //111
    allofactorEnzymes: "", //112
    allofactorSulfuricAcid: "", //113
    allofactorSodiumHydroxide: "", //114
    allofactorUrea: "", //115
    allofactorTotal: "", // --
    allofactorPerTonBioethanol: "", // --

    //Conversion & allocation
    energyContent: "", //122 -> =E134*E47*1000
    conversionFactor: "", //125 -> =E122/E142
    bCultivation: "", //128 -> =E56/E134*$E$125
    bTransport: "", //131 -> =$E$75/E134*$E$125
    lowerCorn: "", //134
    lowerBioethanol: "", //135
    lowerCornOil: "", //136
    lowerDdgs: "", //137
    lowerWdg: "", //138
    calculationBioethanol: "", //142 -> =(E33-(E33*E34/100))*E135*1000
    calculationCornOil: "", //143 -> =(E37-(E37*E38/100))*E136*1000
    calculationDdgs: "", //144 -> =(E39-(E39*E40/100))*1000*E138
    calculationWdg: "", //145 -> =(E41-(E41*E42/100))*1000*E138
    calculationSyrup: "", //146 -> =(E43-(E43*E44/100))*1000*E139
    calculationTotal: "", //147 -> =SUM(E142:E146)

    allocationBioethanol: "", //150 -> =E142/E147
    allocationCornOil: "", //151 -> =E143/E147
    allocationDdgs: "", //152 -> =E144/E147
    allocationWdg: "", //153
    allocationSyrup: "", //154 -> =E146/E147

    //Final emissions
    eec: "", //157 -> =E128*$E$150
    et: "", //160 -> =E131*$E$150
    ep: "", //163 -> =(((E117/E134)*E150))
    totalEEC: "", //169 -> =E157
    totalEEP: "", //170 -> =$E$163
    totalET: "", //171 -> =$E$160
    totalEU: "", //172
    total: "", //173 -> =E169+E170
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const parse = (val: string | number | null | undefined): number => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const cleaned = val.toString().replace(",", ".").trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Input
    const totalInputWet = parse(form.totalInputWet);
    const cornMoisture = parse(form.cornMoisture);
    const totalInputDry = totalInputWet - (totalInputWet * cornMoisture) / 100;

    // Cultivation emissions
    const cultivationEmissionsPerTon = parse(form.cultivationEmissionsPerTon);
    const cultivationEmissionsTotal =
      cultivationEmissionsPerTon * totalInputDry;

    // Transport emissions
    const maxLoad = parse(form.maxLoadTransport);
    const cornTransported = parse(form.totalCornTransported);
    const distLoaded = parse(form.distanceLoaded);
    const distEmpty = parse(form.distanceEmpty);
    const fuelLoaded = parse(form.fuelConsumptionLoaded);
    const fuelEmpty = parse(form.fuelConsumptionEmpty);
    const efFuel = parse(form.emissionFactorFuel);

    const upstreamTransportTotal =
      (cornTransported / maxLoad) *
      (distLoaded * fuelLoaded + distEmpty * fuelEmpty) *
      efFuel;

    const upstreamTransportMTCorn =
      ((cornTransported / maxLoad) *
        (distLoaded * fuelLoaded + distEmpty * fuelEmpty) *
        efFuel) /
      cornTransported /
      (1 - cornMoisture / 100);

    // Process inputs emissions
    const electricity = parse(form.electricityConsumption);
    const efElectricity = parse(form.emissionFactorElectricity);
    const allofactorElectricity = electricity * efElectricity;

    const steam = parse(form.steamConsumptionNaturalGas);
    const efSteam = parse(form.emissionFactorSteamNaturalGas);
    const allofactorSteam = steam * efSteam;

    const yeast = parse(form.yeastFermentation);
    const efYeast = parse(form.emissionFactorYeast);
    const allofactorYeast = yeast * efYeast;

    const water = parse(form.freshWater);
    const efWater = parse(form.emissionFactorFreshWater);
    const allofactorWater = water * efWater;

    const alpha = parse(form.alphaAmylase);
    const beta = parse(form.glucoAmylase);
    const efAlpha = parse(form.emissionFactorAlphaAmylase);
    const efBeta = parse(form.emissionFactorGlucoAmylase);
    const allofactorEnzymes = alpha * efAlpha + beta * efBeta;

    const acid = parse(form.sulfuricAcid);
    const efAcid = parse(form.emissionFactorSulfuricAcid);
    const allofactorAcid = acid * efAcid;

    const naoh = parse(form.sodiumHydroxide);
    const efNaoh = parse(form.emissionFactorSodiumHydroxide);
    const allofactorNaoh = naoh * efNaoh;

    const urea = parse(form.urea);
    const efUrea = parse(form.emissionFactorUrea);
    const allofactorUrea = urea * efUrea;

    const allofactorTotal =
      allofactorElectricity +
      allofactorSteam +
      allofactorYeast +
      allofactorWater +
      allofactorEnzymes +
      allofactorAcid +
      allofactorNaoh +
      allofactorUrea;

    const allofactorPerTonBioethanol = allofactorTotal / totalInputDry;

    // Conversion
    const lowerCorn = parse(form.lowerCorn);
    const energyContent = lowerCorn * totalInputWet * 1000;

    const calculationBioethanol = parse(form.calculationBioethanol);
    const conversionFactor =
      calculationBioethanol > 0 ? energyContent / calculationBioethanol : 0;

    const bCultivation =
      lowerCorn > 0
        ? (cultivationEmissionsTotal / lowerCorn) * conversionFactor
        : 0;
    const bTransport =
      lowerCorn > 0
        ? (upstreamTransportMTCorn / lowerCorn) * conversionFactor
        : 0;

    // Allocation
    const allocation = parse(form.allocationBioethanol);
    const eec = bCultivation * allocation;
    const et = bTransport * allocation;
    const ep = lowerCorn > 0 ? (allofactorTotal / lowerCorn) * allocation : 0;

    const total = eec + et + ep;

    setForm((prev) => ({
      ...prev,
      totalInputDry: totalInputDry.toFixed(2),
      cultivationEmissionsTotal: cultivationEmissionsTotal.toFixed(2),
      upstreamTransportTotal: upstreamTransportTotal.toFixed(2),
      upstreamTransportMTCorn: upstreamTransportMTCorn.toFixed(4),
      allofactorElectricity: allofactorElectricity.toFixed(4),
      allofactorSteamNaturalGas: allofactorSteam.toFixed(4),
      allofactorYeast: allofactorYeast.toFixed(4),
      allofactorFreshWater: allofactorWater.toFixed(4),
      allofactorEnzymes: allofactorEnzymes.toFixed(4),
      allofactorSulfuricAcid: allofactorAcid.toFixed(4),
      allofactorSodiumHydroxide: allofactorNaoh.toFixed(4),
      allofactorUrea: allofactorUrea.toFixed(4),
      allofactorTotal: allofactorTotal.toFixed(4),
      allofactorPerTonBioethanol: allofactorPerTonBioethanol.toFixed(4),
      energyContent: energyContent.toFixed(2),
      conversionFactor: conversionFactor.toFixed(4),
      bCultivation: bCultivation.toFixed(4),
      bTransport: bTransport.toFixed(4),
      eec: eec.toFixed(4),
      et: et.toFixed(4),
      ep: ep.toFixed(4),
      totalEEC: eec.toFixed(4),
      totalET: et.toFixed(4),
      totalEEP: ep.toFixed(4),
      total: total.toFixed(4),
    }));
  }, [form]);

  return {
    form,
    handleChange,
    setForm,
  };
}
