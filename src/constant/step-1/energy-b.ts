const energyB = {
  dieselConsumed: {
    keterangan: "Diesel consumed",
    satuan: "L/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  emissionFactorDiesel: {
    keterangan: "Emission factor diesel",
    satuan: "kgCO2eq/L",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  co2eEmissionsDieselYr: {
    keterangan: "CO2e emissions diesel",
    satuan: "kgCO2eq/yr",
    type: "number",
    disabled: true,
    placeholder: "",
  },
  co2eEmissionsDieselTFFB: {
    keterangan: "",
    satuan: "kgCO2eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
  },
};

export default energyB;
