"use client";

import { SquareStack } from "lucide-react";

export function AppsHero() {
  return (
    <div className="flex flex-col items-center justify-between gap-6 mt-8 py-6">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-primary/10 p-6 rounded-full">
          <SquareStack className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Access all your TIC services and tools from one place. Find and
            launch the applications you need to streamline your work.
          </p>
        </div>
      </div>
    </div>
  );
}
