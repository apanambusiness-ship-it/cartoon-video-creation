"""Upload only the encrypted Studio backup to a private Google Drive folder.

Requires a user-approved OAuth refresh token with the drive.file scope. The
folder is created by this app, so the token cannot browse unrelated Drive data.
"""
import hashlib
import json
import os
import urllib.parse
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path("private-backup-output")
ARCHIVE = ROOT / "APANAMai-private-backup.tar.gpg"
CHECKSUM = ROOT / "SHA256SUMS"
FOLDER = "APANAMai Encrypted Backups"
API = "https://www.googleapis.com/drive/v3/files"


def request(url, token, method="GET", body=None, content_type="application/json"):
    headers = {"Authorization": "Bearer " + token}
    if body is not None:
        headers["Content-Type"] = content_type
    with urllib.request.urlopen(urllib.request.Request(url, data=body, headers=headers, method=method), timeout=120) as response:
        return json.load(response)


def token():
    fields = {"client_id": os.environ["STUDIO_DRIVE_CLIENT_ID"],
              "client_secret": os.environ["STUDIO_DRIVE_CLIENT_SECRET"],
              "refresh_token": os.environ["STUDIO_DRIVE_REFRESH_TOKEN"],
              "grant_type": "refresh_token"}
    data = urllib.parse.urlencode(fields).encode()
    with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=data), timeout=30) as response:
        return json.load(response)["access_token"]


def folder_id(access):
    query = urllib.parse.urlencode({"q": "name = '" + FOLDER + "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                                    "fields": "files(id,name)", "spaces": "drive"})
    existing = request(API + "?" + query, access)["files"]
    if existing:
        return existing[0]["id"]
    body = json.dumps({"name": FOLDER, "mimeType": "application/vnd.google-apps.folder"}).encode()
    return request(API + "?fields=id", access, "POST", body)["id"]


def upload(path, name, parent, access):
    meta = json.dumps({"name": name, "parents": [parent], "description": "Encrypted APANAMai backup; retain recovery password separately"}).encode()
    size = path.stat().st_size
    start = urllib.request.Request("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size,md5Checksum",
        data=meta, method="POST", headers={"Authorization": "Bearer " + access,
        "Content-Type": "application/json", "X-Upload-Content-Type": "application/octet-stream",
        "X-Upload-Content-Length": str(size)})
    with urllib.request.urlopen(start, timeout=30) as response:
        session = response.headers["Location"]
    if not session.startswith("https://www.googleapis.com/upload/drive/"):
        raise RuntimeError("Unexpected Drive upload destination")
    md5 = hashlib.md5()
    result = None
    with path.open("rb") as source:
        offset = 0
        while offset < size:
            chunk = source.read(8 * 1024 * 1024)
            md5.update(chunk)
            end = offset + len(chunk) - 1
            part = urllib.request.Request(session, data=chunk, method="PUT", headers={
                "Content-Type": "application/octet-stream", "Content-Length": str(len(chunk)),
                "Content-Range": f"bytes {offset}-{end}/{size}"})
            try:
                with urllib.request.urlopen(part, timeout=120) as response:
                    result = json.load(response)
            except urllib.error.HTTPError as error:
                if error.code != 308 or error.headers.get("Range") != f"bytes=0-{end}":
                    raise
            offset = end + 1
    if result is None or int(result["size"]) != size or result["md5Checksum"] != md5.hexdigest():
        raise RuntimeError("Drive returned a mismatched upload checksum")
    print("Verified Drive upload: " + name + " (" + str(size) + " bytes)")


def main():
    expected = CHECKSUM.read_text().split()[0]
    digest = hashlib.sha256()
    with ARCHIVE.open("rb") as source:
        for block in iter(lambda: source.read(8 * 1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest() != expected:
        raise RuntimeError("Local encrypted archive checksum mismatch")
    access = token()
    parent = folder_id(access)
    run_id = os.environ["GITHUB_RUN_ID"]
    upload(ARCHIVE, "APANAMai-private-" + run_id + ".tar.gpg", parent, access)
    upload(CHECKSUM, "APANAMai-private-" + run_id + "-SHA256SUMS", parent, access)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        if isinstance(error, KeyError) and error.args and str(error.args[0]).startswith("STUDIO_DRIVE_"):
            reason = "MISSING_OAUTH_SECRET"
        elif isinstance(error, urllib.error.HTTPError):
            reason = "GOOGLE_HTTP_" + str(error.code)
        elif isinstance(error, urllib.error.URLError):
            reason = "GOOGLE_NETWORK_ERROR"
        elif isinstance(error, RuntimeError):
            reason = str(error)
        else:
            reason = "DRIVE_UPLOAD_ERROR"
        print("Google Drive backup failed: " + reason + ". GitHub encrypted artifact remains available.")
        raise SystemExit(1)
