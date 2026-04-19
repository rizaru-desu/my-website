import "server-only";

import { Readable } from "node:stream";

import { RESUME_STORAGE_FILE_NAME } from "@/lib/resume.shared";

type ResumeR2Config = {
  accountId: string;
  accessKeyId: string;
  bucketName: string;
  publicBaseUrl: string;
  resumePrefix: string;
  secretAccessKey: string;
};

type ResumeR2Module = typeof import("@aws-sdk/client-s3");

export type ResumeR2Download = {
  body: ReadableStream<Uint8Array>;
  contentLength: number | null;
  contentType: string | null;
  etag: string | null;
  fileName: string;
  lastModified: string | null;
};

let cachedResumeR2Client: InstanceType<ResumeR2Module["S3Client"]> | null = null;
let cachedResumeR2ModulePromise: Promise<ResumeR2Module> | null = null;

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getResumeR2Config(): ResumeR2Config {
  const config = {
    accountId: readEnv("CLOUDFLARE_R2_ACCOUNT_ID"),
    accessKeyId: readEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    bucketName: readEnv("CLOUDFLARE_R2_BUCKET_NAME"),
    publicBaseUrl: readEnv("CLOUDFLARE_R2_PUBLIC_URL"),
    resumePrefix: readEnv("CLOUDFLARE_R2_RESUME_PREFIX"),
    secretAccessKey: readEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
  };

  const missing = Object.entries(config)
    .filter(([key]) => key !== "resumePrefix")
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

async function getResumeR2Module() {
  if (!cachedResumeR2ModulePromise) {
    cachedResumeR2ModulePromise = import("@aws-sdk/client-s3");
  }

  return cachedResumeR2ModulePromise;
}

async function getResumeR2Client(config: ResumeR2Config) {
  if (cachedResumeR2Client) {
    return cachedResumeR2Client;
  }

  const { S3Client } = await getResumeR2Module();

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

function normalizeResumePrefix(prefix: string, bucketName: string) {
  const segments = prefix
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments[0] === bucketName) {
    segments.shift();
  }

  return segments.join("/");
}

function buildResumeObjectKey(config: ResumeR2Config) {
  const normalizedPrefix = normalizeResumePrefix(
    config.resumePrefix,
    config.bucketName,
  );

  return normalizedPrefix
    ? `${normalizedPrefix}/${RESUME_STORAGE_FILE_NAME}`
    : RESUME_STORAGE_FILE_NAME;
}

function buildPublicResumeUrl(config: ResumeR2Config) {
  return `${config.publicBaseUrl.replace(/\/+$/, "")}/${buildResumeObjectKey(config)}`;
}

function toWebReadableStream(body: unknown) {
  if (!body) {
    throw new Error("Cloudflare R2 returned an empty response body.");
  }

  if (body instanceof ReadableStream) {
    return body;
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "transformToWebStream" in body &&
    typeof body.transformToWebStream === "function"
  ) {
    return body.transformToWebStream();
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  if (body instanceof Uint8Array) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(body);
        controller.close();
      },
    });
  }

  throw new Error("Cloudflare R2 returned a response body that could not be streamed.");
}

export function isManagedResumeR2Url(downloadUrl: string) {
  const config = getOptionalResumeR2Config();

  if (!config) {
    return false;
  }

  const objectKey = buildResumeObjectKey(config);

  try {
    const url = new URL(downloadUrl);
    return url.pathname.replace(/^\/+/, "") === objectKey;
  } catch {
    return false;
  }
}

export async function uploadResumePdfToR2(file: File) {
  const config = getResumeR2Config();
  const [{ PutObjectCommand }, client] = await Promise.all([
    getResumeR2Module(),
    getResumeR2Client(config),
  ]);
  const body = Buffer.from(await file.arrayBuffer());
  const objectKey = buildResumeObjectKey(config);

  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: config.bucketName,
      CacheControl: "public, max-age=300",
      ContentDisposition: `inline; filename="${RESUME_STORAGE_FILE_NAME}"`,
      ContentType: "application/pdf",
      Key: objectKey,
    }),
  );

  return {
    downloadUrl: buildPublicResumeUrl(config),
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

  const [{ DeleteObjectCommand }, client] = await Promise.all([
    getResumeR2Module(),
    getResumeR2Client(config),
  ]);
  const objectKey = buildResumeObjectKey(config);

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
    }),
  );
}

export async function downloadResumePdfFromR2(): Promise<ResumeR2Download> {
  const config = getResumeR2Config();
  const [{ GetObjectCommand }, client] = await Promise.all([
    getResumeR2Module(),
    getResumeR2Client(config),
  ]);
  const objectKey = buildResumeObjectKey(config);
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
    }),
  );

  return {
    body: toWebReadableStream(response.Body),
    contentLength: response.ContentLength ?? null,
    contentType: response.ContentType ?? "application/pdf",
    etag: response.ETag ?? null,
    fileName: RESUME_STORAGE_FILE_NAME,
    lastModified: response.LastModified?.toISOString() ?? null,
  };
}
