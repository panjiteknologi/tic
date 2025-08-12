const cultivation = {
  originOfCorn: {
    keterangan: "Origin of corn",
    satuan: "",
    type: "text",
    disabled: false,
    placeholder: "e.g. Europe",
    labelColor: "text-black",
    bold: false,
  },
  cultivationEmissionsTotal: {
    keterangan: "Emissions for total amount of corn",
    satuan: "kg CO₂eq/Year",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  cultivationEmissionsPerTon: {
    keterangan: "Emissions per wet-ton of corn",
    satuan: "kg CO₂eq/wet mt corn",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default cultivation;
