const heatProduction = {
  heatNaturalGas: {
    keterangan: "Heat from natural gas",
    satuan: "MJ/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  emissionFactorNaturalGas: {
    keterangan: "Emission factor natural gas",
    satuan: "kg CO2e/MJ",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eHeatProduction: {
    keterangan: "CO2e emissions heat production",
    satuan: "kg CO2e/yr",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default heatProduction;
