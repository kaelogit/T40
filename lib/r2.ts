import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getR2Endpoint, hasR2EnvConfig } from "@/lib/r2/env";

export { getR2Endpoint, getR2PublicHostname, hasR2EnvConfig } from "@/lib/r2/env";

let r2Client: S3Client | null = null;

export const R2_UPLOAD_FOLDERS = ["products", "blog", "content"] as const;
export type R2UploadFolder = (typeof R2_UPLOAD_FOLDERS)[number];

export function hasR2Config(): boolean {
  return hasR2EnvConfig();
}

function getR2Client(): S3Client | null {
  if (!hasR2Config()) return null;
  const endpoint = getR2Endpoint();
  if (!endpoint) return null;

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

export function getR2PublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}

export function normalizeR2Folder(folder: string | null | undefined): R2UploadFolder {
  if (folder && R2_UPLOAD_FOLDERS.includes(folder as R2UploadFolder)) {
    return folder as R2UploadFolder;
  }
  return "products";
}

export async function uploadToR2(
  file: Buffer,
  contentType: string,
  folder: R2UploadFolder = "products"
): Promise<{ url: string; key: string } | { error: string }> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket) {
    return { error: "R2 is not configured." };
  }

  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const key = `${folder}/${randomUUID()}.${ext}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );
    return { url: getR2PublicUrl(key), key };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return { error: message };
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket || !key) return;

  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    // Best-effort cleanup
  }
}

export function keyFromR2Url(url: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!base || !url.startsWith(base)) return null;
  return url.slice(base.length + 1);
}
