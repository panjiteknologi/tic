const upstream = {
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
    labelColor: "text-black",
    bold: false,
  },
  totalCornTransported: {
    keterangan:
      "Total quantity of corn transported to produce all ethanol and co-products",
    satuan: "mt/Year",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  distanceLoaded: {
    keterangan: "Total distance loaded (average distances)",
    satuan: "km",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  distanceEmpty: {
    keterangan: "Total distance empty (average distances)",
    satuan: "km",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
};

export default upstream;
