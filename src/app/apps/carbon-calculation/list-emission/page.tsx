"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Emission,
  EmissionTableListView,
} from "@/views/apps/carbon-calculation/emission-table-list-view";
import DashboardLayout from "@/layout/dashboard-layout";
import { CarbonCalculationMenu } from "@/constant/menu-sidebar";
import { AppSidebarTypes } from "@/types/sidebar-types";

const emissions: Emission[] = [
  {
    id: "1",
    source: "Raw Material Input (Corn Seeds)",
    type: "CO2eq",
    amount: 3,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "2",
    source: "Fertilizer - Nitrogen Fertilizer",
    type: "CO2eq",
    amount: 225.4,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "3",
    source: "Fertilizer Field N2O Emissions",
    type: "CO2eq",
    amount: 22.3,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "4",
    source: "Herbicides/Pesticides",
    type: "CO2eq",
    amount: 6.3,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "5",
    source: "Electricity Consumption",
    type: "CO2eq",
    amount: 0.17,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "6",
    source: "Diesel Consumption",
    type: "CO2eq",
    amount: 222.94,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "7",
    source: "Total Cultivation Emissions",
    type: "CO2eq",
    amount: 35.9,
    unit: "kgCO2eq/t FFB",
  },
  {
    id: "8",
    source: "Land Use Change Emissions",
    type: "CO2eq",
    amount: -87.34,
    unit: "kgCO2eq/ha/yr",
  },
  {
    id: "9",
    source: "LUC Emissions per kg corn",
    type: "CO2eq",
    amount: -0.007,
    unit: "kgCO2eq/kg corn",
  },
];

export default function EmissionsListPage() {
  const router = useRouter();

  return (
    <DashboardLayout
      href="/apps/carbon-calculation/list-emission"
      titleHeader="Carbon Calculation"
      subTitleHeader="Table List"
      menuSidebar={CarbonCalculationMenu as AppSidebarTypes}
    >
      <div className="-6 mb-6">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-black text-lg font-bold">Data Calculation</h2>
          <Button
            className="bg-sky-500 hover:bg-sky-700 cursor-pointer"
            onClick={() => router.push("/apps/carbon-calculation/add-emission")}
          >
            Add Emission
          </Button>
        </div>
        <div className="overflow-x-auto">
          <EmissionTableListView
            emissions={emissions}
            onEdit={(id) => console.log("Edit", id)}
            onDelete={(id) => console.log("Delete", id)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
