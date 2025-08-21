import { formatNumber, parseNumber } from "@/utils/number";
import { useEffect, useState } from "react";

export type CarbonFormType = Record<string, string>;

export function useCalculationOtherCase() {
  const [form, setForm] = useState<CarbonFormType>({
    //Product Main
    ethanolExampleYear: "", //33
    moistureContent: "", //34

    //CO Product
    cornOil: "", //37
    cornOilMoisture: "", //38
    ddgs: "", //39
    ddgsMoisture: "", //40
    wdg: "", //41
    wdgMoisture: "", //42
    syrup: "", //43
    syrupMoisture: "", //44

    //Input Needed
    totalInputWet: "", //47
    cornMoisture: "", //49
    totalInputDry: "", //48 ->=E47-(E47*E49/100)

    //Cultivation emissions
    cultivationEmissionsTotal: "", //55
    cultivationEmissionsPerTon: "", //56

    //Upstream transport
    maxLoadTransport: "", //63
    totalCornTransported: "", //64
    distanceLoaded: "", //65
    distanceEmpty: "", //66
    fuelConsumptionLoaded: "", //69
    fuelConsumptionEmpty: "", //70
    emissionFactorFuel: "", //71
    upstreamTransportTotal: "", //74 ->=((E64/E63)*(E65*E69+E66*E70)*E71)
    upstreamTransportMTCorn: "", //75 ->=(E64/E63*E65*$E$70+E64/E63*E66*$E$70)*$E$71/E64/(1-(E49/100))

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
    lowerSyrup: "", //139
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
    const totalInputWet = parseNumber(form.totalInputWet);
    const cornMoisture = parseNumber(form.cornMoisture);
    const totalInputDry = totalInputWet - (totalInputWet * cornMoisture) / 100;

    const cultivationEmissionsPerTon = parseNumber(
      form.cultivationEmissionsPerTon
    );
    const cultivationEmissionsTotal =
      cultivationEmissionsPerTon * totalInputDry;

    const maxLoadTransport = parseNumber(form.maxLoadTransport);
    const totalCornTransported = parseNumber(form.totalCornTransported);
    const distanceLoaded = parseNumber(form.distanceLoaded);
    const distanceEmpty = parseNumber(form.distanceEmpty);
    const fuelConsumptionLoaded = parseNumber(form.fuelConsumptionLoaded);
    const fuelConsumptionEmpty = parseNumber(form.fuelConsumptionEmpty);
    const emissionFactorFuel = parseNumber(form.emissionFactorFuel);

    const upstreamTransportTotal =
      (totalCornTransported / maxLoadTransport) *
      (distanceLoaded * fuelConsumptionLoaded +
        distanceEmpty * fuelConsumptionEmpty) *
      emissionFactorFuel;

    const upstreamTransportMTCorn =
      (((totalCornTransported / maxLoadTransport) *
        distanceLoaded *
        fuelConsumptionEmpty +
        (totalCornTransported / maxLoadTransport) *
          distanceEmpty *
          fuelConsumptionEmpty) *
        emissionFactorFuel) /
      totalCornTransported /
      (1 - cornMoisture / 100);

    const electricityConsumption = parseNumber(form.electricityConsumption);
    const ethanolExampleYear = parseNumber(form.ethanolExampleYear);
    const steamConsumptionNaturalGas = parseNumber(
      form.steamConsumptionNaturalGas
    );
    const yeastFermentation = parseNumber(form.yeastFermentation);
    const freshWater = parseNumber(form.freshWater);
    const alphaAmylase = parseNumber(form.alphaAmylase);
    const glucoAmylase = parseNumber(form.glucoAmylase);
    const sulfuricAcid = parseNumber(form.sulfuricAcid);
    const sodiumHydroxide = parseNumber(form.sodiumHydroxide);
    const urea = parseNumber(form.urea);
    const emissionFactorElectricity = parseNumber(
      form.emissionFactorElectricity
    );
    const emissionFactorNaturalGas = parseNumber(form.emissionFactorNaturalGas);
    const emissionFactorYeast = parseNumber(form.emissionFactorYeast);
    const emissionFactorFreshWater = parseNumber(form.emissionFactorFreshWater);
    const emissionFactorAlphaAmylase = parseNumber(
      form.emissionFactorAlphaAmylase
    );
    const emissionFactorGlucoAmylase = parseNumber(
      form.emissionFactorGlucoAmylase
    );
    const emissionFactorSulfuricAcid = parseNumber(
      form.emissionFactorSulfuricAcid
    );
    const emissionFactorSodiumHydroxide = parseNumber(
      form.emissionFactorSodiumHydroxide
    );

    const allofactorElectricity =
      electricityConsumption * emissionFactorElectricity;
    const allofactorSteamNaturalGas =
      steamConsumptionNaturalGas * emissionFactorNaturalGas;
    const allofactorYeast = yeastFermentation * emissionFactorYeast;
    const allofactorWater = freshWater * emissionFactorFreshWater;
    const allofactorEnzymes =
      alphaAmylase * emissionFactorAlphaAmylase +
      glucoAmylase * emissionFactorGlucoAmylase;
    const allofactorSulfuricAcid = sulfuricAcid * emissionFactorSulfuricAcid;
    const allofactorSodiumHydroxide =
      sodiumHydroxide * emissionFactorSodiumHydroxide;
    const allofactorUrea = urea * emissionFactorSodiumHydroxide;
    const allofactorTotal =
      allofactorElectricity +
      allofactorSteamNaturalGas +
      allofactorYeast +
      allofactorWater +
      allofactorEnzymes +
      allofactorSulfuricAcid +
      allofactorSodiumHydroxide +
      allofactorUrea;
    const allofactorPerTonBioethanol = allofactorTotal / ethanolExampleYear;

    const lowerCorn = parseNumber(form.lowerCorn);
    const energyContent = lowerCorn * totalInputWet * 1000;

    const lowerBioethanol = parseNumber(form.lowerBioethanol);
    const moistureContent = parseNumber(form.moistureContent);
    const calculationBioethanol =
      (ethanolExampleYear - (ethanolExampleYear * moistureContent) / 100) *
      lowerBioethanol *
      1000;
    const conversionFactor = energyContent / calculationBioethanol;

    const bCultivation =
      (cultivationEmissionsPerTon / lowerCorn) * conversionFactor;
    const bTransport = (upstreamTransportMTCorn / lowerCorn) * conversionFactor;

    const lowerCornOil = parseNumber(form.lowerCornOil);
    const lowerWdg = parseNumber(form.lowerWdg);
    const lowerSyrup = parseNumber(form.lowerSyrup);
    const cornOil = parseNumber(form.cornOil);
    const cornOilMoisture = parseNumber(form.cornOilMoisture);
    const ddgs = parseNumber(form.ddgs);
    const ddgsMoisture = parseNumber(form.ddgsMoisture);
    const wdg = parseNumber(form.wdg);
    const wdgMoisture = parseNumber(form.wdgMoisture);
    const syrup = parseNumber(form.syrup);
    const syrupMoisture = parseNumber(form.syrupMoisture);

    const calculationCornOil =
      (cornOil - (cornOil * cornOilMoisture) / 100) * lowerCornOil * 1000;
    const calculationDdgs =
      (ddgs - (ddgs * ddgsMoisture) / 100) * 1000 * lowerWdg;
    const calculationWdg = (wdg - (wdg * wdgMoisture) / 100) * 1000 * lowerWdg;
    const calculationSyrup =
      (syrup - (syrup * syrupMoisture) / 100) * 1000 * lowerSyrup;
    const calculationTotal =
      calculationBioethanol +
      calculationCornOil +
      calculationDdgs +
      calculationWdg +
      calculationSyrup;

    const allocationBioethanol = calculationBioethanol / calculationTotal;
    const allocationCornOil = calculationCornOil / calculationTotal;
    const allocationDdgs = calculationDdgs / calculationTotal;
    const allocationSyrup = calculationSyrup / calculationTotal;

    const eec = bCultivation * allocationBioethanol;
    const et = bTransport * allocationBioethanol;
    const ep = (allofactorPerTonBioethanol / lowerCorn) * allocationBioethanol;
    const totalEEC = eec;
    const totalEEP = ep;
    const totalET = et;
    const total = totalEEC + totalEEP;

    setForm((prev) => ({
      ...prev,
      totalInputDry: formatNumber(totalInputDry, 1, "none"),
      cultivationEmissionsTotal: formatNumber(
        cultivationEmissionsTotal,
        1,
        "none"
      ),
      upstreamTransportTotal: formatNumber(upstreamTransportTotal, 1, "none"),
      upstreamTransportMTCorn: formatNumber(upstreamTransportMTCorn, 1, "none"),
      allofactorElectricity: formatNumber(allofactorElectricity, 2, "none"),
      allofactorSteamNaturalGas: formatNumber(
        allofactorSteamNaturalGas,
        2,
        "none"
      ),
      allofactorYeast: formatNumber(allofactorYeast, 2, "none"),
      allofactorFreshWater: formatNumber(allofactorWater, 1, "none"),
      allofactorEnzymes: formatNumber(allofactorEnzymes, 1, "none"),
      allofactorSulfuricAcid: formatNumber(allofactorSulfuricAcid, 1, "none"),
      allofactorSodiumHydroxide: formatNumber(
        allofactorSodiumHydroxide,
        1,
        "none"
      ),
      allofactorUrea: formatNumber(allofactorUrea, 2, "none"),
      allofactorTotal: formatNumber(allofactorTotal, 0, "none"),
      allofactorPerTonBioethanol: formatNumber(
        allofactorPerTonBioethanol,
        3,
        "none"
      ),
      energyContent: formatNumber(energyContent, 1, "none"),
      conversionFactor: formatNumber(conversionFactor, 1, "none"),
      bCultivation: formatNumber(bCultivation, 1, "none"),
      bTransport: formatNumber(bTransport, 1, "none"),
      calculationBioethanol: formatNumber(calculationBioethanol, 0, "none"),
      calculationCornOil: formatNumber(calculationCornOil, 0, "none"),
      calculationDdgs: formatNumber(calculationDdgs, 0, "none"),
      calculationWdg: formatNumber(calculationWdg, 0, "none"),
      calculationSyrup: formatNumber(calculationSyrup, 0, "none"),
      calculationTotal: formatNumber(calculationTotal, 0, "none"),
      allocationBioethanol: formatNumber(allocationBioethanol, 2, "none"),
      allocationCornOil: formatNumber(allocationCornOil, 2, "none"),
      allocationDdgs: formatNumber(allocationDdgs, 2, "none"),
      allocationSyrup: formatNumber(allocationSyrup, 2, "none"),
      eec: formatNumber(eec, 2, "none"),
      et: formatNumber(et, 2, "none"),
      ep: formatNumber(ep, 2, "none"),
      totalEEC: formatNumber(totalEEC, 2, "none"),
      totalEEP: formatNumber(totalEEP, 2, "none"),
      totalET: formatNumber(totalET, 2, "none"),
      total: formatNumber(total, 2, "none"),
    }));
  }, [
    form.alphaAmylase,
    form.cornMoisture,
    form.cornOil,
    form.cornOilMoisture,
    form.cultivationEmissionsPerTon,
    form.ddgs,
    form.ddgsMoisture,
    form.distanceEmpty,
    form.distanceLoaded,
    form.electricityConsumption,
    form.emissionFactorAlphaAmylase,
    form.emissionFactorElectricity,
    form.emissionFactorFreshWater,
    form.emissionFactorFuel,
    form.emissionFactorGlucoAmylase,
    form.emissionFactorNaturalGas,
    form.emissionFactorSodiumHydroxide,
    form.emissionFactorSulfuricAcid,
    form.emissionFactorYeast,
    form.ethanolExampleYear,
    form.freshWater,
    form.fuelConsumptionEmpty,
    form.fuelConsumptionLoaded,
    form.glucoAmylase,
    form.lowerBioethanol,
    form.lowerCorn,
    form.lowerCornOil,
    form.lowerSyrup,
    form.lowerWdg,
    form.maxLoadTransport,
    form.moistureContent,
    form.sodiumHydroxide,
    form.steamConsumptionNaturalGas,
    form.sulfuricAcid,
    form.syrup,
    form.syrupMoisture,
    form.totalCornTransported,
    form.totalInputWet,
    form.urea,
    form.wdg,
    form.wdgMoisture,
    form.yeastFermentation,
  ]);

  return {
    form,
    handleChange,
    setForm,
  };
}
