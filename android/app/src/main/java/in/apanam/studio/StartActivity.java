package in.apanam.studio;

import android.app.Activity;
import android.os.Bundle;
import android.window.OnBackInvokedDispatcher;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class StartActivity extends Activity {
    private WebView webView;

    @Override public void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        // Always fetch the current GitHub Pages UI instead of a stale WebView copy.
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        setContentView(webView);
        webView.clearCache(true);
        // Load the canonical Pages URL. A changing query string can break app-side URL/state assumptions.
        webView.loadUrl(BuildConfig.STUDIO_URL);
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                () -> handleStudioBack()
            );
        }
    }

    private void handleStudioBack() {
        webView.evaluateJavascript(
            "(function(){var b=document.body;if(b&&b.classList.contains('studio-home-dismissed')){b.classList.remove('studio-home-dismissed');document.querySelectorAll('dialog[open]').forEach(function(d){try{d.close()}catch(e){}});var t=document.getElementById('studioMobileTypingPanel');if(t)t.hidden=true;var a=document.activeElement;if(a&&a.blur)a.blur();window.scrollTo(0,0);return 'home';}return 'none';})()",
            value -> {
                if (!"\"home\"".equals(value)) {
                    if (webView.canGoBack()) webView.goBack();
                    else finish();
                }
            }
        );
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

}
