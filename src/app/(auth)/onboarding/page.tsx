"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Building2 } from "lucide-react";

const tenantSchema = z.object({
  name: z.string().min(2, "Tenant name must be at least 2 characters"),
  description: z.string().optional(),
  logo: z.any().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement tenant creation API call
      console.log("Creating tenant:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // After successful tenant creation, redirect to apps
      router.push("/apps");
    } catch (error) {
      setError("Failed to create tenant. Please try again.");
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

              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Organization Logo</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="logo"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-24 w-24 object-contain rounded"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            Upload organization logo
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                      )}
                      <input
                        id="logo"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
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
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Brief description of your organization"
                    {...register("description")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-800 to-blue-800 font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Organization..." : "Create Organization"}
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
}
