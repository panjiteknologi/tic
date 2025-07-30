"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface TenantLogoProps {
  tenantId?: string;
  size?: "small" | "large";
  className?: string;
  alt?: string;
}

export function TenantLogo({ 
  tenantId, 
  size = "small", 
  className, 
  alt 
}: TenantLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/images/dms-logo.png");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Get tenant data to check if logo exists
  const { data: tenantData, isLoading: tenantLoading } = trpc.tenant.getById.useQuery(
    { tenantId: tenantId! },
    {
      enabled: !!tenantId,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  // Generate presigned URL for logo download if tenant has logo
  const generateDownloadUrl = trpc.tenant.generateLogoDownloadUrl.useMutation();

  const fetchLogoUrl = useCallback(async () => {
    if (!tenantData?.tenant?.logo || !tenantId || hasAttemptedFetch) {
      return;
    }

    try {
      setIsLoading(true);
      setHasAttemptedFetch(true);
      
      console.log("Tenant logo from DB:", tenantData.tenant.logo);
      
      // First, try to use the direct URL from database
      if (tenantData.tenant.logo.startsWith('http')) {
        console.log("Trying direct URL:", tenantData.tenant.logo);
        
        // Test if the direct URL works first
        try {
          const testResponse = await fetch(tenantData.tenant.logo, { method: 'HEAD' });
          if (testResponse.ok) {
            console.log("Direct URL works, using it");
            setLogoUrl(tenantData.tenant.logo);
            return;
          }
        } catch (directUrlError) {
          console.log("Direct URL failed, trying presigned URL");
        }
      }

      // If direct URL doesn't work, generate presigned URL for download
      console.log("Generating presigned URL for tenant:", tenantId);
      const result = await generateDownloadUrl.mutateAsync({
        tenantId,
      });

      console.log("Presigned URL result:", result);

      if (result.success && result.presignedUrl) {
        console.log("Using presigned URL:", result.presignedUrl);
        setLogoUrl(result.presignedUrl);
      } else {
        console.warn("Failed to get presigned URL, using fallback");
      }
    } catch (err) {
      console.error("Failed to fetch tenant logo:", err);
      // Keep fallback logo
    } finally {
      setIsLoading(false);
    }
  }, [tenantData?.tenant?.logo, tenantId, hasAttemptedFetch, generateDownloadUrl.mutateAsync]);

  useEffect(() => {
    if (tenantData?.tenant && !tenantLoading) {
      fetchLogoUrl();
    }
  }, [tenantData?.tenant, tenantLoading, fetchLogoUrl]);

  // Size classes
  const sizeClasses = {
    small: "h-8 w-8",
    large: "h-16 w-16",
  };

  const finalAlt = alt || (tenantData?.tenant?.name ? `${tenantData.tenant.name} Logo` : "Logo");

  return (
    <img
      src={logoUrl}
      alt={finalAlt}
      className={cn(
        sizeClasses[size],
        "object-contain",
        isLoading && "opacity-75",
        className
      )}
      onError={(e) => {
        console.error("Image load error for:", logoUrl);
        if (logoUrl !== "/images/dms-logo.png") {
          setLogoUrl("/images/dms-logo.png");
        }
      }}
    />
  );
}