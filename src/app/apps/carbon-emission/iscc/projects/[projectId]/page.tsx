/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/layout/dashboard-layout";
import { getCarbonCalculationMenu } from "@/constant/menu-sidebar";
import { CarbonCalculationView } from "@/views/apps/carbon-emission/projects/project-detail/carbon-calculation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { EmissionsTypes } from "@/types/carbon-types";
import { trpc } from "@/trpc/react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { DialogInfo } from "@/components/ui/dialog-info";
import { useCarbonCalculationData } from "@/hooks/use-carbon-calculation-data";

type payloadType = {
  id: number;
  carbonProjectId: string;
  keterangan: string;
  nilaiInt: number | string;
  nilaiString: string;
  satuan: string;
  source: string;
};

export default function CalculationListPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { projectId } = useParams();
  const carbonProjectId = String(projectId);

  const [activeStep, setActiveStep] = useState("step1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState("");
  const [infoDialogDesc, setInfoDialogDesc] = useState("");
  const [infoVariant, setInfoVariant] = useState<"success" | "error" | "info">(
    "info"
  );

  const {
    isLoading,
    verifications,
    calculations,
    process,
    additional,
    otherCase,
    audit,
    refetchAll,
  } = useCarbonCalculationData();

  const tabs = [
    {
      value: "step1",
      label: "Step 1 | GHG Verification",
      data: verifications?.stepSatuGhgVerifications ?? [],
    },
    {
      value: "step2",
      label: "Step 2 | GHG Calculation",
      data: calculations?.stepDuaGhgCalculations ?? [],
    },
    {
      value: "step3",
      label: "Step 3 | GHG Process",
      data: process?.stepTigaGhgCalculationProcesses ?? [],
    },
    {
      value: "step4",
      label: "Step 4 | Add",
      data: additional?.stepTigaAdditionals ?? [],
    },
    {
      value: "step5",
      label: "Step 5 | Other Case",
      data: otherCase?.stepTigaOtherCases ?? [],
    },
    {
      value: "step6",
      label: "Step 6 | GHG Audit",
      data: audit?.stepEmpatGhgAudits ?? [],
    },
  ];

  const mutations = {
    update: {
      step1: trpc.stepOneGhgVerification.update.useMutation(),
      step2: trpc.stepTwoGhgCalculation.update.useMutation(),
      step3: trpc.stepThreeGhgProcess.update.useMutation(),
      step4: trpc.stepThreeGhgAdditional.update.useMutation(),
      step5: trpc.stepThreeGhgOtherCase.update.useMutation(),
      step6: trpc.stepFourGhgAudit.update.useMutation(),
    },
    delete: {
      step1: trpc.stepOneGhgVerification.delete.useMutation(),
      step2: trpc.stepTwoGhgCalculation.delete.useMutation(),
      step3: trpc.stepThreeGhgProcess.delete.useMutation(),
      step4: trpc.stepThreeGhgAdditional.delete.useMutation(),
      step5: trpc.stepThreeGhgOtherCase.delete.useMutation(),
      step6: trpc.stepFourGhgAudit.delete.useMutation(),
    },
  };

  const invalidateCacheByStep = async (
    activeStep: string,
    carbonProjectId: string
  ) => {
    const stepInvalidationMap: Record<string, () => Promise<void>> = {
      step1: async () => {
        await utils.stepOneGhgVerification.getByCarbonProjectId.invalidate({
          carbonProjectId,
        });
      },
      step2: async () => {
        await utils.stepTwoGhgCalculation.getByCarbonProjectId.invalidate({
          carbonProjectId,
        });
      },
      step3: async () => {
        await utils.stepThreeGhgProcess.getByCarbonProjectId.invalidate({
          carbonProjectId,
        });
      },
      step4: async () => {
        await utils.stepThreeGhgAdditional.getByCarbonProjectId.invalidate({
          carbonProjectId,
        });
      },
      step5: async () => {
        await utils.stepThreeGhgOtherCase.getByCarbonProjectId.invalidate({
          carbonProjectId,
        });
      },
      step6: async () => {
        await utils.stepFourGhgAudit.getByCarbonProjectId.invalidate({
          carbonProjectId,
        });
      },
    };

    const invalidate = stepInvalidationMap[activeStep];
    if (invalidate) {
      await invalidate();
    } else {
      console.error(`Invalid step: ${activeStep}`);
    }
  };

  const handleEdit = async (updated: EmissionsTypes) => {
    try {
      const payload: payloadType = {
        id: Number(updated.id),
        carbonProjectId,
        keterangan: updated.keterangan ?? "",
        nilaiInt: updated.nilaiInt !== undefined ? Number(updated.nilaiInt) : 0,
        nilaiString: updated.nilaiString ?? "",
        satuan: updated.satuan ?? "",
        source: updated.source ?? "",
      };

      const mutation =
        mutations.update[activeStep as keyof typeof mutations.update];
      if (!mutation) throw new Error("Unknown step");

      await mutation.mutateAsync(payload as any);
      await invalidateCacheByStep(activeStep, carbonProjectId);

      setInfoVariant("success");
      setInfoDialogTitle("Data berhasil diperbarui");
      setInfoDialogDesc(`Data berhasil diperbarui.`);
      setInfoDialogOpen(true);
    } catch (error: any) {
      setInfoVariant("error");
      setInfoDialogTitle("Gagal mengedit project");
      setInfoDialogDesc(
        error.message ?? "Terjadi kesalahan saat menyimpan data."
      );
      setInfoDialogOpen(true);
    }
  };

  const onDelete = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setIsDeleting(true);

      const mutation =
        mutations.delete[activeStep as keyof typeof mutations.delete];
      if (!mutation) throw new Error("Unknown step");

      await mutation.mutateAsync({ id: selectedId as any });
      await invalidateCacheByStep(activeStep, carbonProjectId);

      setInfoVariant("success");
      setInfoDialogTitle("Data berhasil dihapus");
      setInfoDialogDesc("Data ini berhasil dihapus.");
      setDeleteDialogOpen(false);
    } catch (error: any) {
      setIsDeleting(false);
      setInfoVariant("error");
      setDeleteDialogOpen(false);
      setInfoDialogTitle("Gagal menghapus data");
      setInfoDialogDesc(
        error?.message || "Terjadi kesalahan saat menghapus data."
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setInfoDialogOpen(true);
      setSelectedId(null);
    }
  };

  return (
    <DashboardLayout
      href={`/apps/carbon-emission/iscc/projects`}
      titleHeader="All Projects"
      subTitleHeader="All Carbon Calculation"
      menuSidebar={getCarbonCalculationMenu(carbonProjectId)}
    >
      <div>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-primary text-left"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <Tabs
        value={activeStep}
        onValueChange={setActiveStep}
        defaultValue="step1"
        className="w-full p-2"
      >
        <div className="overflow-x-auto no-scrollbar">
          <TabsList className="flex w-max min-w-full space-x-2 border-b border-muted p-1">
            {tabs.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="px-5 py-3 text-base font-semibold whitespace-nowrap rounded-md
                  data-[state=active]:bg-white data-[state=active]:text-primary
                  hover:bg-muted transition-all"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8 mx-auto">
            <Spinner />
          </div>
        ) : (
          <Fragment>
            {tabs.map(({ value, data }) => (
              <TabsContent key={value} value={value}>
                <CarbonCalculationView
                  projectId={carbonProjectId}
                  onEdit={handleEdit}
                  onDelete={onDelete}
                  activeStep={activeStep}
                  data={data as []}
                  onRefresh={refetchAll}
                />
              </TabsContent>
            ))}
          </Fragment>
        )}
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Data"
        description="Apakah kamu yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDelete}
        isDelete={isDeleting}
        cancelText="Batal"
      />

      <DialogInfo
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        title={infoDialogTitle}
        description={infoDialogDesc}
        variant={infoVariant}
        onClose={() => setInfoDialogOpen(false)}
      />
    </DashboardLayout>
  );
}
