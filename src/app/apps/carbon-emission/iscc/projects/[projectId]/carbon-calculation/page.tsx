"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Fragment, useMemo, useRef, useEffect, useState } from "react";
import AddCalculationViews from "@/views/apps/carbon-emission/projects/project-detail/carbon-calculation/add-calculation-views";
import EditCalculationViews from "@/views/apps/carbon-emission/projects/project-detail/carbon-calculation/edit-calculation-views";
import { DialogInfo } from "@/components/ui/dialog-info";
import { trpc } from "@/trpc/react";
import * as step1 from "@/constant/step-1";
import * as step2 from "@/constant/step-2";
import * as step3 from "@/constant/step-3";
import * as step4 from "@/constant/step-4";
import * as step5 from "@/constant/step-5";
import * as step6 from "@/constant/step-6";
import { EmissionsTypes } from "@/types/carbon-types";
import {
  StepKey,
  useCalculationGHGAudit,
  useCalculationGHGVerification,
  useCalculationOtherCase,
  useInvalidateCacheByStep,
  useTabActions,
  useCarbonCalculationData,
} from "@/hooks";

type StepField = {
  type: "text" | "number" | string;
  satuan: string;
  keterangan?: string;
  [key: string]: any;
};

const stepConstants: Record<StepKey, any> = {
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
};

// normalisasi angka
const parseNumber = (val: any): number => {
  if (typeof val !== "string") return Number(val) || 0;
  let raw = val.trim();
  if (raw === "") return 0;
  if (raw.includes(",")) {
    raw = raw.replace(/\./g, "").replace(/,/g, ".");
    return isNaN(Number(raw)) ? 0 : Number(raw);
  }
  raw = raw.replace(/\./g, "");
  return isNaN(Number(raw)) ? 0 : Number(raw);
};

// 🔧 helper: flatten fields & buat peta keterangan→key form
const flattenStepFields = (
  stepData: Record<string, Record<string, StepField>>
) => {
  const allFields: Record<string, StepField> = Object.values(stepData).reduce(
    (acc, group) => ({ ...acc, ...group }),
    {}
  );

  // Map label/keterangan (trim) → key form
  const labelToKey = Object.entries(allFields).reduce<Record<string, string>>(
    (acc, [key, val]) => {
      const label = (val.keterangan?.trim() || key).trim();
      acc[label] = key;
      return acc;
    },
    {}
  );

  return { allFields, labelToKey };
};

