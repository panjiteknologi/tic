"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { trpc } from "@/trpc/react";
import { cn } from "@/lib/utils";

type TenantLogoSize = "small" | "large";

type TenantLogoProps = {
  tenantId: string; // wajib, supaya gak perlu non-null assertion
  size?: TenantLogoSize;
  className?: string;
  alt?: string;
} & Omit<
  React.ComponentProps<typeof Image>,
  "src" | "alt" | "width" | "height"
>;

export function TenantLogo({
  tenantId,
  size = "small",
  className,
  alt,
  priority,
  ...imgProps
}: TenantLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/images/dms-logo.png");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Query tenant (aman karena tenantId wajib)
  const { data: tenantData, isLoading: tenantLoading } =
    trpc.tenant.getById.useQuery(
      { tenantId },
      {
        enabled: !!tenantId,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      }
    );

  // Mutation: generate presigned URL
  const generateDownloadUrl = trpc.tenant.generateLogoDownloadUrl.useMutation();

  const fetchLogoUrl = useCallback(async () => {
    if (!tenantData?.tenant?.logo || hasAttemptedFetch) return;

    try {
      setIsLoading(true);
      setHasAttemptedFetch(true);

      // 1) coba pakai URL langsung dari DB jika http(s)
      if (tenantData.tenant.logo.startsWith("http")) {
        try {
          const head = await fetch(tenantData.tenant.logo, { method: "HEAD" });
          if (head.ok) {
            setLogoUrl(tenantData.tenant.logo);
            return;
          }
        } catch {
          // lanjut ke presigned
        }
      }

      // 2) kalau gagal, generate presigned URL dari server
      const result = await generateDownloadUrl.mutateAsync({ tenantId });
      if (result?.success && result.presignedUrl) {
        setLogoUrl(result.presignedUrl);
      } else {
        // keep fallback
      }
    } catch {
      // keep fallback
    } finally {
      setIsLoading(false);
    }
  }, [
    tenantData?.tenant?.logo,
    tenantId,
    hasAttemptedFetch,
    generateDownloadUrl,
  ]);

  useEffect(() => {
    if (tenantData?.tenant && !tenantLoading) {
      fetchLogoUrl();
    }
  }, [tenantData?.tenant, tenantLoading, fetchLogoUrl]);

  // Ukuran px untuk Next/Image
  const sizePx: Record<TenantLogoSize, number> = {
    small: 32,
    large: 64,
  };

  const finalAlt =
    alt ??
    (tenantData?.tenant?.name ? `${tenantData.tenant.name} Logo` : "Logo");

  // Jika URL eksternal/presigned, biar aman tanpa remotePatterns:
  const isExternal = /^https?:\/\//.test(logoUrl);

  return (
    <Image
      src={logoUrl}
      alt={finalAlt}
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(
        "object-contain",
        // untuk konsistensi ukuran di UI (opsional)
        size === "small" ? "h-8 w-8" : "h-16 w-16",
        isLoading && "opacity-75",
        className
      )}
      onError={() => {
        if (logoUrl !== "/images/dms-logo.png") {
          setLogoUrl("/images/dms-logo.png");
        }
      }}
      unoptimized={isExternal}
      priority={priority ?? size === "small"}
      {...imgProps}
    />
  );
}
