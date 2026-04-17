#!/usr/bin/env bash

set -euo pipefail

artifact_name="${1:-next-standalone.tar.gz}"
release_version="${2:-${RELEASE_VERSION:-dev}}"
release_dir="build/release"
artifact_path="build/${artifact_name}"
build_timestamp="${BUILD_TIMESTAMP:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}"
git_sha="${GIT_SHA:-unknown}"

pnpm run build

rm -rf "$release_dir"
mkdir -p "$release_dir/.next" "build"

cp -R .next/standalone/. "$release_dir/"
cp -R .next/static "$release_dir/.next/static"
cp -R public "$release_dir/public"
cp ecosystem.config.js "$release_dir/ecosystem.config.js"
mkdir -p "$release_dir/scripts/deploy"
cp scripts/deploy/install-release.sh "$release_dir/scripts/deploy/install-release.sh"

cat > "$release_dir/VERSION" <<EOF
${release_version}
EOF

cat > "$release_dir/RELEASE.json" <<EOF
{
  "version": "${release_version}",
  "gitSha": "${git_sha}",
  "builtAt": "${build_timestamp}",
  "artifact": "${artifact_name}"
}
EOF

tar -C "$release_dir" -czf "$artifact_path" .

echo "Release artifact created at $artifact_path"
