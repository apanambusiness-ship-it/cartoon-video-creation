# Android test build
This is a browser-backed Android test launcher, not a Play Store release.
Package: `in.apanam.studio`, Android 6+ (API 23), target API 36.
The Android workflow creates a debug-signed APK and an **unsigned** release AAB. No owner upload key is generated, requested or placed in source.

The launcher uses Google's Android Browser Helper. Website changes remain available through the browser, with the same download, audio, login and offline behavior to verify on a real device. A supporting browser is required.

Without origin-root Digital Asset Links it falls back to a Custom Tab with a browser toolbar. GitHub Pages uses a project subpath; putting assetlinks under this project's subpath does not establish root ownership. No DNS or separate root repository is changed by this build.

Build: JDK17, Gradle8.13, Android SDK36, AGP8.13.2. Before local build copy `../apanam-app-icon-192.png` to `app/src/main/res/drawable/studio_icon.png`, then `gradle assembleDebug bundleRelease lintDebug` from this directory.

Before Play submission: owner-controlled signing, origin association using Play app-signing certificate, eligible billing solution for digital membership/AI, actual device/export/share tests, deletion cleanup rehearsal, current Play Console target/test/Data Safety requirements. Debug APK is for private testing only. Unsigned AAB cannot be uploaded as a finished release.
