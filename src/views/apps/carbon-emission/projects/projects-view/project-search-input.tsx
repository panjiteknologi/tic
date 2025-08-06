"use client";

import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ProjectSearchInput({ value, onChange }: Props) {
  return (
    <Input
      placeholder="Search project name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:max-w-sm"
    />
  );
}
