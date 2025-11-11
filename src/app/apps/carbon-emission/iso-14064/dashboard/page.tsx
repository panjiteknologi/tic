'use client';

import { motion } from 'framer-motion';
import {
  Factory,
  Cloud,
  Boxes,
  LineChart,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/trpc/react';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  description
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
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();
  const tenantId = userProfile?.tenantId ?? '';

  const { data: projectsData, isLoading: projectsLoading } =
    trpc.iso14064Projects.getByTenantId.useQuery(
      { tenantId },
      { enabled: !!tenantId }
    );

  const projects = projectsData?.projects ?? [];

  if (projectsLoading) {
    return (
      <motion.section
        className="space-y-4 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">📊 Ringkasan ISO 14064-1:2018</h2>
        <p className="text-muted-foreground">Memuat data...</p>
      </motion.section>
    );
  }

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length;

  return (
    <motion.section
      className="space-y-4 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold">📊 Ringkasan ISO 14064-1:2018</h2>
      <p className="text-muted-foreground">
        Informasi mengenai proyek dan emisi karbon berdasarkan standar ISO
        14064-1:2018.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium text-blue-900">Total Proyek</h3>
          <p className="text-2xl font-bold">{totalProjects}</p>
          <p className="text-sm text-muted-foreground">Proyek ISO 14064</p>
        </div>
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium text-green-800">Proyek Aktif</h3>
          <p className="text-2xl font-bold">{activeProjects}</p>
          <p className="text-sm text-muted-foreground">Sedang berjalan</p>
        </div>
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium text-purple-800">Proyek Selesai</h3>
          <p className="text-2xl font-bold">{completedProjects}</p>
          <p className="text-sm text-muted-foreground">Telah diselesaikan</p>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-3">Proyek Terbaru</h3>
          <div className="space-y-2">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  {project.organizationName && (
                    <p className="text-sm text-muted-foreground">
                      {project.organizationName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{project.reportingYear}</p>
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

const ProjectsTab = () => {
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();
  const tenantId = userProfile?.tenantId ?? '';

  const { data: projectsData, isLoading: projectsLoading } =
    trpc.iso14064Projects.getByTenantId.useQuery(
      { tenantId },
      { enabled: !!tenantId }
    );

  const projects = projectsData?.projects ?? [];

  if (projectsLoading) {
    return (
      <motion.section
        className="space-y-4 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold">📋 Daftar Proyek</h2>
        <p className="text-muted-foreground">Memuat data proyek...</p>
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
      <h2 className="text-lg font-semibold">📋 Daftar Proyek</h2>
      <p className="text-muted-foreground">
        Semua proyek ISO 14064-1:2018 yang tersedia.
      </p>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-muted p-5 bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span>Tahun: {project.reportingYear}</span>
                  <span className="capitalize">{project.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Belum ada proyek. Silakan buat proyek baru.</p>
        </div>
      )}
    </motion.section>
  );
};

const TrendsTab = () => {
  return (
    <motion.section
      className="space-y-4 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg font-semibold">📈 Tren Emisi</h2>
      <p className="text-muted-foreground">
        Analisis tren emisi karbon dari waktu ke waktu.
      </p>
      <div className="mt-4 p-6 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Grafik tren akan ditampilkan di sini setelah ada data perhitungan.
        </p>
      </div>
    </motion.section>
  );
};

export default function ISO14064DashboardPage() {
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();
  const tenantId = userProfile?.tenantId ?? '';

  const { data: projectsData } = trpc.iso14064Projects.getByTenantId.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  const projects = projectsData?.projects ?? [];
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  const stats = [
    {
      title: 'Total Proyek',
      value: `${totalProjects}`,
      icon: Factory,
      description: 'Proyek ISO 14064'
    },
    {
      title: 'Proyek Aktif',
      value: `${activeProjects}`,
      icon: Cloud,
      description: 'Sedang berjalan'
    },
    {
      title: 'Tahun Aktif',
      value: `${new Set(projects.map((p) => p.reportingYear)).size}`,
      icon: Boxes,
      description: 'Tahun berbeda'
    }
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
            value="projects"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary transition-all"
          >
            <PieChart className="w-5 h-5" />
            Proyek
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
        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>
        <TabsContent value="trends">
          <TrendsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
