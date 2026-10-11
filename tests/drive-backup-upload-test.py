import hashlib
import importlib.util
import io
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("drive_backup", Path(__file__).with_name("drive-upload.py"))
drive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drive)


class Response(io.BytesIO):
    def __init__(self, data=b"", headers=None):
        super().__init__(data)
        self.headers = headers or {}


class DriveUploadTest(unittest.TestCase):
    def test_bad_checksum_prevents_oauth_and_upload(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / drive.ARCHIVE.name).write_bytes(b"encrypted")
            (root / drive.CHECKSUM.name).write_text("0" * 64 + "  archive\n")
            with patch.object(drive, "ARCHIVE", root / drive.ARCHIVE.name), patch.object(drive, "CHECKSUM", root / drive.CHECKSUM.name), patch.object(drive, "token") as token:
                with self.assertRaisesRegex(RuntimeError, "checksum mismatch"):
                    drive.main()
                token.assert_not_called()

    def test_resumable_chunks_and_returned_checksum(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "backup.gpg"
            data = b"x" * (8 * 1024 * 1024) + b"end"
            path.write_bytes(data)
            chunks = []

            def urlopen(req, timeout):
                if req.method == "POST":
                    self.assertIn(b'"parents": ["private-folder"]', req.data)
                    return Response(headers={"Location": "https://www.googleapis.com/upload/drive/v3/files?upload_id=test"})
                chunks.append(req.headers["Content-range"])
                if len(chunks) == 1:
                    raise urllib.error.HTTPError(req.full_url, 308, "Resume Incomplete", {"Range": "bytes=0-8388607"}, None)
                return Response(('{' + f'"size":"{len(data)}","md5Checksum":"{hashlib.md5(data).hexdigest()}"' + '}').encode())

            with patch.object(drive.urllib.request, "urlopen", side_effect=urlopen):
                drive.upload(path, "backup.gpg", "private-folder", "access-token")
            self.assertEqual(chunks, [f"bytes 0-8388607/{len(data)}", f"bytes 8388608-{len(data)-1}/{len(data)}"])


if __name__ == "__main__":
    unittest.main()
