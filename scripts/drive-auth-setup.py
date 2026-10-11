"""One-time owner-side OAuth setup for APANAMai encrypted Drive backups.

Run only on your own computer. Never commit the downloaded OAuth client JSON
or paste the resulting refresh token into chat.
"""
import json
import sys
from pathlib import Path

SCOPE = "https://www.googleapis.com/auth/drive.file"


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/drive-auth-setup.py path/to/desktop-oauth-client.json")
    client = Path(sys.argv[1])
    info = json.loads(client.read_text())
    installed = info.get("installed") or {}
    if not installed.get("client_id") or not installed.get("client_secret"):
        raise SystemExit("Download a Google OAuth Desktop client JSON file first.")
    from google_auth_oauthlib.flow import InstalledAppFlow
    flow = InstalledAppFlow.from_client_secrets_file(str(client), [SCOPE])
    credentials = flow.run_local_server(port=0, open_browser=True,
                                        authorization_prompt_message="Approve Drive file creation in your own Google account: {url}",
                                        success_message="Google Drive approval complete. Return to the terminal.",
                                        access_type="offline", prompt="consent")
    if not credentials.refresh_token:
        raise SystemExit("Google did not issue a refresh token. Recheck OAuth consent setup.")
    print("\nAdd these as GitHub Actions repository secrets (do not send them in chat):")
    for name, value in [("STUDIO_DRIVE_CLIENT_ID", installed["client_id"]),
                        ("STUDIO_DRIVE_CLIENT_SECRET", installed["client_secret"]),
                        ("STUDIO_DRIVE_REFRESH_TOKEN", credentials.refresh_token)]:
        print(name + "=" + value)
    print("\nAfter all three secrets are saved, set repository variable STUDIO_GOOGLE_DRIVE_BACKUP_ENABLED=true.")


if __name__ == "__main__":
    main()
