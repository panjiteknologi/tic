const cultivation = {
  transportType: {
    keterangan: "Type of transport",
    satuan: "",
    type: "text",
    disabled: false,
    placeholder: "e.g. Truck",
  },
  maxLoadTransport: {
    keterangan: "Maximum load of the transport mean",
    satuan: "mt/transport mean",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  totalCornTransported: {
    keterangan: "Total quantity of corn transported",
    satuan: "mt/Year",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  distanceLoaded: {
    keterangan: "Total distance loaded (average)",
    satuan: "km",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  distanceEmpty: {
    keterangan: "Total distance empty (average)",
    satuan: "km",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  fuelConsumptionLoaded: {
    keterangan: "Fuel consumption loaded",
    satuan: "L/km",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  fuelConsumptionEmpty: {
    keterangan: "Fuel consumption empty",
    satuan: "L/km",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  emissionFactorFuel: {
    keterangan: "Emission factor fuel",
    satuan: "kgCO2eq/L",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  upstreamTransportTotal: {
    keterangan: "Upstream transport corn",
    satuan: "kg CO2eq/Year",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  upstreamTransportPerTon: {
    keterangan: "Upstream transport per ton",
    satuan: "kgCO2eq/dry-mt corn",
    type: "number",
    disabled: false,
    placeholder: "",
  },
};

export default cultivation;
