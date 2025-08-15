const ghgCalculation = {
  totalEEC: {
    keterangan:
      "Emissions from the extraction or cultivation of raw materials (eec)",
    satuan: "g CO₂eq/MJ Bioethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  totalEEP: {
    keterangan: "Emissions from processing (ep)",
    satuan: "g CO₂eq/MJ Bioethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  totalET: {
    keterangan: "Emissions from transport and distribution (et)",
    satuan: "g CO₂eq/MJ Bioethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  totalEU: {
    keterangan: "Emissions from fuel in use (eu)",
    satuan: "g CO₂eq/MJ Bioethanol",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  total: {
    keterangan: "Total emissions bioethanol (l)",
    satuan: "g CO₂eq/MJ Bioethanol",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default ghgCalculation;
