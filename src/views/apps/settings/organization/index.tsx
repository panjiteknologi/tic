"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, Upload } from "lucide-react";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";

export interface OrganizationFormData {
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
}

const OrganizationView = () => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    slug: "",
    domain: "",
    logo: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Get user profile to get tenant info
  const { data: userProfile, isLoading: profileLoading } = trpc.user.getUserProfile.useQuery();
  
  // Get tenant details (you might need to create this query)
  // const { data: tenantData, isLoading: tenantLoading } = trpc.tenant.getById.useQuery(
  //   { tenantId: userProfile?.tenantId || "" },
  //   { enabled: !!userProfile?.tenantId }
  // );

  // Update tenant mutation (you might need to create this)
  // const updateTenantMutation = trpc.tenant.update.useMutation({
  //   onSuccess: () => {
  //     toast.success("Organization updated successfully!");
  //     setIsEditing(false);
  //   },
  //   onError: (error) => {
  //     toast.error(`Failed to update organization: ${error.message}`);
  //   },
  // });

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.tenantId) {
      toast.error("No organization found");
      return;
    }

    // Uncomment when mutation is available
    // updateTenantMutation.mutate({
    //   tenantId: userProfile.tenantId,
    //   ...formData,
    // });
    
    // For now, just show success message
    toast.success("Organization settings saved! (Demo mode)");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    // setFormData(tenantData ? {
    //   name: tenantData.name,
    //   slug: tenantData.slug,
    //   domain: tenantData.domain || "",
    //   logo: tenantData.logo || "",
    // } : {
    //   name: "",
    //   slug: "",
    //   domain: "",
    //   logo: "",
    // });
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.tenantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            No organization found. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization's details and branding
        </p>
      </div>

      {/* Organization Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name || userProfile.tenantName || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter organization name"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  disabled={!isEditing}
                  placeholder="organization-slug"
                />
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input
                  id="domain"
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange("domain", e.target.value)}
                  disabled={!isEditing}
                  placeholder="example.com"
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    type="url"
                    value={formData.logo}
                    onChange={(e) => handleInputChange("logo", e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://example.com/logo.png"
                  />
                  {isEditing && (
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              {!isEditing ? (
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  disabled={!userProfile.role || !["superadmin", "admin"].includes(userProfile.role)}
                >
                  Edit Organization
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={false}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {/* Permission Notice */}
            {(!userProfile.role || !["superadmin", "admin"].includes(userProfile.role)) && (
              <p className="text-sm text-muted-foreground">
                Only administrators can edit organization settings.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Logo Preview Card */}
      {formData.logo && (
        <Card>
          <CardHeader>
            <CardTitle>Logo Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <img
                src={formData.logo}
                alt="Organization Logo"
                className="h-16 w-16 object-contain border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="text-sm text-muted-foreground">
                This is how your logo will appear in the application.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationView;