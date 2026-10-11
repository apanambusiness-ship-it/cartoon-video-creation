#!/usr/bin/env python3
"""Generate origin-root Digital Asset Links for a Play-signed Android app."""
import argparse
import json
import re

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("package_id", help="Permanent Android application ID from Play Console")
parser.add_argument("play_app_signing_sha256", help="SHA-256 fingerprint of Play's app signing certificate")
args = parser.parse_args()

if not re.fullmatch(r"[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}", args.package_id):
    parser.error("Use the final Android application ID, for example in.apanam.studio")
fingerprint = args.play_app_signing_sha256.upper()
if not re.fullmatch(r"[A-F0-9]{2}(?::[A-F0-9]{2}){31}", fingerprint):
    parser.error("Use the 32-byte colon-separated SHA-256 Play app signing fingerprint")

print(json.dumps([{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
        "namespace": "android_app",
        "package_name": args.package_id,
        "sha256_cert_fingerprints": [fingerprint]
    }
}], indent=2))
