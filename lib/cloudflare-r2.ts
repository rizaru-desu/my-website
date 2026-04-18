import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { RESUME_STORAGE_FILE_NAME } from "@/lib/resume.shared";

type ResumeR2Config = {
  accountId: string;
  accessKeyId: string;
  bucketName: string;
  publicBaseUrl: string;
  secretAccessKey: string;
};

let cachedResumeR2Client: S3Client | null = null;

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getResumeR2Config(): ResumeR2Config {
  const config = {
    accountId: readEnv("CLOUDFLARE_R2_ACCOUNT_ID"),
    accessKeyId: readEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    bucketName: readEnv("CLOUDFLARE_R2_BUCKET_NAME"),
    publicBaseUrl: readEnv("CLOUDFLARE_R2_PUBLIC_URL"),
    secretAccessKey: readEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Cloudflare R2 resume upload is not configured. Missing: ${missing.join(", ")}.`,
    );
  }

  return config;
}

function getOptionalResumeR2Config() {
  try {
    return getResumeR2Config();
  } catch {
    return null;
  }
}

function getResumeR2Client(config: ResumeR2Config) {
  if (cachedResumeR2Client) {
    return cachedResumeR2Client;
  }

  cachedResumeR2Client = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  });

  return cachedResumeR2Client;
}

function buildPublicResumeUrl(publicBaseUrl: string) {
  return `${publicBaseUrl.replace(/\/+$/, "")}/${RESUME_STORAGE_FILE_NAME}`;
}

export async function uploadResumePdfToR2(file: File) {
  const config = getResumeR2Config();
  const client = getResumeR2Client(config);
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: config.bucketName,
      CacheControl: "public, max-age=300",
      ContentDisposition: `inline; filename="${RESUME_STORAGE_FILE_NAME}"`,
      ContentType: "application/pdf",
      Key: RESUME_STORAGE_FILE_NAME,
    }),
  );

  return {
    downloadUrl: buildPublicResumeUrl(config.publicBaseUrl),
    fileName: RESUME_STORAGE_FILE_NAME,
    fileSizeBytes: body.byteLength,
    mimeType: "application/pdf",
  };
}

export async function deleteResumePdfFromR2() {
  const config = getOptionalResumeR2Config();

  if (!config) {
    return;
  }

  const client = getResumeR2Client(config);

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: RESUME_STORAGE_FILE_NAME,
    }),
  );
}
