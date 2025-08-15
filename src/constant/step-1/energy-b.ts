const energyB = {
  dieselConsumed: {
    keterangan: "Diesel consumed",
    satuan: "L/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  emissionFactorDiesel: {
    keterangan: "Emission factor diesel",
    satuan: "kgCO₂eq/L",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eEmissionsDieselYr: {
    keterangan: "CO2e emissions diesel",
    satuan: "kgCO₂eq/yr",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
  co2eEmissionsDieselTFFB: {
    keterangan: "",
    satuan: "kgCO₂eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default energyB;
