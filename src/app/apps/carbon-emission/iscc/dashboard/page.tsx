"use client";

import { motion } from "framer-motion";
import {
  Factory,
  Truck,
  Cloud,
  Boxes,
  LineChart,
  Package,
  PackageSearch,
  HeartPulse,
  FlaskConical,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/layout/dashboard-layout";
import { CarbonProjectISCCMenu } from "@/constant/menu-sidebar";
import { AppSidebarTypes } from "@/types/sidebar-types";
import { LineCharts } from "@/components/charts/line-chart";

const stats = [
  { title: "Total Produksi", value: "10.2 Ton", icon: Factory },
  { title: "Total Distribusi", value: "8.5 Ton", icon: Truck },
  { title: "Dampak Karbon", value: "5.3 CO₂e", icon: Cloud },
];

const iconMap = {
  industrial: {
    icon: PackageSearch,
    color: "bg-blue-100 text-blue-600",
  },
  medical: {
    icon: HeartPulse,
    color: "bg-red-100 text-red-600",
  },
  food: {
    icon: FlaskConical,
    color: "bg-green-100 text-green-600",
  },
};

const DashboardCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.3 }}
    className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 bg-primary/10 rounded-md text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </motion.div>
);

const OverviewTab = () => (
  <motion.section
    className="space-y-4 p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="text-lg font-semibold">📊 Ringkasan</h2>
    <p className="text-muted-foreground">
      Informasi mengenai produksi & distribusi karbon secara keseluruhan.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-medium text-blue-900">Produksi Karbon</h3>
        <p className="text-muted-foreground">Total: 10.2 Ton</p>
      </div>
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-medium text-green-800">Distribusi Karbon</h3>
        <p className="text-muted-foreground">Total: 8.5 Ton</p>
      </div>
    </div>
  </motion.section>
);

const ProductCard = ({
  name,
  description,
  type,
}: {
  name: string;
  description: string;
  type: "industrial" | "medical" | "food";
}) => {
  const entry = iconMap[type];
  if (!entry) return null;
  const { icon: Icon, color } = entry;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-muted p-5 bg-white shadow-sm hover:shadow-md transition-all">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};

const ProductsTab = () => (
  <motion.section
    className="space-y-4 p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="text-lg font-semibold">📦 Produk Karbon</h2>
    <p className="text-muted-foreground">
      Daftar produk karbon dan penggunaannya.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <ProductCard
        name="Gas Karbon Industri"
        description="Untuk keperluan industri berat."
        type="industrial"
      />
      <ProductCard
        name="Gas Karbon Medis"
        description="Untuk laboratorium dan medis."
        type="medical"
      />
      <ProductCard
        name="Gas Karbon Makanan"
        description="Pengawetan makanan & minuman."
        type="food"
      />
    </div>
  </motion.section>
);

const StatisticsTab = () => (
  <motion.section
    className="space-y-4 p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="text-lg font-semibold">📈 Statistik Konsumsi</h2>
    <p className="text-muted-foreground">
      Data grafik konsumsi karbon secara berkala.
    </p>
    <div className="rounded-lg border bg-white p-4 mt-2">
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
  </motion.section>
);

export default function CarbonDashboardPage() {
  return (
    <DashboardLayout
      href="/apps/carbon-calculation/dashboard"
      titleHeader="Carbon Calculation"
      subTitleHeader="Dashboard"
      menuSidebar={CarbonProjectISCCMenu as AppSidebarTypes}
    >
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {stats.map((s) => (
            <DashboardCard key={s.title} {...s} />
          ))}
        </div>

        <Tabs defaultValue="overview" className="mt-8 w-full h-50">
          <TabsList className="w-full bg-muted rounded-xl p-1 flex gap-2 shadow-inner">
            <TabsTrigger
              value="overview"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary transition-all"
            >
              <Boxes className="w-5 h-5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary transition-all"
            >
              <Package className="w-5 h-5" />
              Produk
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary transition-all"
            >
              <LineChart className="w-5 h-5" />
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
      </div>
    </DashboardLayout>
  );
}
