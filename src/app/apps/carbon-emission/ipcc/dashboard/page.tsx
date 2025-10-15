"use client";

import { motion } from "framer-motion";
import {
  Factory,
  Truck,
  Cloud,
  Boxes,
  LineChart,
  Package,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineCharts } from "@/components/charts/line-chart";
import { trpc } from "@/trpc/react";

const iconMap = {
  ENERGY: {
    icon: Factory,
    color: "bg-blue-100 text-blue-600",
  },
  IPPU: {
    icon: Package,
    color: "bg-purple-100 text-purple-600",
  },
  AFOLU: {
    icon: Truck,
    color: "bg-green-100 text-green-600",
  },
  WASTE: {
    icon: Cloud,
    color: "bg-orange-100 text-orange-600",
  },
  OTHER: {
    icon: Boxes,
    color: "bg-gray-100 text-gray-600",
  },
};

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
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
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const OverviewTab = () => {
  const { data: overview, isLoading: overviewLoading } =
    trpc.ipccDashboard.getOverview.useQuery({});

  if (overviewLoading) {
    return (
      <motion.section
        className="space-y-4 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">📊 Ringkasan IPCC</h2>
        <p className="text-muted-foreground">Memuat data...</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="space-y-4 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold">📊 Ringkasan IPCC</h2>
      <p className="text-muted-foreground">
        Informasi mengenai proyek dan emisi karbon berdasarkan standar IPCC.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium text-blue-900">Total Proyek</h3>
          <p className="text-2xl font-bold">
            {overview?.overview.totalProjects || 0}
          </p>
          <p className="text-sm text-muted-foreground">Proyek IPCC aktif</p>
        </div>
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium text-green-800">Total Emisi</h3>
          <p className="text-2xl font-bold">
            {(overview?.overview.totalEmissions || 0).toFixed(2)} CO2e
          </p>
          <p className="text-sm text-muted-foreground">Ton CO2 equivalent</p>
        </div>
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium text-purple-800">Kalkulasi</h3>
          <p className="text-2xl font-bold">
            {overview?.overview.totalCalculations || 0}
          </p>
          <p className="text-sm text-muted-foreground">Total perhitungan</p>
        </div>
      </div>

      {overview?.recentProjects && overview.recentProjects.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-3">Proyek Terbaru</h3>
          <div className="space-y-2">
            {overview.recentProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.organizationName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{project.year}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
};

const SectorCard = ({
  sector,
  totalEmissions,
  projectCount,
  percentage,
}: {
  sector: "ENERGY" | "IPPU" | "AFOLU" | "WASTE" | "OTHER";
  totalEmissions: number;
  projectCount: number;
  percentage: number;
}) => {
  const entry = iconMap[sector];
  if (!entry) return null;
  const { icon: Icon, color } = entry;

  const sectorNames = {
    ENERGY: "Energi",
    IPPU: "Proses Industri",
    AFOLU: "Pertanian & Kehutanan",
    WASTE: "Limbah",
    OTHER: "Lainnya",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-muted p-5 bg-white shadow-sm hover:shadow-md transition-all">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-lg">{sectorNames[sector]}</h3>
        <p className="text-sm text-muted-foreground">
          {totalEmissions.toFixed(2)} CO2e • {projectCount} proyek
        </p>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(1)}% dari total emisi
        </p>
      </div>
    </div>
  );
};

const SectorsTab = () => {
  const { data: sectorAnalysis, isLoading: sectorLoading } =
    trpc.ipccDashboard.getSectorAnalysis.useQuery({});

  if (sectorLoading) {
    return (
      <motion.section
        className="space-y-4 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">🏭 Analisis Sektor</h2>
        <p className="text-muted-foreground">Memuat data sektor...</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="space-y-4 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold">🏭 Analisis Sektor</h2>
      <p className="text-muted-foreground">
        Breakdown emisi karbon berdasarkan sektor IPCC.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {sectorAnalysis?.sectorAnalysis.map((sector) => (
          <SectorCard
            key={sector.sector}
            sector={
              sector.sector as "ENERGY" | "IPPU" | "AFOLU" | "WASTE" | "OTHER"
            }
            totalEmissions={parseFloat(sector.totalCO2Equivalent || "0")}
            projectCount={sector.projectCount}
            percentage={sector.percentage}
          />
        ))}
      </div>
    </motion.section>
  );
};

const TrendsTab = () => {
  const { data: trends, isLoading: trendsLoading } =
    trpc.ipccDashboard.getEmissionTrends.useQuery({});

  if (trendsLoading) {
    return (
      <motion.section
        className="space-y-4 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">📈 Tren Emisi</h2>
        <p className="text-muted-foreground">Memuat data tren...</p>
      </motion.section>
    );
  }

  // Aggregate yearly data for chart
  const chartData =
    trends?.trends.reduce((acc: any[], trend) => {
      const existingYear = acc.find((item) => item.year === trend.year);
      if (existingYear) {
        existingYear.totalEmissions += parseFloat(
          trend.totalCO2Equivalent || "0"
        );
      } else {
        acc.push({
          year: trend.year.toString(),
          totalEmissions: parseFloat(trend.totalCO2Equivalent || "0"),
        });
      }
      return acc;
    }, []) || [];

  return (
    <motion.section
      className="space-y-4 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold">📈 Tren Emisi</h2>
      <p className="text-muted-foreground">
        Tren emisi karbon dari tahun ke tahun berdasarkan data IPCC.
      </p>
      
      {chartData.length > 0 && (
        <div className="rounded-lg border bg-white p-4 mt-2">
          <LineCharts
            data={chartData}
            config={{
              totalEmissions: {
                label: "Total Emisi (CO2e)",
                color: "hsl(var(--primary))",
              },
            }}
            label={`${chartData.length} tahun data`}
            description="Emisi CO2 equivalent per tahun"
          />
        </div>
      )}

      {trends?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium text-blue-900">Rentang Tahun</h3>
            <p className="text-lg font-bold">
              {trends.summary.totalYears} tahun
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium text-green-800">Sektor Aktif</h3>
            <p className="text-lg font-bold">
              {trends.summary.sectors.length} sektor
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium text-purple-800">Data Points</h3>
            <p className="text-lg font-bold">{trends.trends.length} entri</p>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default function IPCCDashboardPage() {
  const { data: overview } = trpc.ipccDashboard.getOverview.useQuery({});

  const stats = [
    {
      title: "Total Proyek",
      value: `${overview?.overview.totalProjects || 0}`,
      icon: Factory,
      description: "Proyek IPCC aktif",
    },
    {
      title: "Total Emisi",
      value: `${(overview?.overview.totalEmissions || 0).toFixed(1)} CO2e`,
      icon: Cloud,
      description: "Ton CO2 equivalent",
    },
    {
      title: "Kalkulasi",
      value: `${overview?.overview.totalCalculations || 0}`,
      icon: TrendingUp,
      description: "Total perhitungan",
    },
  ];

  return (
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
            value="sectors"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary transition-all"
          >
            <PieChart className="w-5 h-5" />
            Sektor
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary transition-all"
          >
            <LineChart className="w-5 h-5" />
            Tren
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="sectors">
          <SectorsTab />
        </TabsContent>
        <TabsContent value="trends">
          <TrendsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}