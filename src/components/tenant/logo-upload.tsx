"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";

interface TenantLogoUploadProps {
  tenantId: string;
  currentLogoUrl?: string | null;
  onLogoUpdated?: (logoUrl: string | null) => void;
}

const TenantLogoUpload = ({ 
  tenantId, 
  currentLogoUrl, 
  onLogoUpdated 
}: TenantLogoUploadProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  // tRPC mutations
  const generateUploadUrl = trpc.tenant.generateLogoUploadUrl.useMutation();
  const updateLogo = trpc.tenant.updateLogo.useMutation();
  const removeLogo = trpc.tenant.removeLogo.useMutation();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
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

  const handleCancelUpload = () => {
    setLogoFile(null);
    setLogoPreview(currentLogoUrl || null);
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) return;

    try {
      setUploadingLogo(true);
      
      // Generate presigned upload URL
      const uploadData = await generateUploadUrl.mutateAsync({
        tenantId,
        fileName: logoFile.name,
        fileSize: logoFile.size,
        contentType: logoFile.type,
      });

      if (!uploadData.success) {
        throw new Error('Failed to generate upload URL');
      }

      // Upload file to S3
      const uploadResponse = await fetch(uploadData.uploadData.presignedUrl, {
        method: 'PUT',
        body: logoFile,
        headers: {
          'Content-Type': logoFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Update tenant with logo
      const updateResult = await updateLogo.mutateAsync({
        tenantId,
        logoUrl: uploadData.uploadData.publicUrl,
        s3Key: uploadData.uploadData.key,
      });

      if (updateResult.success) {
        toast.success('Logo updated successfully!');
        setLogoFile(null);
        onLogoUpdated?.(uploadData.uploadData.publicUrl);
        
        // Reset file input
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error('Failed to update tenant with logo');
      }
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
      handleCancelUpload();
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return;

    try {
      setRemovingLogo(true);
      
      const result = await removeLogo.mutateAsync({ tenantId });
      
      if (result.success) {
        toast.success('Logo removed successfully!');
        setLogoPreview(null);
        setLogoFile(null);
        onLogoUpdated?.(null);
        
        // Reset file input
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error: any) {
      console.error('Logo removal error:', error);
      toast.error(error.message || 'Failed to remove logo');
    } finally {
      setRemovingLogo(false);
    }
  };

  const hasChanges = logoFile !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Organization Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 relative"
          >
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-24 w-24 object-contain rounded"
                />
                {hasChanges && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                    New
                  </div>
                )}
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
              id="logo-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleLogoUpload}
              disabled={uploadingLogo || removingLogo}
            />
          </label>
        </div>

        {uploadingLogo && (
          <p className="text-sm text-blue-600 text-center">Uploading logo...</p>
        )}

        {removingLogo && (
          <p className="text-sm text-red-600 text-center">Removing logo...</p>
        )}

        <div className="flex gap-2 justify-center">
          {hasChanges && (
            <>
              <Button 
                onClick={handleSaveLogo}
                disabled={uploadingLogo || removingLogo}
                size="sm"
              >
                Save Logo
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancelUpload}
                disabled={uploadingLogo || removingLogo}
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
          
          {currentLogoUrl && !hasChanges && (
            <Button 
              variant="destructive"
              onClick={handleRemoveLogo}
              disabled={uploadingLogo || removingLogo}
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove Logo
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          {hasChanges 
            ? "Click 'Save Logo' to upload your new logo" 
            : "Click to upload or drag and drop your logo file"
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default TenantLogoUpload;