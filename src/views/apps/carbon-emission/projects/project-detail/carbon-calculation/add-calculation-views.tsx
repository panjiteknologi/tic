"use client";

import { ArrowLeft } from "lucide-react";
import FormGHGVerification from "./form-ghg-verification";
import FormGHGCalculation from "./form-ghg-calculation";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import FormGHGCalculationProcess from "./form-ghg-calculation-process";
import FormAddViews from "./form-add";
import FormGHGAuditCalculation from "./form-ghg-audit";
import FormOtherCaseCalculation from "./form-other-case";
import { format } from "date-fns";

export default function AddCalculationViews({
  goBack,
  handleSubmit,
  form,
  handleChange,
  isSubmitting,
}: FormCalculationTypes) {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  useEffect(() => {
    const step = sessionStorage.getItem("activeStep");
    setActiveStep(step);
  }, []);

  const renderInput = (
    label: string,
    name: keyof typeof form,
    unit?: string,
    disabled: boolean = false,
    type: "text" | "number" | "date" = "number",
    inputPlaceholder?: string
  ) => {
    const sourceName = (name + "Source") as keyof typeof form;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      handleChange(name, value);
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
        <Label className="text-sm sm:text-xs sm:col-span-4">
          <span className="inline-flex items-center gap-1">
            {label}
            {!disabled && label && <span className="text-red-500">*</span>}
          </span>
        </Label>

        {type === "date" ? (
          <Input
            type="date"
            value={form[name] ? format(new Date(form[name]), "yyyy-MM-dd") : ""}
            onChange={handleDateChange}
            disabled={disabled}
            className={`w-full sm:col-span-3 ${
              disabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        ) : (
          <Input
            type={type}
            value={form[name]}
            placeholder={type === "number" ? "0" : inputPlaceholder}
            onChange={(e) => handleChange(name, e.target.value)}
            disabled={disabled}
            className={`w-full sm:col-span-3 ${
              disabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        )}

        <p className="text-sm sm:text-xs sm:col-span-2">{unit || ""}</p>

        <Input
          type="text"
          value={form[sourceName] || ""}
          placeholder="Source"
          onChange={(e) => handleChange(sourceName, e.target.value)}
          disabled={false}
          className="w-full sm:col-span-3"
        />
      </div>
    );
  };

  const renderForm = () => {
    switch (activeStep) {
      case "step1":
        return (
          <FormGHGVerification
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
      case "step2":
        return (
          <FormGHGCalculation
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
      case "step3":
        return (
          <FormGHGCalculationProcess
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
      case "step4":
        return (
          <FormAddViews
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
      case "step5":
        return (
          <FormOtherCaseCalculation
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
      case "step6":
        return (
          <FormGHGAuditCalculation
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <FormGHGVerification
            handleSubmit={handleSubmit}
            form={form}
            handleChange={handleChange}
            renderInput={renderInput}
            isSubmitting={isSubmitting}
          />
        );
    }
  };

  return (
    <div className="w-full">
      <div>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-primary"
          onClick={goBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <div className="mt-4 mx-6">{renderForm()}</div>
    </div>
  );
}
