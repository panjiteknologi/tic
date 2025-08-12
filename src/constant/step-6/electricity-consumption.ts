import { TruckElectric } from "lucide-react";

const electricityConsumption = {
  ethanolProduction: {
    keterangan: "Electricity for ethanol production",
    satuan: "kWh/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2liquefication: {
    keterangan: "Electricity for CO2 liquefication",
    satuan: "kWh/yr",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  factorElectricity: {
    keterangan: "Emission factor electricity",
    satuan: "kg CO2e/kWh",
    type: "number",
    disabled: false,
    placeholder: "",
    labelColor: "text-black",
    bold: false,
  },
  co2eEmissionsElectricity: {
    keterangan: "CO2e emissions electricity",
    satuan: "kg CO2e/yr",
    type: "number",
    disabled: TruckElectric,
    placeholder: "",
    labelColor: "text-black",
    bold: true,
  },
};

export default electricityConsumption;
