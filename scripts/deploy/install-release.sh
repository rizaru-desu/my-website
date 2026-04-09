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

mkdir -p "$releases_dir" "$shared_dir" "$release_dir/logs"

if [ -f "${shared_dir}/.env" ]; then
  ln -sfn "${shared_dir}/.env" "${release_dir}/.env"
fi

ln -sfn "$release_dir" "$current_link"

cd "$current_link"
pm2 startOrReload ecosystem.config.js --update-env

if command -v pm2 >/dev/null 2>&1; then
  pm2 save
fi

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
