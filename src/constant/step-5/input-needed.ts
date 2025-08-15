const inputNeeded = {
  totalInputWet: {
    keterangan: "Total input required for all products (wet)",
    satuan: "mt/corn",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  totalInputDry: {
    keterangan: "Total input required for all products (dry)",
    satuan: "dry-mt corn",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  cornMoisture: {
    keterangan: "Moisture content corn",
    satuan: "%",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
};

export default inputNeeded;
