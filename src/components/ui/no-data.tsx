"use client";

import { FileQuestion } from "lucide-react";

export function NoData({
  message = "No project found.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
      <div className="bg-muted p-4 rounded-full mb-4">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
