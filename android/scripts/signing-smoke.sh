#!/usr/bin/env bash
# Disposable CI fixture only. Never upload this key or bundle to Google Play.
set -euo pipefail
fixture_dir="$(mktemp -d)"
trap 'rm -rf "$fixture_dir"; rm -f android/app/build/outputs/bundle/release/app-release.aab' EXIT
if STUDIO_PLAY_BUILD=true gradle -p android help --no-daemon >"$fixture_dir/missing.log" 2>&1; then
  echo "Missing signing inputs were wrongly accepted"; exit 1
fi
if ! rg -q 'Missing Play release setting:' "$fixture_dir/missing.log"; then
  echo "Expected missing-signing guard did not run"; exit 1
fi
keytool -genkeypair -alias ci-fixture-only -keyalg RSA -keysize 2048 -validity 30 \
  -keystore "$fixture_dir/fixture.jks" -storepass fixture-only-123 -keypass fixture-only-123 \
  -dname "CN=CI fixture - never publish" >/dev/null 2>&1
export STUDIO_PLAY_BUILD=true
export STUDIO_PLAY_APPLICATION_ID=in.apanam.studio.cifixture
export STUDIO_PLAY_VERSION_CODE=1 STUDIO_PLAY_VERSION_NAME=ci-fixture-only
export STUDIO_UPLOAD_KEYSTORE="$fixture_dir/fixture.jks"
export STUDIO_UPLOAD_STORE_PASSWORD=fixture-only-123 STUDIO_UPLOAD_KEY_PASSWORD=fixture-only-123
export STUDIO_UPLOAD_KEY_ALIAS=ci-fixture-only
gradle -p android bundleRelease --no-daemon
python3 android/scripts/verify-bundle.py android/app/build/outputs/bundle/release/app-release.aab
echo "PASS: missing signing inputs rejected; disposable signed build verified; fixture removed."
