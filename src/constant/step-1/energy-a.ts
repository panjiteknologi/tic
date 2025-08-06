const energyA = {
  electricityConsumptionSoilPrep: {
    keterangan: "Electricity consumption for soil prep",
    satuan: "kWh/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  emissionFactorElectricity: {
    keterangan: "Emission factor",
    satuan: "kgCO2eq/kWh",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  co2eEmissionsElectricityYr: {
    keterangan: "CO2e emissions electricity",
    satuan: "kgCO2eq/yr",
    type: "number",
    disabled: true,
    placeholder: "",
  },
  co2eEmissionsElectricityTFFB: {
    keterangan: "",
    satuan: "kgCO2eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
  },
};

export default energyA;
