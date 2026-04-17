#!/usr/bin/env bash

set -euo pipefail

app_root="${1:?Usage: install-release.sh <app-root> <release-name>}"
release_name="${2:?Usage: install-release.sh <app-root> <release-name>}"
keep_releases="${KEEP_RELEASES:-5}"

releases_dir="${app_root}/releases"
release_dir="${releases_dir}/${release_name}"
shared_dir="${app_root}/shared"
current_link="${app_root}/current"
current_version_file="${app_root}/CURRENT_VERSION"
current_release_json="${app_root}/current-release.json"
shared_env_file="${shared_dir}/.env.production"
release_env_file="${release_dir}/.env.production"

mkdir -p "$releases_dir" "$shared_dir" "$release_dir/logs"

if [ ! -f "$shared_env_file" ]; then
  echo "Missing production environment file: ${shared_env_file}" >&2
  exit 1
fi

rm -f "${release_dir}/.env"
ln -sfn "$shared_env_file" "$release_env_file"

ln -sfn "$release_dir" "$current_link"

cd "$current_link"
if ! command -v pm2 >/dev/null 2>&1; then
  echo "PM2 is not installed on the server. Install PM2 before activating this release." >&2
  exit 1
fi

set -a
. "$release_env_file"
set +a

pm2 startOrReload ecosystem.config.js --env production --update-env
pm2 save

if [ -f "${release_dir}/VERSION" ]; then
  cp "${release_dir}/VERSION" "$current_version_file"
fi

if [ -f "${release_dir}/RELEASE.json" ]; then
  cp "${release_dir}/RELEASE.json" "$current_release_json"
fi

if [ "$keep_releases" -gt 0 ]; then
  ls -1dt "${releases_dir}"/* 2>/dev/null | tail -n +"$((keep_releases + 1))" | xargs -r rm -rf
fi

active_version="$release_name"
if [ -f "${release_dir}/VERSION" ]; then
  active_version="$(cat "${release_dir}/VERSION")"
fi

echo "Activated release ${active_version} (${release_name}) at ${current_link}"
