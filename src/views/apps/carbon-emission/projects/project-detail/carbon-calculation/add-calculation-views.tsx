/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import FormGHGVerification from "./form-ghg-verification";
import FormGHGCalculation from "./form-ghg-calculation";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormGHGCalculationProcess from "./form-ghg-calculation-process";
import FormAddViews from "./form-add";
import FormGHGAuditCalculation from "./form-ghg-audit";
import FormOtherCaseCalculation from "./form-other-case";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StepKey } from "@/hooks";

// 🔑 mapping step -> form component
const stepForms: Record<StepKey, React.FC<any>> = {
  step1: FormGHGVerification,
  step2: FormGHGCalculation,
  step3: FormGHGCalculationProcess,
  step4: FormAddViews,
  step5: FormOtherCaseCalculation,
  step6: FormGHGAuditCalculation,
};

export default function AddCalculationViews({
  handleSubmit,
  form,
  handleChange,
  isSubmitting,
  activeStep,
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

    const formatCurrency = (value: string | number): string => {
      if (value === null || value === undefined || value === "") return "";

      const strValue = value.toString().replace(/\s+/g, "").replace(/\./g, "");
      const parts = strValue.split(",");

      const intPart = parts[0] ? Number(parts[0]).toLocaleString("id-ID") : "0";
      return parts.length > 1 ? `${intPart},${parts[1]}` : intPart;
    };

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
                form[name] ? format(new Date(form[name]), "yyyy-MM-dd") : ""
              }
              onChange={handleDateChange}
              disabled={disabled || isSubmitting}
              required={!disabled}
              className={`w-full ${
                disabled || isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          ) : type === "number" ? (
            <Input
              type="text"
              value={formatCurrency(form[name])}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                const filtered = raw.replace(/[^0-9.,]/g, "");
                handleChange(name, filtered);
              }}
              disabled={disabled || isSubmitting}
              required={!disabled}
              className={`w-full ${
                disabled || isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          ) : (
            <Input
              type={type}
              value={form[name]}
              placeholder={inputPlaceholder}
              onChange={(e) => {
                const rawValue = e.target.value;
                handleChange(name, rawValue);
              }}
              disabled={disabled || isSubmitting}
              required={!disabled}
              className={`w-full ${
                disabled || isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
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
              isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
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
        {...{ handleSubmit, form, handleChange, renderInput, isSubmitting }}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="mt-4">
        <div className="flex justify-end sticky top-0 z-20 bg-white">
          <Button
            form="carbon-form"
            type="submit"
            className="text-white font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Calculation"}
          </Button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
}
