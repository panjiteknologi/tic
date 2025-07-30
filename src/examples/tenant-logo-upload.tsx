// Example usage for tenant logo upload using tRPC

// Frontend implementation example (React/Next.js)
import { trpc } from "@/trpc/react";

export function TenantLogoUpload({ tenantId }: { tenantId: string }) {
  const generateUploadUrl = trpc.tenant.generateLogoUploadUrl.useMutation();
  const updateLogo = trpc.tenant.updateLogo.useMutation();
  const removeLogo = trpc.tenant.removeLogo.useMutation();

  const handleFileUpload = async (file: File) => {
    try {
      // Step 1: Generate presigned upload URL
      const uploadData = await generateUploadUrl.mutateAsync({
        tenantId,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });

      if (!uploadData.success) {
        throw new Error("Failed to generate upload URL");
      }

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadData.uploadData.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // Step 3: Update tenant with new logo URL
      const updateResult = await updateLogo.mutateAsync({
        tenantId,
        logoUrl: uploadData.uploadData.publicUrl,
        s3Key: uploadData.uploadData.key,
      });

      if (updateResult.success) {
        console.log("Logo uploaded successfully:", updateResult.tenant);
        // Refresh tenant data or update UI
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const result = await removeLogo.mutateAsync({ tenantId });
      if (result.success) {
        console.log("Logo removed successfully");
        // Refresh tenant data or update UI
      }
    } catch (error) {
      console.error("Error removing logo:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />
      <button onClick={handleRemoveLogo}>Remove Logo</button>
    </div>
  );
}

// Alternative using React Hook Form
import { useForm } from "react-hook-form";

export function TenantLogoUploadForm({ tenantId }: { tenantId: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ logo: FileList }>();
  const generateUploadUrl = trpc.tenant.generateLogoUploadUrl.useMutation();
  const updateLogo = trpc.tenant.updateLogo.useMutation();

  const onSubmit = async (data: { logo: FileList }) => {
    const file = data.logo[0];
    if (!file) return;

    try {
      // Generate upload URL
      const uploadData = await generateUploadUrl.mutateAsync({
        tenantId,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });

      // Upload to S3
      const uploadResponse = await fetch(uploadData.uploadData.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Update tenant
      await updateLogo.mutateAsync({
        tenantId,
        logoUrl: uploadData.uploadData.publicUrl,
        s3Key: uploadData.uploadData.key,
      });

      console.log("Logo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        {...register("logo", {
          required: "Please select a logo file",
          validate: {
            fileSize: (files: FileList) => {
              const file = files[0];
              if (file && file.size > 5 * 1024 * 1024) {
                return "File size must be less than 5MB";
              }
              return true;
            },
            fileType: (files: FileList) => {
              const file = files[0];
              const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml",
              ];
              if (file && !allowedTypes.includes(file.type)) {
                return "Only image files are allowed";
              }
              return true;
            },
          },
        })}
      />
      {errors.logo && <p className="error">{errors.logo.message as string}</p>}
      <button
        type="submit"
        disabled={generateUploadUrl.isPending || updateLogo.isPending}
      >
        {generateUploadUrl.isPending || updateLogo.isPending
          ? "Uploading..."
          : "Upload Logo"}
      </button>
    </form>
  );
}

// Server-side usage example (if needed)
export async function uploadTenantLogoServerSide(tenantId: string, file: File) {
  // This would typically be done on the frontend, but here's how you could
  // do it server-side if needed

  const { trpc } = await import("@/trpc/react");

  const generateUploadUrl = trpc.tenant.generateLogoUploadUrl.useMutation();
  const updateLogo = trpc.tenant.updateLogo.useMutation();

  try {
    // Generate upload URL
    const uploadData = await generateUploadUrl.mutateAsync({
      tenantId,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });

    // Upload file (you'd need to implement the actual S3 upload logic here)
    // This is typically done on the frontend with fetch()

    // Update tenant with logo
    const result = await updateLogo.mutateAsync({
      tenantId,
      logoUrl: uploadData.uploadData.publicUrl,
      s3Key: uploadData.uploadData.key,
    });

    return result;
  } catch (error) {
    console.error("Server-side upload error:", error);
    throw error;
  }
}
