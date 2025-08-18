/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/layout/dashboard-layout";
import AddCalculationViews from "@/views/apps/carbon-emission/projects/project-detail/carbon-calculation/add-calculation-views";
import { getCarbonCalculationMenu } from "@/constant/menu-sidebar";
import { useCalculationGHGVerification } from "@/hooks/use-calculation-ghg-verification";
import { trpc } from "@/trpc/react";
import { useState } from "react";
import * as step1 from "@/constant/step-1";
import * as step2 from "@/constant/step-2";
import * as step3 from "@/constant/step-3";
import * as step4 from "@/constant/step-4";
import * as step5 from "@/constant/step-5";
import * as step6 from "@/constant/step-6";
import { DialogInfo } from "@/components/ui/dialog-info";
import { useCalculationOtherCase } from "@/hooks/use-calculation-other-case";
import { useCalculationGHGAudit } from "@/hooks/use-calculation-ghg-audit";

type StepField = {
  type: "text" | "number" | string;
  satuan: string;
  keterangan?: string;
  [key: string]: any;
};

const stepConstants = {
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
};

// 🔑 Helper untuk normalisasi angka
const parseNumber = (val: any): number => {
  if (typeof val !== "string") return Number(val) || 0;

  let raw = val.trim();

  if (raw === "") return 0;

  if (raw.includes(",")) {
    // ada koma → anggap desimal
    raw = raw.replace(/\./g, ""); // hapus pemisah ribuan
    raw = raw.replace(/,/g, "."); // ubah koma jadi titik
    return isNaN(Number(raw)) ? 0 : Number(raw);
  }

  // tidak ada koma → anggap integer
  raw = raw.replace(/\./g, ""); // hapus titik ribuan
  return isNaN(Number(raw)) ? 0 : Number(raw);
};

export default function AddCalculation() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { projectId } = useParams();
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();

  const tenantId = userProfile?.tenantId ?? "";
  const carbonProjectId = String(projectId);
  const activeStep = sessionStorage?.getItem(
    "activeStep"
  ) as keyof typeof stepConstants;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState("");
  const [infoDialogDesc, setInfoDialogDesc] = useState("");
  const [infoVariant, setInfoVariant] = useState<"success" | "error" | "info">(
    "info"
  );

  const ghgCalc = useCalculationGHGVerification();
  const otherCalc = useCalculationOtherCase();
  const ghgAudit = useCalculationGHGAudit();

  let formHook;

  if (activeStep === "step5") {
    formHook = otherCalc;
  } else if (activeStep === "step6") {
    formHook = ghgAudit;
  } else {
    formHook = ghgCalc;
  }

  const { form, handleChange } = formHook;

  const step1Mutation = trpc.stepOneGhgVerification.bulkAdd.useMutation();
  const step2Mutation = trpc.stepTwoGhgCalculation.bulkAdd.useMutation();
  const step3Mutation = trpc.stepThreeGhgProcess.bulkAdd.useMutation();
  const step4Mutation = trpc.stepThreeGhgAdditional.bulkAdd.useMutation();
  const step5Mutation = trpc.stepThreeGhgOtherCase.bulkAdd.useMutation();
  const step6Mutation = trpc.stepFourGhgAudit.bulkAdd.useMutation();

  const stepMutations = {
    step1: step1Mutation,
    step2: step2Mutation,
    step3: step3Mutation,
    step4: step4Mutation,
    step5: step5Mutation,
    step6: step6Mutation,
  };

  const mapStepToValues = (
    stepData: Record<string, Record<string, StepField>>,
    form: Record<string, any>
  ) => {
    const allFields: Record<string, StepField> = Object.values(stepData).reduce(
      (acc, group) => ({ ...acc, ...group }),
      {}
    );

    return Object.entries(allFields).map(([key, val]) => {
      const field = val as StepField;
      const rawValue = form[key];

      return {
        keterangan: field.keterangan?.trim() || key,
        nilaiInt: field.type === "text" ? 0 : parseNumber(rawValue),
        nilaiString: field.type === "text" ? form[key] : "",
        satuan: field.satuan,
        source: form[key + "Source"],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!activeStep || !stepMutations[activeStep]) {
        throw new Error("Unknown step");
      }

      const values = mapStepToValues(stepConstants[activeStep], form);

      const payload = {
        tenantId,
        carbonProjectId,
        items: values,
      };

      await stepMutations[activeStep].mutateAsync(payload);
      await utils.carbonProject.invalidate();

      setInfoVariant("success");
      setInfoDialogTitle("Berhasil Menyimpan");
      setInfoDialogDesc("Data perhitungan karbon berhasil disimpan.");
      setInfoDialogOpen(true);
    } catch (error: any) {
      setInfoVariant("error");
      setInfoDialogTitle("Gagal Menyimpan");
      setInfoDialogDesc(
        error?.message ?? "Terjadi kesalahan saat menyimpan data."
      );
      setInfoDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => router.back();

  return (
    <DashboardLayout
      href={`/apps/carbon-calculation/iscc/${projectId}`}
      titleHeader="Add Emission"
      subTitleHeader="Form Calculation"
      menuSidebar={getCarbonCalculationMenu(carbonProjectId)}
    >
      <AddCalculationViews
        goBack={goBack}
        handleSubmit={handleSubmit}
        form={form as any}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />

      <DialogInfo
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        title={infoDialogTitle}
        description={infoDialogDesc}
        variant={infoVariant}
        onClose={goBack}
      />
    </DashboardLayout>
  );
}
