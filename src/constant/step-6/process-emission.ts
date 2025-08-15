const processEmission = {
  co2eEmissions1: {
    keterangan: "CO2e emissions",
    satuan: "kg CO2e/yr",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eEmissions2: {
    keterangan: "",
    satuan: "kg CO2e/t ethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eEmissions3: {
    keterangan: "",
    satuan: "g CO₂eq/MJ ethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  allocatedProcessingEmissions: {
    keterangan: "Allocated processing emissions",
    satuan: "g CO₂eq/MJ ethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default processEmission;
