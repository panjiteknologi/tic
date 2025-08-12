const herbicides = {
  acetochlor: {
    keterangan: "Acetochlor",
    satuan: "kg/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  emissionFactorPesticides: {
    keterangan: "Emission factor pesticides",
    satuan: "kgCO₂eq/kg",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eqEmissionsHerbicidesPesticidesHaYr: {
    keterangan: "CO₂eq emissions herbicides/pesticides",
    satuan: "kgCO₂eq/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
  co2eqEmissionsHerbicidesPesticidesTFFB: {
    keterangan: "",
    satuan: "kgCO₂eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default herbicides;