export default function CarbonCalculation() {
  const { projectId } = useParams();
  const searchParams = useSearchParams();
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();

  const tenantId = userProfile?.tenantId ?? "";
  const carbonProjectId = String(projectId);

  // Get active step from URL params or default to step1
  const activeStep = (searchParams.get("step") as StepKey) || "step1";

  // Fetch carbon calculation data
  const {
    verifications,
    calculations,
    process,
    additional,
    otherCase,
    audit,
    refetchAll,
  } = useCarbonCalculationData();

  // Get data for current step
  const data = useMemo(() => {
    switch (activeStep) {
      case "step1":
        return verifications?.stepSatuGhgVerifications ?? [];
      case "step2":
        return calculations?.stepDuaGhgCalculations ?? [];
      case "step3":
        return process?.stepTigaGhgCalculationProcesses ?? [];
      case "step4":
        return additional?.stepTigaAdditionals ?? [];
      case "step5":
        return otherCase?.stepTigaOtherCases ?? [];
      case "step6":
        return audit?.stepEmpatGhgAudits ?? [];
      default:
        return [];
    }
  }, [
    activeStep,
    verifications,
    calculations,
    process,
    additional,
    otherCase,
    audit,
  ]);

  const onRefresh = refetchAll;

  const [infoDialogTitle, setInfoDialogTitle] = useState("");
  const [infoDialogDesc, setInfoDialogDesc] = useState("");
  const [infoVariant, setInfoVariant] = useState<"success" | "error" | "info">(
    "info"
  );
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Generic form hook for steps 2, 3, 4
  const [genericForm, setGenericForm] = useState<Record<string, string>>({});
  const handleGenericChange = (key: string, val: string) => {
    setGenericForm((prev) => ({ ...prev, [key]: val }));
  };

  // ✅ hooks form harus dipanggil semua, lalu dipilih pakai useMemo
  const formHookStep1 = useCalculationGHGVerification();
  const formHookStep5 = useCalculationOtherCase();
  const formHookStep6 = useCalculationGHGAudit();

  const { form, handleChange } = useMemo(() => {
    if (activeStep === "step5") return formHookStep5;
    if (activeStep === "step6") return formHookStep6;
    if (activeStep === "step2" || activeStep === "step3" || activeStep === "step4") {
      return { form: genericForm, handleChange: handleGenericChange };
    }
    return formHookStep1;
  }, [activeStep, formHookStep1, formHookStep5, formHookStep6, genericForm]);

  // ✅ pakai hook actions (bulk / update / delete)
  const { bulk, update } = useTabActions();

  // Invalidate cache saat step berubah

  const invalidateByStep = useInvalidateCacheByStep();

  // 🧠 HYDRATE: isi form dari API saat edit
  const hydratedRef = useRef(false);

  useEffect(() => {
    // reset flag saat pindah step supaya re-hydrate sesuai step aktif
    hydratedRef.current = false;
    // reset generic form when step changes
    if (activeStep === "step2" || activeStep === "step3" || activeStep === "step4") {
      setGenericForm({});
    }
  }, [activeStep]);

  useEffect(() => {
    if (!data || data.length === 0) return; // mode add → biarkan kosong
    if (hydratedRef.current) return;

    const { labelToKey } = flattenStepFields(stepConstants[activeStep]);

    for (const item of data) {
      const label = (item.keterangan ?? "").trim();
      const key = labelToKey[label];
      if (!key) continue; // kalau tidak match, skip aman

      // pilih nilai yang sesuai tipe field: text → nilaiString, number → nilaiInt
      const val =
        (item.nilaiString ?? "").toString().trim() !== ""
          ? item.nilaiString
          : (item.nilaiInt ?? "").toString();

      handleChange(key as any, val ?? "");
      handleChange((key + "Source") as any, item.source ?? "");
    }

    hydratedRef.current = true;
  }, [data, activeStep, handleChange]);

  const mapStepToValues = (
    stepData: Record<string, Record<string, StepField>>,
    formState: Record<string, any>,
    existing?: EmissionsTypes[]
  ) => {
    const allFields: Record<string, StepField> = Object.values(stepData).reduce(
      (acc, group) => ({ ...acc, ...group }),
      {}
    );

    // idMap untuk update: keterangan (trim) -> id (NUMBER)
    const idMap: Record<string, number> =
      existing?.reduce((acc, item) => {
        if (!item.keterangan) return acc;

        // pastikan number, abaikan kalau NaN / nullish
        const num = item.id == null ? NaN : Number(item.id);
        if (Number.isFinite(num)) {
          acc[item.keterangan.trim()] = num; // simpan sebagai number
        }
        return acc;
      }, {} as Record<string, number>) ?? {};

    return Object.entries(allFields).map(([key, val]) => {
      const field = val as StepField;
      const rawValue = formState[key];
      const label = (field.keterangan?.trim() || key).trim();

      const maybeId = idMap[label];
      const idAsNumber =
        typeof maybeId === "number" && Number.isFinite(maybeId)
          ? maybeId
          : undefined;

      return {
        id: idAsNumber, // <-- number | undefined
        keterangan: label,
        nilaiInt: field.type === "text" ? 0 : parseNumber(rawValue),
        nilaiString: field.type === "text" ? formState[key] ?? "" : "",
        satuan: field.satuan,
        source: formState[key + "Source"],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const values = mapStepToValues(stepConstants[activeStep], form);
      const payload = { tenantId, carbonProjectId, items: values };
      await bulk[activeStep].mutateAsync(payload);
      await invalidateByStep(activeStep, carbonProjectId);

      setInfoVariant("success");
      setInfoDialogTitle("Berhasil Menyimpan");
      setInfoDialogDesc("Data perhitungan karbon berhasil disimpan.");
    } catch (error: any) {
      setInfoVariant("error");
      setInfoDialogTitle("Gagal Menyimpan");
      setInfoDialogDesc(
        error?.message ?? "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
      setInfoDialogOpen(true);
    }
  };

  // ✅ EDIT: gunakan action update dan sertakan id item existing
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const values = mapStepToValues(stepConstants[activeStep], form, data);
      const payload = { tenantId, carbonProjectId, items: values };

      await update[activeStep].mutateAsync(payload);
      await invalidateByStep(activeStep, carbonProjectId);

      setInfoVariant("success");
      setInfoDialogTitle("Berhasil Memperbarui");
      setInfoDialogDesc("Data perhitungan karbon berhasil diperbarui.");
    } catch (error: any) {
      setInfoVariant("error");
      setInfoDialogTitle("Gagal Memperbarui");
      setInfoDialogDesc(
        error?.message ?? "Terjadi kesalahan saat memperbarui data."
      );
    } finally {
      setIsSubmitting(false);
      setInfoDialogOpen(true);
    }
  };

  return (
    <Fragment>
      {!data || data.length === 0 ? (
        <AddCalculationViews
          handleSubmit={handleSubmit}
          form={form as any}
          handleChange={handleChange}
          isSubmitting={isSubmitting}
          activeStep={activeStep}
        />
      ) : (
        <EditCalculationViews
          data={data ?? []}
          handleSubmit={handleEdit}
          form={form as any}
          handleChange={handleChange}
          isSubmitting={isSubmitting}
          activeStep={activeStep}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          setIsRefreshing={setIsRefreshing}
        />
      )}

      <DialogInfo
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        title={infoDialogTitle}
        description={infoDialogDesc}
        variant={infoVariant}
        onClose={() => setInfoDialogOpen(false)}
      />
    </Fragment>
  );
}
