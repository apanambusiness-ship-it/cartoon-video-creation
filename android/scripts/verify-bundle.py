#!/usr/bin/env python3
"""Reject unsigned or invalid AABs; no credentials are read or printed."""
import subprocess
import sys
import zipfile
from pathlib import Path

bundle = Path(sys.argv[1])
with zipfile.ZipFile(bundle) as archive:
    names = archive.namelist()
    if not any(n.startswith("META-INF/") and n.upper().endswith((".RSA", ".DSA", ".EC")) for n in names):
        raise SystemExit("Bundle has no signing certificate; refusing release artifact.")
result = subprocess.run(
    ["jarsigner", "-J-Duser.language=en", "-J-Duser.country=US", "-verify", str(bundle)],
    capture_output=True, text=True,
)
if result.returncode != 0 or "jar verified." not in result.stdout:
    raise SystemExit("Bundle signature verification failed.")
print("Signed AAB verified. This does not establish Play Store readiness.")
