"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/layout/dashboard-layout";
import { CarbonCalculationMenu } from "@/constant/menu-sidebar";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { LineCharts } from "@/components/charts/line-chart";

const stats = [
  { title: "Total Produksi", value: "10.2 Ton" },
  { title: "Total Distribusi", value: "8.5 Ton" },
  { title: "Dampak Karbon", value: "5.3 CO₂e" },
];

const DashboardCard = ({ title, value }: { title: string; value: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.3 }}
    className="rounded-lg border bg-white p-6 shadow hover:shadow-md"
  >
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
  </motion.div>
);

const OverviewTab = () => (
  <section className="space-y-4 p-6">
    <h2 className="text-lg font-semibold text-foreground">Ringkasan</h2>
    <p className="text-muted-foreground">
      Informasi mengenai produksi & distribusi karbon secara keseluruhan.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-medium text-blue-900">Produksi Karbon</h3>
        <p className="text-muted-foreground">Total: 10.2 Ton</p>
      </div>
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-medium text-green-800">Distribusi Karbon</h3>
        <p className="text-muted-foreground">Total: 8.5 Ton</p>
      </div>
    </div>
  </section>
);

const ProductCard = ({
  name,
  image,
  description,
}: {
  name: string;
  image: string;
  description: string;
}) => (
  <div className="flex items-center gap-4 rounded-lg border p-4 bg-white shadow">
    <img src={image} alt={name} className="w-16 h-16 object-cover rounded-md" />
    <div>
      <h3 className="font-semibold text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ProductsTab = () => (
  <section className="space-y-4 p-6">
    <h2 className="text-lg font-semibold text-foreground">Produk Karbon</h2>
    <p className="text-muted-foreground">
      Daftar produk karbon dan penggunaannya.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ProductCard
        name="Gas Karbon Industri"
        image="/images/gas1.jpg"
        description="Untuk keperluan industri berat."
      />
      <ProductCard
        name="Gas Karbon Medis"
        image="/images/gas2.jpg"
        description="Untuk laboratorium dan medis."
      />
      <ProductCard
        name="Gas Karbon Makanan"
        image="/images/gas3.jpg"
        description="Pengawetan makanan & minuman."
      />
    </div>
  </section>
);

const StatisticsTab = () => (
  <section className="space-y-4 p-6">
    <h2 className="text-lg font-semibold text-foreground">
      Statistik Konsumsi
    </h2>
    <p className="text-muted-foreground">
      Data grafik konsumsi karbon secara berkala.
    </p>

    <div className="rounded-lg border bg-white p-4">
      <LineCharts
        data={[
          { time: "10:00", CO2: 400 },
          { time: "11:00", CO2: 420 },
          { time: "12:00", CO2: 450 },
        ]}
        config={{
          CO2: { label: "CO₂", color: "hsl(var(--primary))" },
        }}
        label="Naik 5.2% hari ini"
        description="Kadar CO₂ per jam"
      />
    </div>
  </section>
);

export default function CarbonDashboardPage() {
  return (
    <DashboardLayout
      href="/apps/carbon-calculation/dashboard"
      titleHeader="Carbon Calculation"
      subTitleHeader="Dashboard"
      menuSidebar={CarbonCalculationMenu as AppSidebarTypes}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {stats.map((s) => (
          <DashboardCard key={s.title} {...s} />
        ))}
      </div>

      <Tabs defaultValue="overview" className="mt-8 w-full">
        <TabsList className="w-full bg-white shadow rounded-md p-1">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="flex-1">
            Produk
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-1">
            Statistik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
