"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/layout/dashboard-layout";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { CarbonCalculationMenu } from "@/constant/menu-sidebar";
import { useForm } from "react-hook-form";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

type FormValues = {
  material: string;
  origin: string;
  distance: number;
  transportMode: string;
  conversionEfficiency: number;
  energyContent: number;
  emissionFactor: number;
};

const COLORS = ["#8884d8", "#82ca9d"];

export default function CarbonCalculationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [result, setResult] = useState<{
    transportEmission: number;
    processingEmission: number;
    totalEmission: number;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const onSubmit = (data: FormValues) => {
    const { distance, transportMode, energyContent, emissionFactor } = data;

    let transportEmissionFactor = 0;
    switch (transportMode) {
      case "truck":
        transportEmissionFactor = 62;
        break;
      case "ship":
        transportEmissionFactor = 16;
        break;
      case "train":
        transportEmissionFactor = 22;
        break;
    }

    const transportEmission = distance * transportEmissionFactor;
    const processingEmission = emissionFactor * energyContent;
    const totalEmission =
      (transportEmission + processingEmission) / energyContent;

    setResult({
      transportEmission,
      processingEmission,
      totalEmission,
    });
  };

  return (
    <DashboardLayout
      href="/apps/carbon-calculation"
      titleHeader="Carbon Emission Calculator"
      subTitleHeader="Estimate emissions based on transport & processing"
      menuSidebar={CarbonCalculationMenu as AppSidebarTypes}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Input Data</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-white p-6 rounded-xl shadow"
        >
          <div>
            <label className="block font-medium">Material Type</label>
            <select {...register("material")} className="input w-full mt-1">
              <option value="UCO">UCO</option>
              <option value="Tallow">Tallow</option>
              <option value="POME">POME</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Feedstock Origin</label>
            <input
              type="text"
              {...register("origin")}
              className="input w-full mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Distance to Plant (km)</label>
            <input
              type="number"
              {...register("distance")}
              className="input w-full mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Transport Mode</label>
            <select
              {...register("transportMode")}
              className="input w-full mt-1"
            >
              <option value="truck">Truck</option>
              <option value="ship">Ship</option>
              <option value="train">Train</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">
              Conversion Efficiency (%)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("conversionEfficiency")}
              className="input w-full mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Energy Content (MJ/kg)</label>
            <input
              type="number"
              step="0.01"
              {...register("energyContent")}
              className="input w-full mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">
              Emission Factor (g CO₂/MJ)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("emissionFactor")}
              className="input w-full mt-1"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Calculate Emission
          </button>
        </form>

        {result && (
          <div className="bg-gray-100 p-6 rounded-xl mt-6">
            <h2 className="text-lg font-bold mb-4">Result Summary</h2>
            <p>
              <strong>Transport Emission:</strong>{" "}
              {result.transportEmission.toFixed(2)} g CO₂
            </p>
            <p>
              <strong>Processing Emission:</strong>{" "}
              {result.processingEmission.toFixed(2)} g CO₂
            </p>
            <p>
              <strong>Total Emission:</strong> {result.totalEmission.toFixed(2)}{" "}
              g CO₂ / MJ
            </p>

            <div className="mt-6 flex justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={[
                    { name: "Transport", value: result.transportEmission },
                    { name: "Processing", value: result.processingEmission },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
