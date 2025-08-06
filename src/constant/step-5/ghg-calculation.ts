const ghgCalculation = {
  totalEEC: {
    keterangan:
      "Emissions from the extraction or cultivation of raw materials (eec)",
    satuan: "g CO2eq/MJ Bioethanol",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  totalEEP: {
    keterangan: "Emissions from processing (ep)",
    satuan: "g CO2eq/MJ Bioethanol",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  totalET: {
    keterangan: "Emissions from transport and distribution (et)",
    satuan: "g CO2eq/MJ Bioethanol",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  totalEU: {
    keterangan: "Emissions from fuel in use (eu)",
    satuan: "g CO2eq/MJ Bioethanol",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  total: {
    keterangan: "Total emissions bioethanol (l)",
    satuan: "g CO2eq/MJ Bioethanol",
    type: "number",
    disabled: true,
    placeholder: "",
  },
};

export default ghgCalculation;
