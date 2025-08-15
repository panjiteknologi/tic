const energyA = {
  electricityConsumptionSoilPrep: {
    keterangan: "Electricity consumption for soil prep",
    satuan: "kWh/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  emissionFactorElectricity: {
    keterangan: "Emission factor",
    satuan: "kgCO₂eq/kWh",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eEmissionsElectricityYr: {
    keterangan: "CO2e emissions electricity",
    satuan: "kgCO₂eq/yr",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
  co2eEmissionsElectricityTFFB: {
    keterangan: "",
    satuan: "kgCO₂eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default energyA;
