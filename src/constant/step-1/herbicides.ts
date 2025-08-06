const herbicides = {
  acetochlor: {
    keterangan: "Acetochlor",
    satuan: "kg/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  emissionFactorPesticides: {
    keterangan: "Emission factor pesticides",
    satuan: "kgCO2eq/kg",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  co2eqEmissionsHerbicidesPesticidesHaYr: {
    keterangan: "CO2eq emissions herbicides/pesticides",
    satuan: "kgCO2eq/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  co2eqEmissionsHerbicidesPesticidesTFFB: {
    keterangan: "",
    satuan: "kgCO2eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
  },
};

export default herbicides;
