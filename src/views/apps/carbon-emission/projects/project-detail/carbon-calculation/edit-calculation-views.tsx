/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormCalculationTypes } from "@/types/carbon-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormGHGCalculationProcess from "./form-ghg-calculation-process";
import FormAddViews from "./form-add";
import FormGHGAuditCalculation from "./form-ghg-audit";
import FormOtherCaseCalculation from "./form-other-case";
import { format } from "date-fns";
import FormGHGVerification from "./form-ghg-verification";
import FormGHGCalculation from "./form-ghg-calculation";
import { Button } from "@/components/ui/button";
import { StepKey } from "@/hooks";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { RefreshCw, Save } from "lucide-react";

// 🔑 mapping step -> form component
const stepForms: Record<StepKey, React.FC<any>> = {
  step1: FormGHGVerification,
  step2: FormGHGCalculation,
  step3: FormGHGCalculationProcess,
  step4: FormAddViews,
  step5: FormOtherCaseCalculation,
  step6: FormGHGAuditCalculation,
};

export default function EditCalculationViews({
  handleSubmit,
  form,
  handleChange,
  isSubmitting,
  data,
  activeStep,
  onRefresh,
  isRefreshing,
  setIsRefreshing,
}: FormCalculationTypes) {
  const renderInput = (
    label: string,
    name: keyof typeof form,
    unit?: string,
    disabled: boolean = false,
    type: "text" | "number" | "date" = "number",
    inputPlaceholder?: string,
    labelColor?: string | any,
    bold?: boolean
  ) => {
    const sourceName = (name + "Source") as keyof typeof form;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(name, e.target.value);
    };

    const labelClass = `text-sm ${labelColor || ""} ${bold ? "font-bold" : ""}`;

    // helper pemisah ribuan format Indonesia
    const formatThousandsID = (digits: string) =>
      digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // ✅ formatter yang mempertahankan tanda negatif
    const formatCurrency = (value: string | number): string => {
      if (value === null || value === undefined) return "";

      const raw = value.toString().trim();
      const isNeg = raw.startsWith("-"); // cek tanda
      const body = isNeg ? raw.slice(1) : raw; // buang tanda untuk proses
      if (body === "") return isNeg ? "-" : ""; // biarkan user ketik "-" dulu
      if (body === ",") return isNeg ? "-," : ",";

      // 1) Jika pakai koma → desimal Indonesia
      if (body.includes(",")) {
        const [intRaw, decRaw = ""] = body.split(",", 2);
        const intDigits = intRaw.replace(/\D/g, "");
        const intPart = intDigits ? formatThousandsID(intDigits) : "0";
        const decDigits = decRaw.replace(/\D/g, "");
        const out = decRaw === "" ? `${intPart},` : `${intPart},${decDigits}`;
        return isNeg ? `-${out}` : out;
      }

      // 2) Desimal bertitik "123.45" → tampilkan "123,45"
      const dotDecimalMatch = body.match(/^(\d+)\.(\d{1,3})$/);
      if (dotDecimalMatch) {
        const intPart = formatThousandsID(dotDecimalMatch[1]);
        const out = `${intPart},${dotDecimalMatch[2]}`;
        return isNeg ? `-${out}` : out;
      }

      // 3) Angka bulat / titik sebagai ribuan
      const digitsOnly = body.replace(/\D/g, "");
      if (!digitsOnly) return isNeg ? "-" : "";
      const out = formatThousandsID(digitsOnly);
      return isNeg ? `-${out}` : out;
    };

    const disabledAll = disabled || isSubmitting || isRefreshing;

    return (
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:gap-4 w-full">
        <div className="sm:col-span-3">
          <Label className={labelClass}>
            <span className="inline-flex items-center gap-1">
              {label}
              {!disabled && label && <span className="text-red-500">*</span>}
            </span>
          </Label>
        </div>

        <div className="sm:col-span-3">
          {type === "date" ? (
            <Input
              type="date"
              value={
                form[name]
                  ? format(new Date(form[name] as any), "yyyy-MM-dd")
                  : ""
              }
              onChange={handleDateChange}
              disabled={disabledAll}
              required={!disabled}
              className={`w-full ${
                disabledAll ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          ) : type === "number" ? (
            <Input
              type="text"
              value={formatCurrency(form[name] as any)}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                const filtered = raw.replace(/[^0-9.,]/g, "");
                handleChange(name, filtered);
              }}
              disabled={disabledAll}
              required={!disabled}
              className={`w-full ${
                disabledAll ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          ) : (
            <Input
              type={type}
              value={(form[name] as any) ?? ""}
              placeholder={inputPlaceholder}
              onChange={(e) => {
                const rawValue = e.target.value;
                handleChange(name, rawValue);
              }}
              disabled={disabledAll}
              required={!disabled}
              className={`w-full ${
                disabledAll ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          )}
        </div>

        <div className="sm:col-span-2">
          {unit && <p className="text-sm text-gray-700 mt-2 sm:mt-0">{unit}</p>}
        </div>

        <div className="sm:col-span-4">
          <Input
            type="text"
            value={(form[sourceName] as any) || ""}
            placeholder="Source"
            onChange={(e) => handleChange(sourceName, e.target.value)}
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting || isRefreshing
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
          />
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const FormComponent =
      stepForms[activeStep as StepKey] || FormGHGVerification;
    return (
      <FormComponent
        {...{
          handleSubmit,
          form,
          handleChange,
          renderInput,
          isSubmitting,
          data,
        }}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-black text-lg font-bold">Carbon Calculation</h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                form="carbon-form"
                type="submit"
                className="text-white font-semibold bg-sky-700 hover:bg-sky-800"
                disabled={isRefreshing}
                aria-label="Refresh data"
                onClick={async () => {
                  if (!onRefresh) return;
                  setIsRefreshing(true);
                  try {
                    await onRefresh();
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
              >
                {isRefreshing ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </span>
                )}
              </Button>
            )}

            <Button
              form="carbon-form"
              type="submit"
              className="text-white font-semibold bg-black hover:bg-gray-700"
              disabled={isSubmitting}
              aria-label="Update calculation"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Updating…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update
                </span>
              )}
            </Button>
          </div>
        </div>
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b" />
      </div>
      {renderForm()}
    </div>
  );
}
