/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/layout/dashboard-layout";
import AddCalculationViews from "@/views/apps/carbon-emission/projects/project-detail/carbon-calculation/add-calculation-views";
import { getCarbonCalculationMenu } from "@/constant/menu-sidebar";
import { useCarbonCalculationForm } from "@/hooks/use-carbon-calculation-form";
import { trpc } from "@/trpc/react";
import { useState } from "react";
import * as step1 from "@/constant/step-1";
import * as step2 from "@/constant/step-2";
import * as step3 from "@/constant/step-3";
import * as step4 from "@/constant/step-4";

export default function AddCalculation() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { projectId } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { form, handleChange } = useCarbonCalculationForm();

  const { data: userProfile } = trpc.user.getUserProfile.useQuery();

  const tenantId = userProfile?.tenantId ?? "";
  const carbonProjectId = String(projectId);

  // All mutations
  const ghgVerification = trpc.stepOneGhgVerification.bulkAdd.useMutation();
  const ghgCalculation = trpc.stepTwoGhgCalculation.bulkAdd.useMutation();
  const ghgAdditional = trpc.stepThreeGhgAdditional.bulkAdd.useMutation();
  const ghgProcess = trpc.stepThreeGhgProcess.bulkAdd.useMutation();
  const ghgOtherCase = trpc.stepThreeGhgProcess.bulkAdd.useMutation();
  const ghgAudit = trpc.stepFourGhgAudit.bulkAdd.useMutation();

  const activeStep = sessionStorage?.getItem("activeStep");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = { ...form, tenantId, carbonProjectId } as typeof form & {
      tenantId: string;
      carbonProjectId: string;
    };

    const allFieldStep1 = Object.values(step1).reduce((acc, cur) => {
      return {
        ...acc,
        ...cur,
      };
    }, {});

    const allFieldStep2 = Object.values(step2).reduce((acc, cur) => {
      return {
        ...acc,
        ...cur,
      };
    }, {});

    const allFieldStep3 = Object.values(step3).reduce((acc, cur) => {
      return {
        ...acc,
        ...cur,
      };
    }, {});

    const allFieldStep4 = Object.values(step4).reduce((acc, cur) => {
      return {
        ...acc,
        ...cur,
      };
    }, {});

    const valuesStep1 = Object.entries(allFieldStep1).map(
      ([key, val], index: number) => {
        return {
          keterangan: val.keterangan || `unkown-${index}`,
          nilaiInt:
            val.type === "text" ? 0 : isNaN(+form[key]) ? 0 : +form[key],
          nilaiString: val.type === "text" ? form[key] : "",
          satuan: val.satuan,
          source: form[key + "Source"],
        };
      }
    );

    const valuesStep2 = Object.entries(allFieldStep2).map(
      ([key, val], index: number) => {
        return {
          keterangan: val.keterangan || `unkown-${index}`,
          nilaiInt:
            val.type === "text" ? 0 : isNaN(+form[key]) ? 0 : +form[key],
          nilaiString: val.type === "text" ? form[key] : "",
          satuan: val.satuan,
          source: form[key + "Source"],
        };
      }
    );

    const valuesStep3 = Object.entries(allFieldStep3).map(
      ([key, val], index: number) => {
        return {
          keterangan: val.keterangan || `unkown-${index}`,
          nilaiInt:
            val.type === "text" ? 0 : isNaN(+form[key]) ? 0 : +form[key],
          nilaiString: val.type === "text" ? form[key] : "",
          satuan: val.satuan,
          source: form[key + "Source"],
        };
      }
    );

    const valuesStep4 = Object.entries(allFieldStep4).map(
      ([key, val], index: number) => {
        return {
          keterangan: val.keterangan || `unkown-${index}`,
          nilaiInt:
            val.type === "text" ? 0 : isNaN(+form[key]) ? 0 : +form[key],
          nilaiString: val.type === "text" ? form[key] : "",
          satuan: val.satuan,
          source: form[key + "Source"],
        };
      }
    );

    try {
      switch (activeStep) {
        case "step1":
          await ghgVerification.mutateAsync({
            carbonProjectId,
            items: valuesStep1,
          });
          break;

        case "step2":
          await ghgCalculation.mutateAsync({
            carbonProjectId,
            items: valuesStep2,
          });
          break;

        case "step3":
          await ghgProcess.mutateAsync({
            carbonProjectId,
            items: valuesStep3,
          });
          break;

        case "step4":
          await ghgAdditional.mutateAsync({
            carbonProjectId,
            items: valuesStep4,
          });
          break;

        case "step5":
          await ghgOtherCase.mutateAsync({
            carbonProjectId,
            items: valuesStep4,
          });
          break;

        case "step6":
          await ghgAudit.mutateAsync({
            carbonProjectId,
            items: valuesStep4,
          });
          break;

        default:
          throw new Error("Unknown step");
      }

      // Invalidate all project queries
      utils.carbonProject.invalidate();

      console.log("📝 Submitting payload:", payload);
      alert("✅ Perhitungan berhasil disimpan!");
      router.back();
    } catch (error) {
      console.error("❌ Gagal submit:", error);
      alert("❌ Terjadi kesalahan saat menyimpan.");
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
    </DashboardLayout>
  );
}
