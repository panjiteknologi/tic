"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ISCCProjectSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ISCCProjectSearchInput({
  value,
  onChange,
}: ISCCProjectSearchInputProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder="Cari proyek ISCC..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2 w-full"
      />
    </div>
  );
}

