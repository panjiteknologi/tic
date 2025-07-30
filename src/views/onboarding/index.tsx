"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Building2, X } from "lucide-react";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";

const tenantSchema = z.object({
  name: z.string().min(2, "Tenant name must be at least 2 characters"),
  description: z.string().optional(),
  slug: z.string().min(2, "Slug is required"),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const OnboardingView = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // tRPC mutations
  const createTenant = trpc.tenant.create.useMutation();
  const generateUploadUrl = trpc.tenant.generateLogoUploadUrl.useMutation();
  const updateLogo = trpc.tenant.updateLogo.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });

  const watchedName = watch("name");

  // Helper function to generate slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName) {
      const slug = generateSlug(watchedName);
      setValue("slug", slug);
    }
  }, [watchedName, setValue]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Reset file input
    const fileInput = document.getElementById("logo") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const uploadLogoToS3 = async (tenantId: string, file: File) => {
    try {
      setUploadingLogo(true);

      // Generate presigned upload URL
      const uploadData = await generateUploadUrl.mutateAsync({
        tenantId,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });

      if (!uploadData.success) {
        throw new Error("Failed to generate upload URL");
      }

      // Upload file to S3
      const uploadResponse = await fetch(uploadData.uploadData.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }

      // Update tenant with logo
      const updateResult = await updateLogo.mutateAsync({
        tenantId,
        logoUrl: uploadData.uploadData.publicUrl,
        s3Key: uploadData.uploadData.key,
      });

      if (updateResult.success) {
        return uploadData.uploadData.key;
      } else {
        throw new Error("Failed to update tenant with logo");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);

    try {
      // Create tenant first
      const result = await createTenant.mutateAsync({
        name: data.name,
        slug: data.slug,
        domain: data.description, // Using description as domain for now, you can modify this
      });

      if (!result.success) {
        throw new Error("Failed to create tenant");
      }

      // Upload logo if file is selected
      if (logoFile && result.tenant) {
        try {
          await uploadLogoToS3(result.tenant.id, logoFile);
        } catch (logoError) {
          // Continue with success even if logo upload fails
        }
      }

      // Show success message and redirect
      toast.success("Organization created successfully!");
      router.push("/apps");
    } catch (error: any) {
      toast.error(error.message || "Failed to create tenant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <img
            src="/images/dms-logo.png"
            alt="DMS Logo"
            className="h-16 w-auto"
          />
        </div>
        <Card className="w-full">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center space-y-2">
                <Building2 className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-2xl font-bold">Setup Your Organization</h1>
                <p className="text-muted-foreground">
                  Create your tenant to get started
                </p>
              </div>


              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Organization Logo (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="logo"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 relative"
                    >
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-24 w-24 object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveLogo();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            Upload organization logo
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, GIF, WebP, SVG up to 5MB
                          </p>
                        </div>
                      )}
                      <input
                        id="logo"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                  {uploadingLogo && (
                    <p className="text-sm text-blue-600">Uploading logo...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter organization name"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    placeholder="organization-slug"
                    {...register("slug")}
                    aria-invalid={!!errors.slug}
                  />
                  {errors.slug && (
                    <p className="text-destructive text-sm">
                      {errors.slug.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Auto-generated from organization name. Used for URLs and
                    identification.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Domain (Optional)</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="company.com"
                    {...register("description")}
                  />
                  <p className="text-xs text-gray-500">
                    Your organization's domain name
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-800 to-blue-800 font-bold"
                disabled={isLoading || uploadingLogo}
              >
                {isLoading
                  ? "Creating Organization..."
                  : uploadingLogo
                  ? "Uploading Logo..."
                  : "Create Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dharma Mitra Solusi. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
