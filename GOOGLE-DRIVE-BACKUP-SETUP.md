# Automatic encrypted Studio backup to personal Google Drive

The existing `studio-private-backup.yml` job first creates a GPG-encrypted archive and uploads a GitHub Actions artifact. When enabled, a later step copies only the `.tar.gpg` file and `SHA256SUMS` to a private folder named `APANAMai Encrypted Backups` in the owner's Google Drive. Upload size and MD5 are verified. No database dump, media plaintext, or backup password is sent to Drive.

## One-time owner setup

1. Use a Google Cloud project you control. Enable **Google Drive API**. Configure its OAuth consent screen for your own Google account. Publish the OAuth app to **Production** before relying on daily automation: external apps left in **Testing** issue short-lived refresh tokens. Request only `https://www.googleapis.com/auth/drive.file`.
2. Create an **OAuth Client ID → Desktop app** and download its client JSON onto your own computer. Do not upload this JSON to the repository or chat.
3. On your own computer, with Python installed, run `python -m pip install google-auth-oauthlib`, then `python scripts/drive-auth-setup.py PATH_TO_DOWNLOADED_CLIENT_JSON`. Sign in to the intended Google account and approve the Drive file permission. The helper prints three values in your terminal.
4. In this repository's **Settings → Secrets and variables → Actions → Repository secrets**, set `STUDIO_DRIVE_CLIENT_ID`, `STUDIO_DRIVE_CLIENT_SECRET` and `STUDIO_DRIVE_REFRESH_TOKEN` to the printed values. Keep them out of chat, screenshots and source control.
5. Only after all three secrets exist, create repository variable `STUDIO_GOOGLE_DRIVE_BACKUP_ENABLED` with value `true`. Run **Studio encrypted database and media backup** manually on `main`. Check both the `backup` job and its **Copy encrypted backup to private Google Drive folder** step. Verify both files in the private Drive folder. Keep the separate backup decryption password in a password manager, not in Drive.
6. Test a download and checksum verification from Drive, then conduct recovery in an isolated compatible environment before depending on this as a recovery plan.

The source-code backup is a separate GitHub workflow. This Drive step copies the encrypted database/media archive, not the source repository or browser-only poster/video drafts. It does not delete older Drive files; monitor available storage. GitHub retains its own artifact for 30 days. If the Drive step fails, the encrypted GitHub artifact from that run remains available; fix authorization or storage and rerun after checking for any partial duplicate. Revoking the Google authorization or changing the OAuth client invalidates the stored refresh token. If the folder is deleted, the next successful upload creates a new app-owned folder.

To suspend Drive uploads, set `STUDIO_GOOGLE_DRIVE_BACKUP_ENABLED=false`; the original encrypted GitHub artifact workflow continues.
