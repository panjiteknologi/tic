import { env } from "@/env";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 client
export const s3Client = new S3Client({
  region: env.AWS_REGION || "auto",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: env.AWS_S3_URL,
  forcePathStyle: true,
});

const BUCKET_NAME = env.AWS_S3_BUCKET_NAME!;
const S3_URL = env.AWS_S3_URL!;

export interface UploadOptions {
  key: string;
  contentType: string;
  expiresIn?: number; // in seconds, default 1 hour
}

export interface DeleteOptions {
  key: string;
}

// Generate presigned URL for upload
export async function generatePresignedUploadUrl(options: UploadOptions) {
  const { key, contentType, expiresIn = 3600 } = options;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    const result = {
      presignedUrl,
      key,
      publicUrl: `${S3_URL}/${BUCKET_NAME}/${key}`,
    };

    return result;
  } catch (error) {
    throw error;
  }
}

// Generate presigned URL for download/view
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn = 3600
) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn,
  });

  return presignedUrl;
}

// Delete object from S3
export async function deleteS3Object(options: DeleteOptions) {
  const { key } = options;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  return { success: true };
}

// Helper function to generate tenant logo key
export function generateTenantLogoKey(
  tenantId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const extension = fileName.split(".").pop();
  return `tenant-logos/${tenantId}/${timestamp}.${extension}`;
}

// Helper function to validate file type for logos
export function validateLogoFileType(contentType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  return allowedTypes.includes(contentType.toLowerCase());
}

// Helper function to validate file size (in bytes)
export function validateFileSize(
  fileSize: number,
  maxSize = 5 * 1024 * 1024
): boolean {
  return fileSize <= maxSize; // Default 5MB max
}
