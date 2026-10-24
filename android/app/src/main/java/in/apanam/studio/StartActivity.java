package in.apanam.studio;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.ClipData;
import java.util.ArrayList;
import android.net.Uri;
import android.os.Build;
import android.webkit.ValueCallback;
import android.widget.Toast;
import android.view.WindowInsets;
import android.graphics.Color;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

public class StartActivity extends Activity {
    private WebView webView;
    static final int PICK_FILE = 4101;
    private ValueCallback<Uri[]> pendingFiles;

    private void finishFileSelection(Uri[] files) {
        ValueCallback<Uri[]> callback = pendingFiles;
        pendingFiles = null;
        if (callback != null) callback.onReceiveValue(files);
    }

    boolean chooseFiles(ValueCallback<Uri[]> callback, WebChromeClient.FileChooserParams params) {
        finishFileSelection(null);
        pendingFiles = callback;
        try {
            Intent picker = params.createIntent();
            picker.addCategory(Intent.CATEGORY_OPENABLE);
            startActivityForResult(picker, PICK_FILE);
        } catch (ActivityNotFoundException | SecurityException error) {
            finishFileSelection(null);
            Toast.makeText(this, "फाइल चुनने वाला ऐप उपलब्ध नहीं है। Files ऐप चालू करें।", Toast.LENGTH_LONG).show();
        }
        return true;
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE) {
            finishFileSelection(selectedFiles(resultCode, data));
        }
    }

    static Uri[] selectedFiles(int resultCode, Intent data) {
        if (resultCode != RESULT_OK || data == null) return null;
        ArrayList<Uri> files = new ArrayList<>();
        ClipData clips = data.getClipData();
        if (clips != null) {
            for (int i = 0; i < clips.getItemCount(); i++) {
                Uri uri = clips.getItemAt(i).getUri();
                if (uri != null && "content".equals(uri.getScheme())) files.add(uri);
            }
        } else if (data.getData() != null && "content".equals(data.getData().getScheme())) {
            files.add(data.getData());
        }
        return files.isEmpty() ? null : files.toArray(new Uri[0]);
    }

    private void navigateBack() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finish();
    }

    @Override protected void onDestroy() {
        finishFileSelection(null);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    @Override public void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                    FileChooserParams params) {
                return chooseFiles(callback, params);
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showLoadError(error != null ? error.getDescription().toString() : "Unknown error");
            }
        });
        setContentView(webView);
        // Android 15+ draws edge-to-edge: keep controls clear of system bars and keyboard.
        if (Build.VERSION.SDK_INT >= 30) {
            webView.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets safe = insets.getInsets(WindowInsets.Type.systemBars()
                        | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::navigateBack);
        }
        if (savedState == null || webView.restoreState(savedState) == null) {
            webView.loadUrl(BuildConfig.STUDIO_URL);
        }
    }

    private void showLoadError(String detail) {
        TextView message = new TextView(this);
        message.setText("APANAM AI Studio could not load.\n\n" + detail + "\n\nCheck internet connection and Android System WebView, then reopen the app.");
        message.setTextSize(18);
        message.setTextColor(Color.BLACK);
        message.setPadding(48, 64, 48, 64);
        message.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(message);
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }
}
