"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function IPCCProjectCardSkeleton() {
  return (
    <Card className="rounded-xl border h-full">
      <CardContent className="h-full flex flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-3/4" />
          </div>

          <Skeleton className="h-5 w-16" />

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 w-24" />
            </div>
            
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 w-20" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <Skeleton className="h-3 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}