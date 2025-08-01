import { ChevronLeft } from "lucide-react";
import FormCalculationView from "./form-calculation";
import { FormCalculationTypes } from "@/types/form-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AddEmissionViews({
  goBack,
  handleSubmit,
  form,
  handleChange,
}: FormCalculationTypes) {
  const renderInput = (
    label: string,
    name: keyof typeof form,
    unit?: string,
    disabled?: boolean
  ) => (
    <div className="grid grid-cols-12 items-center gap-4">
      <Label className="text-xs col-span-4">{label}</Label>
      <Input
        type="number"
        value={form[name]}
        placeholder="0"
        onChange={(e) => handleChange(name, e.target.value)}
        disabled={disabled}
        className={`col-span-6 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
      <p className="col-span-2 text-xs">{unit || ""}</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 cursor-pointer" onClick={goBack}>
        <ChevronLeft size={18} />
        <p className="text-black text-sm font-bold">Kembali</p>
      </div>

      <div className="mt-4 mx-6">
        <FormCalculationView
          handleSubmit={handleSubmit}
          form={form}
          handleChange={handleChange}
          renderInput={renderInput}
        />
      </div>
    </div>
  );
}
