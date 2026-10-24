# Android test build
This is an embedded WebView Android test app, not a Play Store release.
Test application ID: `in.apanam.studio.test2`; Java namespace: `in.apanam.studio`. Android 7+ (API 24), target API 36.
The Android workflow creates a debug-signed APK and an **unsigned** release AAB. No owner upload key is generated, requested or placed in source.

The default test launcher opens `https://apanambusiness-ship-it.github.io/cartoon-video-creation/`; owner-signed review builds require an explicit validated HTTPS site URL. The launcher uses an Android WebView with a system file chooser for upload inputs. The manifest does not claim verified TWA ownership. Website changes remain available through the browser, with the same download, audio, login and offline behavior to verify on a real device. Android System WebView is required.

The native wrapper forwards file selections and cancellation to the web editor, restores page history after recreation, and supports Android back navigation. On Android 11+ it reserves space for system bars and the keyboard. Actual gallery upload, camera capture, blob downloads, sharing and audio still need device acceptance tests.

Build: JDK17, Gradle8.13, Android SDK36, AGP8.13.2. Before local build copy `../apanam-app-icon-192.png` to `app/src/main/res/drawable/studio_icon.png`, then `gradle assembleDebug bundleRelease lintDebug` from this directory.

Before Play submission: owner-controlled signing, origin association using Play app-signing certificate, eligible billing solution for digital membership/AI, actual device/export/share tests, deletion cleanup rehearsal, current Play Console target/test/Data Safety requirements. Debug APK is for private testing only. Unsigned AAB cannot be uploaded as a finished release.

Test package `in.apanam.studio.test2` remains unchanged; version 3 contains the picker fix. The CI debug signing key may differ from an installed test build. Do not uninstall a working app before exporting local designs.

Release preparation, store listing draft, Data Safety inventory and real-phone checklist: [PLAY-RELEASE-PREP.md](PLAY-RELEASE-PREP.md).
