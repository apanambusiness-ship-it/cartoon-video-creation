package in.apanam.studio;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.browser.customtabs.CustomTabsIntent;

public class StartActivity extends Activity {
    static final String STUDIO = "https://apanambusiness-ship-it.github.io/cartoon-video-creation/";
    TextView status;
    @Override public void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        int pad = (int)(24 * getResources().getDisplayMetrics().density);
        root.setPadding(pad, pad, pad, pad);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(pad + insets.getSystemWindowInsetLeft(), pad + insets.getSystemWindowInsetTop(), pad + insets.getSystemWindowInsetRight(), pad + insets.getSystemWindowInsetBottom());
            return insets;
        });
        TextView title = new TextView(this);
        title.setText("APANAMai Studio Test 2"); title.setTextSize(24); root.addView(title);
        status = new TextView(this);
        status.setText("Poster और video बनाने के लिए Studio खोलें।"); status.setTextSize(16); root.addView(status);
        Button open = new Button(this); open.setText("Studio खोलें"); open.setOnClickListener(v -> openStudio(false)); root.addView(open);
        Button fallback = new Button(this); fallback.setText("Browser में खोलें"); fallback.setOnClickListener(v -> openStudio(true)); root.addView(fallback);
        setContentView(root);
    }
    void openStudio(boolean plain) {
        try {
            Intent intent;
            if (plain) intent = new Intent(Intent.ACTION_VIEW, Uri.parse(STUDIO));
            else intent = new CustomTabsIntent.Builder().setShowTitle(true).build().intent.setData(Uri.parse(STUDIO));
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            launchBrowser(intent);
            status.setText("Studio browser में खुला। वापस आने पर फिर खोल सकते हैं।");
        } catch (ActivityNotFoundException error) {
            status.setText("फोन में कोई उपलब्ध browser नहीं मिला। Chrome या अपना browser चालू करें, फिर दोबारा दबाएँ।");
        } catch (SecurityException error) {
            status.setText("फोन ने browser खोलने की अनुमति नहीं दी। Browser में खोलें दबाएँ।");
        }
    }
    protected void launchBrowser(Intent intent) { startActivity(intent); }
}
