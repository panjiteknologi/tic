const rawMaterial = {
  cornSeedsAmount: {
    keterangan: "Amount of corn seeds needed",
    satuan: "kg/ha/yr",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  emissionFactorCornSeeds: {
    keterangan: "Emission factor corn seeds",
    satuan: "kgCO₂eq/kg",
    type: "number",
    disabled: false,
    placeholder: "",
  },
  co2eqEmissionsRawMaterialInputHaYr: {
    keterangan: "CO₂eq emissions raw material input",
    satuan: "kgCO₂eq/ha/yr",
    type: "number",
    disabled: true,
    placeholder: "",
  },
  co2eqEmissionsRawMaterialInputTFFB: {
    keterangan: "",
    satuan: "kgCO₂eq/t FFB",
    type: "number",
    disabled: true,
    placeholder: "",
  },
};

export default rawMaterial;
