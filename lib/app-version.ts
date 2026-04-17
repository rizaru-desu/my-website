import packageJson from "@/package.json";

export type AppVersionInfo = {
  buildTimestamp: string | null;
  commitSha: string | null;
  release: string;
  shortCommitSha: string | null;
  sourceVersion: string;
};

function normalizeOptionalValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getAppVersionInfo(): AppVersionInfo {
  const sourceVersion = packageJson.version;
  const release =
    normalizeOptionalValue(process.env.NEXT_PUBLIC_APP_VERSION) ||
    normalizeOptionalValue(process.env.RELEASE_VERSION) ||
    sourceVersion;
  const commitSha =
    normalizeOptionalValue(process.env.VERCEL_GIT_COMMIT_SHA) ||
    normalizeOptionalValue(process.env.GITHUB_SHA) ||
    normalizeOptionalValue(process.env.NEXT_PUBLIC_GIT_SHA);
  const buildTimestamp =
    normalizeOptionalValue(process.env.NEXT_PUBLIC_BUILD_TIMESTAMP) ||
    normalizeOptionalValue(process.env.BUILD_TIMESTAMP) ||
    normalizeOptionalValue(process.env.VERCEL_GIT_COMMIT_DATE);

  return {
    buildTimestamp,
    commitSha,
    release,
    shortCommitSha: commitSha ? commitSha.slice(0, 7) : null,
    sourceVersion,
  };
}

export function formatAppVersionLabel(version: AppVersionInfo) {
  return version.shortCommitSha
    ? `v${version.release} (${version.shortCommitSha})`
    : `v${version.release}`;
}
