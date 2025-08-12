const upstreamTransport = {
  fuelConsumptionLoaded: {
    keterangan: "Fuel consumption loaded",
    satuan: "L/km",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  fuelConsumptionEmpty: {
    keterangan: "Fuel consumption empty",
    satuan: "L/km",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  emissionFactorFuel: {
    keterangan: "Emission factor fuel",
    satuan: "kgCO₂eq/L",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  upstreamTransportTotal: {
    keterangan: "Upstream transport corn",
    satuan: "kg CO₂eq/Year",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
  upstreamTransportMTCorn: {
    keterangan: "",
    satuan: "kgCO₂eq/dry-mt corn",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
};

export default upstreamTransport;
